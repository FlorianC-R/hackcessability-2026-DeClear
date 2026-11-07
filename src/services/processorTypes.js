// Shared types and constants for the notification processing service.
//
// This module has NO React imports on purpose. The whole service layer is
// plain JavaScript so it can run anywhere (tests, or a future local Ollama
// provider) without a UI.
//
// The processing response always uses one consistent schema, whatever provider
// produced it:
//
//   {
//     status: ProcessStatus,          // how the request resolved
//     provider: string,               // which provider answered ('demo' | 'ollama')
//     original: string,               // the message, preserved exactly as given
//     preferences: AccessibilityPreferences, // the preferences actually applied
//     result: ProcessResult | null,   // present only when status === 'ok'
//     message: string | null,         // a plain-language note for non-ok statuses
//   }
//
// ProcessResult (the explanation itself):
//   {
//     title: string,
//     explanation: string,
//     actions: Action[],              // may be empty
//     dates: ImportantDate[],         // may be empty; unknown dates are explicit
//     urgency: UrgencyLevel,
//     uncertainties: Uncertainty[],   // ambiguity / missing info, stated openly
//     suggestedReply: string | null,  // optional; null when none is offered
//   }
//
// Action:        { id, text, sourceText }
// ImportantDate: { id, label, dateText, isKnown, sourceText }
// Uncertainty:   { targetKind, targetId, label }

// How a processing request resolved.
export const ProcessStatus = {
  OK: 'ok', // a real result was produced
  UNSUPPORTED_TEXT: 'unsupported-text', // free text the demo cannot explain truthfully
  EMPTY_INPUT: 'empty-input', // nothing to process
  TOO_LONG: 'too-long', // message exceeds the size limit
  PROVIDER_UNAVAILABLE: 'provider-unavailable', // configured provider missing
}

export const Providers = {
  DEMO: 'demo',
  OLLAMA: 'ollama', // reserved for a later milestone
}

export const URGENCY_LEVELS = ['None', 'Low', 'Medium', 'High']

// Keep this in step with NotificationInput's cap.
export const MAX_MESSAGE_LENGTH = 5000

// Default accessibility preferences, used when a caller omits them.
export const DEFAULT_PREFERENCES = {
  level: 'standard', // 'brief' | 'standard' | 'guided'
  language: 'en', // 'en' | 'fr'
}
