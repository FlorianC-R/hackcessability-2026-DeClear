// The user-configurable settings for this milestone, defined in one place so
// the UI, storage, and result lookup all agree on the allowed values.

// Explanation level. These genuinely change the wording and detail of the
// output (see sampleNotifications.js), not just a label.
export const EXPLANATION_LEVELS = [
  {
    value: 'brief',
    label: 'Brief',
    description: 'A short, one-line summary.',
  },
  {
    value: 'standard',
    label: 'Standard',
    description: 'A clear plain-language explanation. (Default)',
  },
  {
    value: 'guided',
    label: 'Guided',
    description: 'A longer, step-by-step walk-through with extra context.',
  },
]

// Interface + output languages. The human-readable labels live in the i18n
// dictionaries (language.* keys); here we just keep the value and the BCP-47
// speech tag used for read-aloud and Intl.
export const LANGUAGES = [
  { value: 'en', speechLang: 'en-US' },
  { value: 'fr', speechLang: 'fr-FR' },
  { value: 'es', speechLang: 'es-ES' },
  { value: 'zh-CN', speechLang: 'zh-CN' },
]

// Processing mode. Demo is deterministic and offline (the three samples). AI
// sends the message to Google Gemini via our server and requires consent.
export const PROCESSING_MODES = [
  {
    value: 'demo',
    label: 'Demo mode',
    description:
      'Explains the three example messages. Works offline. Nothing is sent anywhere.',
  },
  {
    value: 'ai',
    label: 'AI mode (Google Gemini)',
    description:
      'Explains messages you paste, using Google Gemini. Requires your consent to send text.',
  },
]

export const DEFAULT_SETTINGS = {
  level: 'standard',
  language: 'en',
  readAloud: false,
  mode: 'demo', // 'demo' | 'ai' — default to the safe, offline mode
  aiConsent: false, // must be explicitly turned on before AI mode sends text
}

export const LEVEL_VALUES = EXPLANATION_LEVELS.map((item) => item.value)
export const LANGUAGE_VALUES = LANGUAGES.map((item) => item.value)
export const MODE_VALUES = PROCESSING_MODES.map((item) => item.value)
