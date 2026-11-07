// notificationProcessor — the single entry point for turning a notification
// into a plain-language explanation.
//
// It is deliberately independent of React: it takes plain data in and returns
// plain data out, so the same service can be driven by the UI, by tests, or
// later by a local Ollama provider.
//
// Responsibilities:
//  - validate the input (empty / too long),
//  - preserve the original message exactly, untouched,
//  - apply the caller's accessibility preferences (with safe defaults),
//  - route to the configured provider,
//  - always return one consistent response envelope.

import {
  DEFAULT_PREFERENCES,
  MAX_MESSAGE_LENGTH,
  ProcessStatus,
  Providers,
} from './processorTypes.js'
import { getProvider } from './providers/index.js'

// Merge caller preferences over the defaults so every request has a complete,
// predictable preference object.
function resolvePreferences(preferences) {
  return { ...DEFAULT_PREFERENCES, ...(preferences ?? {}) }
}

// Build the consistent response envelope. `original` is always the exact text
// that was passed in, so the source message is preserved for inspection.
function envelope({ status, provider, original, preferences, result, message }) {
  return {
    status,
    provider,
    original,
    preferences,
    result: result ?? null,
    message: message ?? null,
  }
}

/**
 * Process a notification message.
 *
 * @param {Object} request
 * @param {string} request.message - the notification text to explain
 * @param {Object} [request.preferences] - accessibility preferences
 *        ({ level: 'brief'|'standard'|'guided', language: 'en'|'fr' })
 * @param {string} [request.providerId] - which provider to use (default: demo)
 * @returns {Object} the consistent response envelope (see processorTypes.js)
 */
export function processNotification(request = {}) {
  const { message = '', providerId = Providers.DEMO } = request
  const preferences = resolvePreferences(request.preferences)

  // `original` is captured verbatim and never altered.
  const original = typeof message === 'string' ? message : ''

  // Validate first, before any provider is involved.
  if (original.trim().length === 0) {
    return envelope({
      status: ProcessStatus.EMPTY_INPUT,
      provider: providerId,
      original,
      preferences,
      message: 'Please choose an example or paste a message first.',
    })
  }

  if (original.length > MAX_MESSAGE_LENGTH) {
    return envelope({
      status: ProcessStatus.TOO_LONG,
      provider: providerId,
      original,
      preferences,
      message: 'This message is too long. Please shorten it and try again.',
    })
  }

  const provider = getProvider(providerId)
  if (!provider) {
    return envelope({
      status: ProcessStatus.PROVIDER_UNAVAILABLE,
      provider: providerId,
      original,
      preferences,
      message: 'The selected processing option is not available right now.',
    })
  }

  // Delegate to the provider, then fold its answer into the full envelope.
  const outcome = provider.process({ message: original, preferences })

  return envelope({
    status: outcome.status,
    provider: provider.id,
    original,
    preferences,
    result: outcome.result,
    message: outcome.message,
  })
}

export default { processNotification }
