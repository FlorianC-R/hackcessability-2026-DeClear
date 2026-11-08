// Lightweight, dependency-free translation system.
//
// - Dictionaries are plain objects keyed by a stable string id (see en.js).
// - English is the baseline. If a key is missing in the active language, we
//   fall back to English rather than showing undefined.
// - translate(key, vars) fills {placeholders} from `vars`.
//
// No network calls: all UI text is static and bundled.

import en from './en.js'
import fr from './fr.js'
import es from './es.js'
import zhCN from './zh-CN.js'

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'zh-CN']

// BCP-47 codes used for <html lang>, Intl, and speechSynthesis voice matching.
export const LOCALE_TAGS = {
  en: 'en-US',
  fr: 'fr-FR',
  es: 'es-ES',
  'zh-CN': 'zh-CN',
}

const DICTIONARIES = { en, fr, es, 'zh-CN': zhCN }

// Fill {placeholders} in a template with values from `vars`.
function interpolate(template, vars) {
  if (!vars) return template
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  )
}

/**
 * Translate a key for a given language, falling back to English, then to the
 * key itself (so nothing ever renders as "undefined").
 *
 * @param {string} language - one of SUPPORTED_LANGUAGES
 * @param {string} key
 * @param {Object} [vars] - values for {placeholders}
 * @returns {string}
 */
export function translate(language, key, vars) {
  const dict = DICTIONARIES[language] ?? en
  const value =
    (Object.prototype.hasOwnProperty.call(dict, key) && dict[key]) ||
    (Object.prototype.hasOwnProperty.call(en, key) && en[key]) ||
    key
  return interpolate(value, vars)
}

// Returns true if `key` exists in the given language's own dictionary (not via
// the English fallback). Useful for reporting coverage.
export function hasOwnTranslation(language, key) {
  const dict = DICTIONARIES[language]
  return Boolean(dict) && Object.prototype.hasOwnProperty.call(dict, key)
}

// The full set of keys (from the English baseline).
export function allKeys() {
  return Object.keys(en)
}

export { DICTIONARIES }
