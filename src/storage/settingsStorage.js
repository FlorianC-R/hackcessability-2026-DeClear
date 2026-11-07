// Reads and writes the user's settings to the browser's localStorage.
//
// Everything is wrapped in try/catch so that a browser with storage disabled,
// a full storage quota, or corrupted data never crashes the app — it just
// falls back to sensible defaults. Loaded values are validated against the
// allowed options before use, so an unexpected stored value can't break the UI.

import {
  DEFAULT_SETTINGS,
  LEVEL_VALUES,
  LANGUAGE_VALUES,
} from '../data/settingsOptions.js'

const STORAGE_KEY = 'declear.settings.v1'

// Validate a loaded object field-by-field, replacing anything invalid with the
// default. This is what makes a corrupt or partial stored value safe.
function coerceSettings(raw) {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_SETTINGS }
  return {
    level: LEVEL_VALUES.includes(raw.level)
      ? raw.level
      : DEFAULT_SETTINGS.level,
    language: LANGUAGE_VALUES.includes(raw.language)
      ? raw.language
      : DEFAULT_SETTINGS.language,
    readAloud:
      typeof raw.readAloud === 'boolean'
        ? raw.readAloud
        : DEFAULT_SETTINGS.readAloud,
  }
}

// Load settings, always returning a complete, valid settings object.
export function loadSettings() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return { ...DEFAULT_SETTINGS }
    return coerceSettings(JSON.parse(stored))
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

// Save settings. Returns true on success, false if storage was unavailable so
// the caller can tell the user their preference could not be saved.
export function saveSettings(settings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    return true
  } catch {
    return false
  }
}
