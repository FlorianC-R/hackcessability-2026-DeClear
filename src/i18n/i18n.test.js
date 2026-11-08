import { describe, it, expect } from 'vitest'
import {
  translate,
  hasOwnTranslation,
  allKeys,
  SUPPORTED_LANGUAGES,
  DICTIONARIES,
} from './index.js'
import { getScriptedGuide, taskLabel, TASK_TYPES } from '../data/guidanceTasks.js'

describe('translate — basic behaviour', () => {
  it('returns the string for a known key in each language', () => {
    expect(translate('en', 'input.explain')).toBe('Explain this message')
    expect(translate('fr', 'input.explain')).toBe('Expliquer ce message')
    expect(translate('es', 'input.explain')).toBe('Explicar este mensaje')
    expect(translate('zh-CN', 'input.explain')).toBe('解释这条信息')
  })

  it('fills placeholders', () => {
    expect(translate('en', 'progress.count', { current: 2, total: 3 })).toBe(
      'Step 2 of 3',
    )
    expect(translate('fr', 'progress.count', { current: 2, total: 3 })).toBe(
      'Étape 2 sur 3',
    )
  })

  it('falls back to English for a missing key, never undefined', () => {
    // Use a key guaranteed not to exist in any dictionary.
    const made = translate('fr', 'this.key.does.not.exist')
    expect(made).toBe('this.key.does.not.exist') // falls back to the key itself
    expect(made).not.toContain('undefined')
  })

  it('unknown language falls back to English', () => {
    expect(translate('de', 'input.explain')).toBe('Explain this message')
  })
})

describe('dictionary coverage', () => {
  it('every language has its own translation for every English key', () => {
    const keys = allKeys()
    const missing = {}
    for (const lang of SUPPORTED_LANGUAGES) {
      if (lang === 'en') continue
      const gaps = keys.filter((k) => !hasOwnTranslation(lang, k))
      if (gaps.length) missing[lang] = gaps
    }
    // If this fails, the printed object names exactly which keys to add.
    expect(missing).toEqual({})
  })

  it('no language dictionary has extra keys not in English', () => {
    const englishKeys = new Set(allKeys())
    for (const lang of SUPPORTED_LANGUAGES) {
      const extra = Object.keys(DICTIONARIES[lang]).filter(
        (k) => !englishKeys.has(k),
      )
      expect({ [lang]: extra }).toEqual({ [lang]: [] })
    }
  })
})

describe('urgency statuses are translated (including No urgency)', () => {
  for (const lang of SUPPORTED_LANGUAGES) {
    it(`has all four urgency labels in ${lang}`, () => {
      for (const level of ['None', 'Low', 'Medium', 'High']) {
        const label = translate(lang, `urgency.${level}.label`)
        expect(label.length).toBeGreaterThan(0)
        if (lang !== 'en') {
          // Should be the language's own translation, not the English fallback.
          expect(hasOwnTranslation(lang, `urgency.${level}.label`)).toBe(true)
        }
      }
    })
  }
})

describe('four-language guided WhatsApp demo (scripted fallback)', () => {
  for (const lang of SUPPORTED_LANGUAGES) {
    it(`provides scripted WhatsApp/iPhone steps in ${lang}`, () => {
      const steps = getScriptedGuide(
        TASK_TYPES.SEND_PHOTOS_WHATSAPP,
        'iphone',
        lang,
      )
      expect(Array.isArray(steps)).toBe(true)
      expect(steps.length).toBe(6)
      for (const step of steps) {
        expect(typeof step.instruction).toBe('string')
        expect(step.instruction.length).toBeGreaterThan(0)
      }
    })

    it(`has a localized task label in ${lang}`, () => {
      expect(taskLabel(TASK_TYPES.SEND_PHOTOS_WHATSAPP, lang).length).toBeGreaterThan(0)
    })
  }

  it('falls back to English scripted steps for an unknown language', () => {
    const steps = getScriptedGuide(TASK_TYPES.SEND_PHOTOS_WHATSAPP, 'iphone', 'de')
    const en = getScriptedGuide(TASK_TYPES.SEND_PHOTOS_WHATSAPP, 'iphone', 'en')
    expect(steps).toEqual(en)
  })
})
