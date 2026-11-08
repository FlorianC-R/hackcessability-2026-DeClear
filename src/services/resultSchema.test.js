import { describe, it, expect } from 'vitest'
import { normalizeResult, groundResult } from './resultSchema.js'

const ORIGINAL = `Riverside Clinic. Your appointment with Dr. Lee is on 18 November at 10:30 AM. Please arrive 15 minutes early.`

describe('normalizeResult', () => {
  it('fills missing collections with empty arrays and a safe urgency', () => {
    const r = normalizeResult({ explanation: 'Hello' })
    expect(r.actions).toEqual([])
    expect(r.dates).toEqual([])
    expect(r.uncertainties).toEqual([])
    expect(r.urgency).toBe('None')
    expect(r.suggestedReply).toBeNull()
  })

  it('throws when there is no explanation', () => {
    expect(() => normalizeResult({ title: 'x' })).toThrow()
    expect(() => normalizeResult(null)).toThrow()
    expect(() => normalizeResult('nope')).toThrow()
  })

  it('coerces an invalid urgency to None', () => {
    const r = normalizeResult({ explanation: 'x', urgency: 'Critical' })
    expect(r.urgency).toBe('None')
  })

  it('keeps a valid urgency', () => {
    const r = normalizeResult({ explanation: 'x', urgency: 'High' })
    expect(r.urgency).toBe('High')
  })
})

describe('groundResult — sourceText must appear in the input', () => {
  it('keeps a verified quote and marks it sourceVerified', () => {
    const base = normalizeResult({
      explanation: 'Appointment reminder.',
      actions: [
        { id: 'a1', text: 'Arrive early', sourceText: 'arrive 15 minutes early' },
      ],
    })
    const grounded = groundResult(base, ORIGINAL)
    expect(grounded.actions[0].sourceVerified).toBe(true)
    expect(grounded.actions[0].sourceText).toMatch(/arrive 15 minutes early/i)
    // No extra uncertainty added for a verified quote.
    expect(grounded.uncertainties.length).toBe(0)
  })

  it('flags a quote that is NOT in the input and clears it', () => {
    const base = normalizeResult({
      explanation: 'x',
      actions: [
        { id: 'a1', text: 'Pay $500', sourceText: 'you owe five hundred dollars' },
      ],
    })
    const grounded = groundResult(base, ORIGINAL)
    expect(grounded.actions[0].sourceVerified).toBe(false)
    expect(grounded.actions[0].sourceText).toBe('')
    const note = grounded.uncertainties.find((u) => u.targetId === 'a1')
    expect(note).toBeTruthy()
    expect(note.label).toMatch(/not found word-for-word/i)
  })

  it('labels a derived date as a calculation, never a direct quote', () => {
    const base = normalizeResult({
      explanation: 'x',
      dates: [
        {
          id: 'd1',
          label: 'Arrive by',
          dateText: '10:15 AM',
          isKnown: true,
          sourceText: '10:15 AM',
          isDerived: true,
        },
      ],
    })
    const grounded = groundResult(base, ORIGINAL)
    expect(grounded.dates[0].isDerived).toBe(true)
    expect(grounded.dates[0].sourceText).toBe('')
    expect(grounded.dates[0].sourceVerified).toBe(false)
    const note = grounded.uncertainties.find((u) => u.targetId === 'd1')
    expect(note.label).toMatch(/worked out from your message/i)
  })

  it('verifies a real quoted date present in the input', () => {
    const base = normalizeResult({
      explanation: 'x',
      dates: [
        {
          id: 'd1',
          label: 'Appointment',
          dateText: '18 November at 10:30 AM',
          isKnown: true,
          sourceText: '18 November at 10:30 AM',
          isDerived: false,
        },
      ],
    })
    const grounded = groundResult(base, ORIGINAL)
    expect(grounded.dates[0].sourceVerified).toBe(true)
    expect(grounded.dates[0].sourceText).toMatch(/18 November/i)
  })
})

describe('normalizeResult — digital task tagging', () => {
  it('keeps a supported taskType and marks the action guidable', () => {
    const r = normalizeResult({
      explanation: 'x',
      actions: [
        {
          id: 'a1',
          text: 'Send photos on WhatsApp',
          sourceText: '',
          isDigitalTask: true,
          taskType: 'send-photos-whatsapp',
        },
      ],
    })
    expect(r.actions[0].isDigitalTask).toBe(true)
    expect(r.actions[0].taskType).toBe('send-photos-whatsapp')
  })

  it('rejects an unsupported/invented taskType (forces plain action)', () => {
    const r = normalizeResult({
      explanation: 'x',
      actions: [
        {
          id: 'a1',
          text: 'Book a flight to Paris',
          sourceText: '',
          isDigitalTask: true,
          taskType: 'book-a-flight', // not something we can guide
        },
      ],
    })
    expect(r.actions[0].isDigitalTask).toBe(false)
    expect(r.actions[0].taskType).toBe('none')
  })

  it('defaults to a plain action when no task fields are present', () => {
    const r = normalizeResult({
      explanation: 'x',
      actions: [{ id: 'a1', text: 'Pay the bill', sourceText: '' }],
    })
    expect(r.actions[0].isDigitalTask).toBe(false)
    expect(r.actions[0].taskType).toBe('none')
  })
})
