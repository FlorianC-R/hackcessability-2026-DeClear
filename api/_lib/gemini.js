// Server-side Gemini helper. Framework-independent core used by the Vercel
// serverless route (api/explain.js). Kept separate so it can be unit-tested
// with a mocked fetch and no real network or key.
//
// SECURITY: the API key is read from process.env only, never returned, never
// logged, and never placed in any response or error message.

import { normalizeResult, groundResult } from '../../src/services/resultSchema.js'
import { guidableTaskCatalog } from '../../src/data/guidanceTasks.js'

// Hard limits (also enforced client-side, re-checked here because the route is
// public and cannot trust the caller).
export const MAX_INPUT_CHARS = 5000
// Generous cap. Some Gemini "thinking" models (e.g. gemini-3.x flash) spend
// output tokens on an internal reasoning step before answering, so a small cap
// can leave no room for the actual JSON and return an empty result. We also ask
// the model to skip thinking (see thinkingConfig below); the larger cap is a
// safety net in case a model ignores that.
export const MAX_OUTPUT_TOKENS = 2048
// Gemini 3.x flash can occasionally be slow on a cold start. Vercel Hobby
// functions may run up to 60s, so we allow 45s before aborting to reduce
// spurious timeouts, while still bounding the request.
export const REQUEST_TIMEOUT_MS = 45000
// Transient failures (503 "high demand", or a timeout) are retried a couple of
// times with a short backoff, so a brief capacity spike does not surface as an
// error during a live demo.
export const MAX_ATTEMPTS = 3
export const RETRY_BACKOFF_MS = 1200

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// True for failures that are worth retrying: a 503 from Gemini, or a timeout.
function isRetryable(error) {
  return error?.upstreamStatus === 503 || error?.isTimeout === true
}

const SUPPORTED_LANGUAGES = { en: 'English', fr: 'French' }
const SUPPORTED_LEVELS = { brief: 'brief', standard: 'standard', guided: 'guided' }

// Build the strict, source-grounded instruction for the model. The model is
// told to quote evidence verbatim, to mark derived dates as calculations, and
// to express uncertainty rather than invent facts.
export function buildPrompt({ message, level, language }) {
  const langName = SUPPORTED_LANGUAGES[language] ?? 'English'
  const levelName = SUPPORTED_LEVELS[level] ?? 'standard'

  // The exact tasks DeClear can walk the user through. The model may only tag
  // an action with one of these taskType values.
  const catalog = guidableTaskCatalog()
  const catalogLines = catalog
    .map((t) => `  - "${t.taskType}": ${t.label}`)
    .join('\n')

  return `You help older adults understand a notification or message. Explain it in ${langName}, at a "${levelName}" level of detail, using short, plain sentences.

Return ONLY a JSON object with these exact fields:
{
  "title": string,
  "explanation": string,
  "actions": [{ "id": string, "text": string, "sourceText": string, "isDigitalTask": boolean, "taskType": string }],
  "dates": [{ "id": string, "label": string, "dateText": string, "isKnown": boolean, "sourceText": string, "isDerived": boolean }],
  "urgency": "None" | "Low" | "Medium" | "High",
  "uncertainties": [{ "targetKind": "explanation"|"requiredAction"|"importantDate"|"urgency", "targetId": string|null, "label": string }],
  "suggestedReply": string | null
}

Strict rules:
- Base everything ONLY on the message below. Never invent dates, deadlines, actions, amounts, or facts.
- "sourceText" MUST be an exact word-for-word excerpt copied from the message. If you cannot quote the message for an item, use an empty string for sourceText.
- If a date or time is calculated (e.g. "15 minutes before 10:30"), set "isDerived": true and do NOT put a quote in sourceText.
- If something is unclear or missing, add an entry to "uncertainties" instead of guessing.
- If there are no actions or no dates, return empty arrays.
- Only include "suggestedReply" if a reply is clearly appropriate; otherwise null.

Digital task tagging (for the "actions"):
- DeClear can give step-by-step help ONLY for these tasks:
${catalogLines}
- For each action, decide if completing it means doing one of the tasks above on a phone or computer.
- If it matches one of the tasks above, set "isDigitalTask": true and "taskType" to that exact id from the list.
- Otherwise set "isDigitalTask": false and "taskType": "none". Do NOT invent a taskType that is not in the list above.

Message:
"""
${message}
"""`
}

