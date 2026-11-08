// Server-side Gemini helper for step-by-step guidance. Mirrors gemini.js but
// produces a guidance object (ordered steps) instead of an explanation.
//
// Supports an optional "stuck" description and an optional screenshot (inline
// base64 image) so the model can revise the next instruction based on what the
// user actually sees. The image is used for this single request only — it is
// never written to disk or stored anywhere on the server.
//
// SECURITY: the API key is read by the caller and passed in; it is sent in a
// header, never logged or returned.

import { normalizeGuidance } from '../../src/services/guidanceSchema.js'

// Generous cap so "thinking" models (e.g. gemini-3.x flash) have room for the
// actual step list after any internal reasoning. We also request no thinking
// (see thinkingConfig below); this larger cap is a safety net.
export const MAX_OUTPUT_TOKENS = 2048
// Allow 45s (Vercel Hobby functions may run up to 60s) to avoid spurious
// timeouts on slow/cold responses, while still bounding the request.
export const REQUEST_TIMEOUT_MS = 45000
// Retry transient 503 / timeout failures a couple of times with backoff.
export const MAX_ATTEMPTS = 3
export const RETRY_BACKOFF_MS = 1200

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isRetryable(error) {
  return error?.upstreamStatus === 503 || error?.isTimeout === true
}
// ~1.5MB of base64 (roughly ~1.1MB raw image). Keeps requests small/fast.
export const MAX_IMAGE_BASE64_CHARS = 1_500_000
export const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp']

const LANGUAGE_NAMES = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  'zh-CN': 'Simplified Chinese',
}

function buildPrompt({ taskLabel, app, device, language, stuckText, hasImage }) {
  const deviceName = device === 'android' ? 'an Android phone' : 'an iPhone'
  const langName = LANGUAGE_NAMES[language] ?? 'English'
  return `You are helping an older adult complete ONE digital task on their own phone: "${taskLabel}" using the ${app} app on ${deviceName}.

Write ALL "instruction" and "detail" text in ${langName}, using natural, respectful wording an older adult would find clear. Do not translate app button names that appear in quotes if the app shows them in English on the user's phone; you may add a short ${langName} explanation after them.

You cannot see or control their phone. Give instructions they follow by hand. Never claim to do anything for them.

Return ONLY a JSON object:
{ "steps": [ { "id": string, "instruction": string, "detail": string } ] }

Rules:
- Each step is ONE simple action, in short, plain sentences. No jargon.
- "instruction" is the single thing to do now. "detail" adds gentle help (what the button looks like, where it is, what to do if they can't find it).
- Be specific to ${app} on ${deviceName}.
- Never tell them to enable paid features or share passwords.
${
  stuckText
    ? `- The user is stuck. They describe what they see: """${stuckText}""". Revise the guidance to help from where they actually are. Start with the step that unblocks them.`
    : ''
}
${
  hasImage
    ? '- The user attached a screenshot of their current screen. Use it to tell where they are and what to tap next. If the screenshot is unclear or unrelated, say so in the first step and ask them to describe what they see.'
    : ''
}`
}

function extractText(data) {
  const parts = data?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''
  return parts.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('')
}

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
 * Generate guidance via Gemini.
 *
 * @param {object} args
 * @param {string} args.taskLabel
 * @param {string} args.app
 * @param {string} args.device
 * @param {string} [args.stuckText]
 * @param {{ mimeType: string, dataBase64: string } | null} [args.image]
 * @param {string} args.apiKey
 * @param {string} args.model
 * @param {typeof fetch} [args.fetchImpl]
 * @returns {Promise<{ guidance: { steps, source } }>}
 * @throws {Error} with .code of 'quota' | 'upstream' | 'invalid' | 'bad-image'
 */
export async function generateGuidance({
  taskLabel,
  app,
  device,
  language = 'en',
  stuckText = '',
  image = null,
  apiKey,
  model,
  fetchImpl = fetch,
}) {
  const parts = [
    {
      text: buildPrompt({
        taskLabel,
        app,
        device,
        language,
        stuckText,
        hasImage: !!image,
      }),
    },
  ]

  if (image) {
    if (!ALLOWED_IMAGE_TYPES.includes(image.mimeType)) {
      const e = new Error('Unsupported image type')
      e.code = 'bad-image'
      throw e
    }
    if (
      typeof image.dataBase64 !== 'string' ||
      image.dataBase64.length === 0 ||
      image.dataBase64.length > MAX_IMAGE_BASE64_CHARS
    ) {
      const e = new Error('Image missing or too large')
      e.code = 'bad-image'
      throw e
    }
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.dataBase64 } })
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model,
  )}:generateContent`

  const body = {
    contents: [{ parts }],
    generationConfig: {
      maxOutputTokens: MAX_OUTPUT_TOKENS,
      temperature: 0.3,
      responseMimeType: 'application/json',
      // Skip the internal reasoning step on "thinking" models so the token
      // budget produces the actual steps. Ignored by models without it.
      thinkingConfig: { thinkingBudget: 0 },
    },
  }

  async function attempt() {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    let response
    try {
      response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (err) {
      const timedOut = err?.name === 'AbortError'
      const e = new Error(
        timedOut ? 'Guidance request timed out' : 'Guidance request failed',
      )
      e.code = 'upstream'
      e.isTimeout = timedOut
      e.upstreamDetail = timedOut
        ? `timeout after ${REQUEST_TIMEOUT_MS}ms`
        : `fetch failed: ${err?.name ?? 'unknown'} ${err?.message ?? ''}`.slice(0, 200)
      throw e
    } finally {
      clearTimeout(timer)
    }

    if (!response.ok) {
      if (response.status === 429) {
        const e = new Error('Gemini free-tier limit reached')
        e.code = 'quota'
        e.upstreamStatus = 429
        throw e
      }
      let detail
      try {
        detail = (await response.text()).slice(0, 300)
      } catch {
        detail = ''
      }
      const e = new Error(`Gemini responded with status ${response.status}`)
      e.code = 'upstream'
      e.upstreamStatus = response.status
      e.upstreamDetail = detail
      throw e
    }

    const data = await response.json()
    const text = extractText(data)
    if (!text) {
      const e = new Error('Gemini returned an empty response')
      e.code = 'invalid'
      e.upstreamDetail = `finishReason=${data?.candidates?.[0]?.finishReason ?? 'unknown'}`
      throw e
    }

    let parsed
    try {
      parsed = parseJsonObject(text)
    } catch {
      const e = new Error('Gemini returned a response we could not read')
      e.code = 'invalid'
      throw e
    }

    const guidance = normalizeGuidance(parsed, 'ai')
    return { guidance }
  }

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
