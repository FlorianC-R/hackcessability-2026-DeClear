// Shared validation and source-grounding for a ProcessResult.
//
// This module is framework-independent (no React, no Node-only APIs) so it can
// be used by:
//   - the Vercel serverless route, to validate what Gemini returns before it
//     is ever sent to the browser, and
//   - the client providers and the automated tests.
//
// Two jobs:
//   1. normalizeResult(raw)      -> coerce an untrusted object into the exact
//                                   ProcessResult schema, or throw if it cannot.
//   2. groundResult(result, src) -> check each sourceText against the original
//                                   message. Excerpts that are NOT found verbatim
//                                   are flagged; derived dates/times are labelled
//                                   as calculations, not direct quotes.

import { URGENCY_LEVELS } from './processorTypes.js'

// --- small helpers ---------------------------------------------------------

function asString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function asArray(value) {
  return Array.isArray(value) ? value : []
}

// Normalise whitespace so a "verbatim" check is not defeated by differing
// runs of spaces or line breaks, while still requiring the words to be present.
function normalizeForMatch(text) {
  return asString(text).replace(/\s+/g, ' ').trim().toLowerCase()
}

// --- normalisation ---------------------------------------------------------

/**
 * Coerce an untrusted object (e.g. parsed from an AI response) into the exact
 * ProcessResult schema. Unknown fields are dropped; missing collections become
 * empty arrays; urgency falls back to a safe value. Throws if the object is not
 * even shaped like a result (so a provider never returns garbage).
 *
 * @param {unknown} raw
 * @returns {import('./processorTypes.js')} a well-formed ProcessResult
 */
export function normalizeResult(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Result is not an object')
  }

  const title = asString(raw.title).trim()
  const explanation = asString(raw.explanation).trim()
  if (explanation.length === 0) {
    throw new Error('Result is missing an explanation')
  }

  const actions = asArray(raw.actions).map((a, i) => ({
    id: asString(a?.id) || `action-${i + 1}`,
    text: asString(a?.text).trim(),
    sourceText: asString(a?.sourceText),
  }))

  const dates = asArray(raw.dates).map((d, i) => ({
    id: asString(d?.id) || `date-${i + 1}`,
    label: asString(d?.label).trim(),
    dateText: asString(d?.dateText).trim(),
    // Default to "not known" unless the provider explicitly says it is known.
    isKnown: d?.isKnown === true,
    sourceText: asString(d?.sourceText),
    // Whether the date/time was computed from the text rather than quoted.
    isDerived: d?.isDerived === true,
  }))

  const urgency = URGENCY_LEVELS.includes(raw.urgency) ? raw.urgency : 'None'

  const uncertainties = asArray(raw.uncertainties).map((u) => ({
    targetKind: asString(u?.targetKind, 'explanation'),
    targetId: u?.targetId == null ? null : asString(u.targetId),
    label: asString(u?.label).trim(),
  }))

  const suggestedReply =
    typeof raw.suggestedReply === 'string' && raw.suggestedReply.trim().length
      ? raw.suggestedReply.trim()
      : null

  return {
    title,
    explanation,
    actions,
    dates,
    urgency,
    uncertainties,
    suggestedReply,
  }
}

// --- source grounding ------------------------------------------------------

/**
 * Check that each `sourceText` excerpt actually appears in the original
 * message. This does NOT prove the AI's conclusion is correct — it only tells
 * the user whether the quoted evidence is really present in their message.
 *
 * Behaviour:
 *   - An action or date whose sourceText is found verbatim keeps it and is
 *     marked `sourceVerified: true`.
 *   - If the sourceText is empty or not found, we clear it, mark
 *     `sourceVerified: false`, and add an uncertainty note so the user is told
 *     the evidence could not be located in their message.
 *   - A date marked `isDerived` is labelled as a calculation, not a quote, even
 *     if a related phrase appears in the text.
 *
 * @param {import('./processorTypes.js')} result - a normalised ProcessResult
 * @param {string} original - the exact original message
 * @returns {import('./processorTypes.js')} a new result with grounding applied
 */
export function groundResult(result, original) {
  const haystack = normalizeForMatch(original)
  const extraUncertainties = []

  const contains = (excerpt) => {
    const needle = normalizeForMatch(excerpt)
    return needle.length > 0 && haystack.includes(needle)
  }

  const actions = result.actions.map((action) => {
    const verified = contains(action.sourceText)
    if (!verified) {
      extraUncertainties.push({
        targetKind: 'requiredAction',
        targetId: action.id,
        label:
          'The supporting quote for this step was not found word-for-word in ' +
          'your message. Please check it against the original.',
      })
    }
    return {
      ...action,
      sourceText: verified ? action.sourceText : '',
      sourceVerified: verified,
    }
  })

  const dates = result.dates.map((date) => {
    // A derived date/time is a calculation, never presented as a direct quote.
    if (date.isDerived) {
      extraUncertainties.push({
        targetKind: 'importantDate',
        targetId: date.id,
        label:
          'This time or date was worked out from your message, not quoted ' +
          'directly. Please double-check it.',
      })
      return { ...date, sourceText: '', sourceVerified: false, isDerived: true }
    }

    const verified = contains(date.sourceText)
    if (!verified) {
      extraUncertainties.push({
        targetKind: 'importantDate',
        targetId: date.id,
        label:
          'The supporting quote for this date was not found word-for-word in ' +
          'your message. Please check it against the original.',
      })
    }
    return {
      ...date,
      sourceText: verified ? date.sourceText : '',
      sourceVerified: verified,
    }
  })

  return {
    ...result,
    actions,
    dates,
    uncertainties: [...result.uncertainties, ...extraUncertainties],
  }
}

export default { normalizeResult, groundResult }
