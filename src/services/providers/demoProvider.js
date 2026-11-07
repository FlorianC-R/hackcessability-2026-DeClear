// Deterministic demo provider.
//
// It can ONLY explain the three predefined sample notifications. It recognises
// a message by matching its exact text against the samples — so pasted free
// text that is not one of the samples is reported as unsupported rather than
// being matched to an unrelated predefined answer.
//
// Given the same message and preferences, it always returns the same result.
// It performs no network calls and has no React dependency.

import { sampleNotifications } from '../../data/sampleNotifications.js'
import { ProcessStatus, Providers } from '../processorTypes.js'

export const id = Providers.DEMO

// Find the sample whose original text matches the given message exactly
// (ignoring only surrounding whitespace). Returns null for anything else.
function matchSample(message) {
  const normalized = message.trim()
  return (
    sampleNotifications.find((sample) => sample.text.trim() === normalized) ??
    null
  )
}

// Map a stored sample result (requiredActions / importantDates / urgencyLevel /
// uncertaintyIndicators) into the consistent ProcessResult schema the rest of
// the app uses (actions / dates / urgency / uncertainties), adding the sample
// title and any optional suggested reply for the chosen language.
function toProcessResult(sample, language, level) {
  const byLanguage = sample.results[language] ?? sample.results.en
  const variant = byLanguage[level] ?? byLanguage.standard

  const dates = variant.importantDates.map((date) => ({
    id: date.id,
    label: date.label,
    dateText: date.dateText,
    // A date is "known" when the source actually states a concrete date. When
    // it does not, we keep the entry but mark it unknown instead of inventing.
    isKnown: date.isKnown !== false,
    sourceText: date.sourceText,
  }))

  const title =
    (sample.titles && (sample.titles[language] ?? sample.titles.en)) ??
    sample.title

  const suggestedReply =
    sample.suggestedReply &&
    (sample.suggestedReply[language] ?? sample.suggestedReply.en ?? null)

  return {
    title,
    explanation: variant.explanation,
    actions: variant.requiredActions.map((action) => ({ ...action })),
    dates,
    urgency: variant.urgencyLevel,
    uncertainties: variant.uncertaintyIndicators.map((item) => ({ ...item })),
    suggestedReply: suggestedReply ?? null,
  }
}

// Process a message. Resolves to a partial response (status + result/message);
// the orchestrator fills in original, provider, and preferences.
//
// This is async to match the provider contract (some providers, such as a
// future network-backed one, must be async). The demo provider does no I/O,
// so it simply resolves immediately with the same deterministic output.
export async function process({ message, preferences }) {
  const sample = matchSample(message)

  if (!sample) {
    return {
      status: ProcessStatus.UNSUPPORTED_TEXT,
      result: null,
      message:
        'DeClear can explain the three example messages for now. ' +
        'Explaining messages you paste yourself needs the AI feature, ' +
        'which is not switched on yet.',
    }
  }

  return {
    status: ProcessStatus.OK,
    result: toProcessResult(sample, preferences.language, preferences.level),
    message: null,
  }
}

export default { id, process }
