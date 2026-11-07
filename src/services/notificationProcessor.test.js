import { describe, it, expect } from 'vitest'
import { processNotification } from './notificationProcessor.js'
import {
  ProcessStatus,
  Providers,
  MAX_MESSAGE_LENGTH,
  DEFAULT_PREFERENCES,
} from './processorTypes.js'
import { sampleNotifications } from '../data/sampleNotifications.js'

const clinic = sampleNotifications.find((s) => s.id === 'clinic-appointment')
const bill = sampleNotifications.find((s) => s.id === 'electricity-bill')
const family = sampleNotifications.find((s) => s.id === 'family-message')

describe('processNotification — consistent response schema', () => {
  it('always returns the full envelope shape', () => {
    const res = processNotification({ message: clinic.text })
    expect(res).toHaveProperty('status')
    expect(res).toHaveProperty('provider')
    expect(res).toHaveProperty('original')
    expect(res).toHaveProperty('preferences')
    expect(res).toHaveProperty('result')
    expect(res).toHaveProperty('message')
  })

  it('an OK result carries every schema field', () => {
    const res = processNotification({ message: bill.text })
    expect(res.status).toBe(ProcessStatus.OK)
    const r = res.result
    expect(r).toHaveProperty('title')
    expect(r).toHaveProperty('explanation')
    expect(Array.isArray(r.actions)).toBe(true)
    expect(Array.isArray(r.dates)).toBe(true)
    expect(r).toHaveProperty('urgency')
    expect(Array.isArray(r.uncertainties)).toBe(true)
    expect(r).toHaveProperty('suggestedReply') // optional, but key is always present
  })
})

describe('processNotification — deterministic demo provider', () => {
  it('explains each of the three predefined samples', () => {
    for (const sample of sampleNotifications) {
      const res = processNotification({ message: sample.text })
      expect(res.status).toBe(ProcessStatus.OK)
      expect(res.provider).toBe(Providers.DEMO)
      expect(res.result.explanation.length).toBeGreaterThan(0)
    }
  })

  it('is deterministic: same input and preferences give identical output', () => {
    const req = {
      message: clinic.text,
      preferences: { level: 'guided', language: 'en' },
    }
    const a = processNotification(req)
    const b = processNotification(req)
    expect(a).toEqual(b)
  })

  it('matches a sample even with surrounding whitespace', () => {
    const res = processNotification({ message: `\n\n  ${clinic.text}  \n` })
    expect(res.status).toBe(ProcessStatus.OK)
  })
})

describe('processNotification — truthful handling of free text', () => {
  it('does NOT return a predefined result for unrelated pasted text', () => {
    const res = processNotification({
      message: 'Please water the plants and feed the cat on Thursday.',
    })
    expect(res.status).toBe(ProcessStatus.UNSUPPORTED_TEXT)
    expect(res.result).toBeNull()
    expect(res.message).toMatch(/AI feature|not switched on/i)
  })

  it('does not leak one sample as the answer for a different free text', () => {
    const res = processNotification({ message: 'Dr. Lee 10:30 appointment' })
    // A loose keyword overlap must NOT be treated as the clinic sample.
    expect(res.status).toBe(ProcessStatus.UNSUPPORTED_TEXT)
  })
})

describe('processNotification — input validation', () => {
  it('reports empty input', () => {
    expect(processNotification({ message: '' }).status).toBe(
      ProcessStatus.EMPTY_INPUT,
    )
    expect(processNotification({ message: '   \n  ' }).status).toBe(
      ProcessStatus.EMPTY_INPUT,
    )
  })

  it('reports over-long input before calling a provider', () => {
    const tooLong = 'a'.repeat(MAX_MESSAGE_LENGTH + 1)
    const res = processNotification({ message: tooLong })
    expect(res.status).toBe(ProcessStatus.TOO_LONG)
    expect(res.result).toBeNull()
  })

  it('handles a missing message argument safely', () => {
    expect(processNotification().status).toBe(ProcessStatus.EMPTY_INPUT)
    expect(processNotification({}).status).toBe(ProcessStatus.EMPTY_INPUT)
  })

  it('reports an unavailable provider', () => {
    const res = processNotification({
      message: clinic.text,
      providerId: 'does-not-exist',
    })
    expect(res.status).toBe(ProcessStatus.PROVIDER_UNAVAILABLE)
    expect(res.result).toBeNull()
  })
})

describe('processNotification — preserves the original message', () => {
  it('returns the original byte-for-byte, including whitespace', () => {
    const padded = `  ${clinic.text}\n\n`
    const res = processNotification({ message: padded })
    expect(res.original).toBe(padded)
  })

  it('keeps the original even for unsupported free text', () => {
    const msg = 'some free text that is not a sample'
    const res = processNotification({ message: msg })
    expect(res.original).toBe(msg)
  })
})

describe('processNotification — accessibility preferences', () => {
  it('applies defaults when preferences are omitted', () => {
    const res = processNotification({ message: clinic.text })
    expect(res.preferences).toEqual(DEFAULT_PREFERENCES)
  })

  it('brief and guided levels produce different explanations', () => {
    const brief = processNotification({
      message: clinic.text,
      preferences: { level: 'brief', language: 'en' },
    })
    const guided = processNotification({
      message: clinic.text,
      preferences: { level: 'guided', language: 'en' },
    })
    expect(brief.result.explanation).not.toBe(guided.result.explanation)
    expect(guided.result.explanation.length).toBeGreaterThan(
      brief.result.explanation.length,
    )
  })

  it('language changes the explanation wording', () => {
    const en = processNotification({
      message: bill.text,
      preferences: { language: 'en', level: 'standard' },
    })
    const fr = processNotification({
      message: bill.text,
      preferences: { language: 'fr', level: 'standard' },
    })
    expect(en.result.explanation).not.toBe(fr.result.explanation)
  })

  it('falls back to English for an unknown language without crashing', () => {
    const res = processNotification({
      message: bill.text,
      preferences: { language: 'de', level: 'standard' },
    })
    expect(res.status).toBe(ProcessStatus.OK)
    expect(res.result.explanation.length).toBeGreaterThan(0)
  })
})

describe('processNotification — explicit uncertainty, not invention', () => {
  it('states ambiguity for the unconfirmed family visit instead of a firm date', () => {
    const res = processNotification({ message: family.text })
    expect(res.status).toBe(ProcessStatus.OK)
    expect(res.result.uncertainties.length).toBeGreaterThan(0)
    const dateUncertainty = res.result.uncertainties.find(
      (u) => u.targetKind === 'importantDate',
    )
    expect(dateUncertainty).toBeTruthy()
  })

  it('every date entry has an explicit isKnown flag', () => {
    const res = processNotification({ message: bill.text })
    for (const date of res.result.dates) {
      expect(typeof date.isKnown).toBe('boolean')
    }
  })
})

describe('processNotification — optional suggested reply', () => {
  it('offers a reply for the clinic sample', () => {
    const res = processNotification({ message: clinic.text })
    expect(typeof res.result.suggestedReply).toBe('string')
    expect(res.result.suggestedReply.length).toBeGreaterThan(0)
  })

  it('offers no reply for the electricity bill (null, not invented)', () => {
    const res = processNotification({ message: bill.text })
    expect(res.result.suggestedReply).toBeNull()
  })
})