// Extract the model's text output from a Gemini generateContent response.
function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('')
}

// Pull a JSON object out of the model text, tolerating code fences or extra
// prose around it.
function parseJsonObject(text) {
  const trimmed = String(text).trim()
  const fenced = trimmed.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
  try {
    return JSON.parse(fenced)
  } catch {
    const start = fenced.indexOf('{')
    const end = fenced.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(fenced.slice(start, end + 1))
    }
    throw new Error('Model did not return valid JSON')
  }
}

/**
 * Call Gemini and return a validated, source-grounded ProcessResult.
 *
 * @param {object} args
 * @param {string} args.message
 * @param {string} args.level
 * @param {string} args.language
 * @param {string} args.apiKey   - server-side key (never logged/returned)
 * @param {string} args.model    - exact model id (from GEMINI_MODEL)
 * @param {typeof fetch} [args.fetchImpl] - injectable for tests
 * @returns {Promise<{ result: object }>}
 * @throws {Error} with a `.code` of 'quota' | 'rate' | 'upstream' | 'invalid'
 */
export async function generateExplanation({
  message,
  level,
  language,
  apiKey,
  model,
  fetchImpl = fetch,
}) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent`

  const body = {
    contents: [{ parts: [{ text: buildPrompt({ message, level, language }) }] }],
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.2,
      responseMimeType: 'application/json',
      // Ask "thinking" models to skip the internal reasoning step so the token
      // budget goes to the actual answer. Models that don't support this field
      // simply ignore it, and the larger maxOutputTokens still covers us.
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  // One attempt: fetch, check status, parse, validate, ground. Throws on any
  // failure (with .upstreamStatus / .isTimeout set so the retry loop can decide
  // whether to try again).
  async function attempt() {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    let response
    try {
      response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Key travels in a header, not the URL, so it does not land in logs.
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (err) {
      const timedOut = err?.name === 'AbortError'
      const error = new Error(
        timedOut ? 'Gemini request timed out' : 'Gemini request failed',
      )
      error.code = 'upstream'
      error.isTimeout = timedOut
      error.upstreamDetail = timedOut
        ? `timeout after ${REQUEST_TIMEOUT_MS}ms`
        : `fetch failed: ${err?.name ?? 'unknown'} ${err?.message ?? ''}`.slice(0, 200)
      throw error
    } finally {
      clearTimeout(timer)
    }

    if (!response.ok) {
      if (response.status === 429) {
        const error = new Error('Gemini free-tier limit reached')
        error.code = 'quota'
        error.upstreamStatus = 429
        throw error
      }
      // Gemini error bodies describe the problem and do NOT contain the API key,
      // so this snippet is safe to surface in server logs.
      let detail
      try {
        detail = (await response.text()).slice(0, 300)
      } catch {
        detail = ''
      }
      const error = new Error(`Gemini responded with status ${response.status}`)
      error.code = 'upstream'
      error.upstreamStatus = response.status
      error.upstreamDetail = detail
      throw error
    }

    const data = await response.json()
    const text = extractText(data)
    if (!text) {
      const error = new Error('Gemini returned an empty response')
      error.code = 'invalid'
      error.upstreamDetail = `finishReason=${data?.candidates?.[0]?.finishReason ?? 'unknown'}`
      throw error
    }

    let parsed
    try {
      parsed = parseJsonObject(text)
    } catch {
      const error = new Error('Gemini returned a response we could not read')
      error.code = 'invalid'
      throw error
    }

    const normalized = normalizeResult(parsed)
    const grounded = groundResult(normalized, message)
    return { result: grounded }
  }

  // Retry loop: retry a 503 ("high demand") or a timeout a couple of times with
  // a short backoff. Other errors (bad model, invalid JSON, quota) fail fast.
  let lastError
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    try {
      return await attempt()
    } catch (err) {
      lastError = err
      if (!isRetryable(err) || i === MAX_ATTEMPTS - 1) throw err
      await sleep(RETRY_BACKOFF_MS * (i + 1))
    }
  }
  throw lastError
}
