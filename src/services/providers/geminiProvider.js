// Client-side AI provider. It never talks to Gemini directly and never sees the
// API key — it calls our own serverless route (/api/explain), which holds the
// key server-side. This keeps the secret off the browser entirely.
//
// It implements the same async provider contract as the demo provider:
//   { id, process({ message, preferences }): Promise<{ status, result, message }> }

import { ProcessStatus, Providers } from '../processorTypes.js'
import { normalizeResult, groundResult } from '../resultSchema.js'

export const id = Providers.AI

const ENDPOINT = '/api/explain'

// Map a server error `code` to our ProcessStatus + a plain-language message.
function mapErrorCode(code, serverMessage) {
  switch (code) {
    case 'not-configured':
      return {
        status: ProcessStatus.NOT_CONFIGURED,
        message:
          serverMessage ||
          'AI explanations are not set up yet. Demo mode still works.',
      }
    case 'rate-limited':
      return {
        status: ProcessStatus.RATE_LIMITED,
        message:
          serverMessage || 'Too many requests right now. Please wait a moment.',
      }
    case 'quota-exhausted':
      return {
        status: ProcessStatus.QUOTA_EXHAUSTED,
        message:
          serverMessage ||
          'The free AI quota is used up for now. Please use Demo mode or try later.',
      }
    case 'too-long':
      return {
        status: ProcessStatus.TOO_LONG,
        message: serverMessage || 'This message is too long.',
      }
    case 'empty-input':
      return {
        status: ProcessStatus.EMPTY_INPUT,
        message: serverMessage || 'Please provide a message first.',
      }
    default:
      return {
        status: ProcessStatus.ERROR,
        message:
          serverMessage ||
          'The AI service is unavailable right now. Please try again, or use Demo mode.',
      }
  }
}

/**
 * @param {object} args
 * @param {string} args.message
 * @param {object} args.preferences - { level, language, aiConsent }
 */
export async function process({ message, preferences }) {
  // Explicit consent is required before any text leaves the device.
  if (!preferences?.aiConsent) {
    return {
      status: ProcessStatus.CONSENT_REQUIRED,
      result: null,
      message:
        'Please agree to send this message to the AI service before using AI mode.',
    }
  }

  let response
  try {
    response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        level: preferences.level,
        language: preferences.language,
      }),
    })
  } catch {
    return {
      status: ProcessStatus.ERROR,
      result: null,
      message:
        'Could not reach the AI service. Please check your connection, or use Demo mode.',
    }
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const { status, message: msg } = mapErrorCode(payload?.code, payload?.message)
    return { status, result: null, message: msg }
  }

  // Defence in depth: validate and re-ground on the client too, so a result is
  // never trusted blindly even though the server already validated it.
  try {
    const normalized = normalizeResult(payload?.result)
    const grounded = groundResult(normalized, message)
    return { status: ProcessStatus.OK, result: grounded, message: null }
  } catch {
    return {
      status: ProcessStatus.ERROR,
      result: null,
      message: 'The AI response could not be read. Please try again.',
    }
  }
}

export default { id, process }
