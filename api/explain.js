// Vercel serverless route: POST /api/explain
//
// This is the ONLY place the Gemini API key is used. The key lives in the
// server-side environment variable GEMINI_API_KEY and is never sent to the
// browser, never logged, and never committed. The model id is configurable via
// GEMINI_MODEL; if it is missing we return a clear configuration error rather
// than guessing an unsupported default.
//
// The browser calls this endpoint; this endpoint calls Gemini. That keeps the
// key off the client entirely.

import {
  generateExplanation,
  MAX_INPUT_CHARS,
} from './_lib/gemini.js'
import { checkRateLimit } from './_lib/rateLimit.js'

const ALLOWED_LEVELS = new Set(['brief', 'standard', 'guided'])
const ALLOWED_LANGUAGES = new Set(['en', 'fr'])

// Pull a best-effort client identifier for the per-instance limiter.
function clientKey(req) {
  const fwd = req.headers?.['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress ?? 'unknown'
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  // Some runtimes deliver the body as a stream/string.
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return null
    }
  }
  return null
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' })
    return
  }

  // Configuration check first — fail clearly, never guess a model.
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL
  if (!apiKey || !model) {
    res.status(503).json({
      code: 'not-configured',
      message:
        'AI explanations are not set up on the server. A GEMINI_API_KEY and ' +
        'GEMINI_MODEL must be configured. Demo mode still works.',
    })
    return
  }

  // Best-effort burst limiting (see rateLimit.js for its real limitations).
  const limit = checkRateLimit(clientKey(req))
  if (!limit.allowed) {
    res.setHeader('Retry-After', Math.ceil(limit.retryAfterMs / 1000))
    res.status(429).json({
      code: 'rate-limited',
      message: 'Too many requests right now. Please wait a moment and try again.',
    })
    return
  }

  const body = await readJsonBody(req)
  if (!body) {
    res.status(400).json({ code: 'bad-request', message: 'Invalid request body.' })
    return
  }

  const message = typeof body.message === 'string' ? body.message : ''
  const level = ALLOWED_LEVELS.has(body.level) ? body.level : 'standard'
  const language = ALLOWED_LANGUAGES.has(body.language) ? body.language : 'en'

  // Input validation (the route is public, so re-check even though the client
  // also checks).
  if (message.trim().length === 0) {
    res.status(400).json({ code: 'empty-input', message: 'No message provided.' })
    return
  }
  if (message.length > MAX_INPUT_CHARS) {
    res.status(400).json({
      code: 'too-long',
      message: `Message is too long (limit ${MAX_INPUT_CHARS} characters).`,
    })
    return
  }

  try {
    const { result } = await generateExplanation({
      message,
      level,
      language,
      apiKey,
      model,
    })
    res.status(200).json({ result })
  } catch (err) {
    // Safe diagnostics: log only the error code, the upstream HTTP status, and
    // a short snippet of Gemini's error body. We never log the API key, the
    // user's message, or any request headers.
    console.error('[explain] processing failed', {
      code: err?.code ?? 'unknown',
      upstreamStatus: err?.upstreamStatus,
      upstreamDetail: err?.upstreamDetail,
    })
    // Map internal error codes to safe, user-facing responses. We never include
    // the key or raw upstream details in the response to the browser.
    const code = err?.code
    if (code === 'quota') {
      res.status(429).json({
        code: 'quota-exhausted',
        message:
          'The free AI quota is used up for now. Please try again later, or ' +
          'use Demo mode.',
      })
      return
    }
    if (code === 'invalid') {
      res.status(502).json({
        code: 'error',
        message: 'The AI response could not be read. Please try again.',
      })
      return
    }
    res.status(502).json({
      code: 'error',
      message: 'The AI service is unavailable right now. Please try again, or use Demo mode.',
    })
  }
}
