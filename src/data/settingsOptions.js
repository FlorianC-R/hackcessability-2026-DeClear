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

// Output language. Only English and French are declared for this milestone,
// and only for the predefined sample messages.
export const LANGUAGES = [
  { value: 'en', label: 'English', speechLang: 'en-US' },
  { value: 'fr', label: 'French (Français)', speechLang: 'fr-FR' },
]

export const DEFAULT_SETTINGS = {
  level: 'standard',
  language: 'en',
  readAloud: false,
}

export const LEVEL_VALUES = EXPLANATION_LEVELS.map((item) => item.value)
export const LANGUAGE_VALUES = LANGUAGES.map((item) => item.value)
