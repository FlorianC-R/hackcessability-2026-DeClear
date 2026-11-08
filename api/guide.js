// Vercel serverless route: POST /api/guide
//
// Generates step-by-step guidance for a known digital task using Gemini. Like
// /api/explain, the GEMINI_API_KEY is server-side only and never logged or
// returned, and GEMINI_MODEL must be configured (no guessed default).
//
// Optional inputs: a "stuck" description and/or a screenshot. The screenshot is
// used only to produce this one response and is NEVER stored on the server.

import { generateGuidance, MAX_IMAGE_BASE64_CHARS } from './_lib/guide.js'
import { checkRateLimit } from './_lib/rateLimit.js'

const MAX_STUCK_CHARS = 1000

function clientKey(req) {
  const fwd = req.headers?.['x-forwarded-for']
  if (typeof fwd === 'string' && fwd.length) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress ?? 'unknown'
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
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

  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL
  if (!apiKey || !model) {
    res.status(503).json({
      code: 'not-configured',
      message:
        'AI guidance is not set up on the server. GEMINI_API_KEY and ' +
        'GEMINI_MODEL must be configured. Scripted guidance still works.',
    })
    return
  }

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

  const taskLabel = typeof body.taskLabel === 'string' ? body.taskLabel.slice(0, 200) : ''
  const app = typeof body.app === 'string' ? body.app.slice(0, 80) : ''
  const device = body.device === 'android' ? 'android' : 'iphone'
  const ALLOWED_LANGUAGES = new Set(['en', 'fr', 'es', 'zh-CN'])
  const language = ALLOWED_LANGUAGES.has(body.language) ? body.language : 'en'
  const stuckText =
    typeof body.stuckText === 'string' ? body.stuckText.slice(0, MAX_STUCK_CHARS) : ''

  if (!taskLabel || !app) {
    res.status(400).json({ code: 'bad-request', message: 'Missing task details.' })
    return
  }

  // Optional screenshot: validate size/type here too (route is public).
  let image = null
  if (body.image && typeof body.image === 'object') {
    const { mimeType, dataBase64 } = body.image
    if (
      typeof dataBase64 === 'string' &&
      dataBase64.length > 0 &&
      dataBase64.length <= MAX_IMAGE_BASE64_CHARS
    ) {
      image = { mimeType, dataBase64 }
    } else {
      res.status(400).json({
        code: 'bad-image',
        message: 'The screenshot is missing or too large.',
      })
      return
    }
  }

  try {
    const { guidance } = await generateGuidance({
      taskLabel,
      app,
      device,
      language,
      stuckText,
      image,
      apiKey,
      model,
    })
    res.status(200).json({ guidance })
  } catch (err) {
    // Safe diagnostics only: error code, upstream HTTP status, short body
    // snippet. Never the API key, the user's text, or the screenshot.
    console.error('[guide] generation failed', {
      code: err?.code ?? 'unknown',
      upstreamStatus: err?.upstreamStatus,
      upstreamDetail: err?.upstreamDetail,
    })
    const code = err?.code
    if (code === 'quota') {
      res.status(429).json({
        code: 'quota-exhausted',
        message:
          'The free AI quota is used up for now. You can still use the written steps.',
      })
      return
    }
    if (code === 'bad-image') {
      res.status(400).json({
        code: 'bad-image',
        message: 'That screenshot could not be used. Try a PNG or JPEG under about 1 MB.',
      })
      return
    }
    res.status(502).json({
      code: 'error',
      message: 'AI guidance is unavailable right now. You can still use the written steps.',
    })
  }
}
