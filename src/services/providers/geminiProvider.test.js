import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { process as geminiProcess } from './geminiProvider.js'
import { ProcessStatus } from '../processorTypes.js'

const MESSAGE = 'Your appointment with Dr. Lee is on 18 November at 10:30 AM.'

const PREFS = { level: 'standard', language: 'en', aiConsent: true }

function mockFetchOnce({ ok = true, status = 200, body = {} }) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  delete globalThis.fetch
})

describe('geminiProvider — consent gating', () => {
  beforeEach(() => {
    // fetch should NOT be called when consent is missing.
    globalThis.fetch = vi.fn()
  })

  it('refuses to send without explicit consent', async () => {
    const out = await geminiProcess({
      message: MESSAGE,
      preferences: { level: 'standard', language: 'en', aiConsent: false },
    })
    expect(out.status).toBe(ProcessStatus.CONSENT_REQUIRED)
    expect(out.result).toBeNull()
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})

describe('geminiProvider — success path', () => {
  it('returns an OK, grounded result on a valid response', async () => {
    mockFetchOnce({
      body: {
        result: {
          title: 'Appointment',
          explanation: 'A reminder about your appointment with Dr. Lee.',
          actions: [],
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
          urgency: 'Medium',
          uncertainties: [],
          suggestedReply: null,
        },
      },
    })

    const out = await geminiProcess({ message: MESSAGE, preferences: PREFS })
    expect(out.status).toBe(ProcessStatus.OK)
    expect(out.result.explanation.length).toBeGreaterThan(0)
    // The quoted date really appears in the message, so it is verified.
    expect(out.result.dates[0].sourceVerified).toBe(true)
  })

  it('re-grounds on the client: a fabricated quote is flagged', async () => {
    mockFetchOnce({
      body: {
        result: {
          title: 'x',
          explanation: 'x',
          actions: [
            { id: 'a1', text: 'Pay now', sourceText: 'pay us $999 today' },
          ],
          dates: [],
          urgency: 'High',
          uncertainties: [],
        },
      },
    })
    const out = await geminiProcess({ message: MESSAGE, preferences: PREFS })
    expect(out.status).toBe(ProcessStatus.OK)
    expect(out.result.actions[0].sourceVerified).toBe(false)
    expect(out.result.actions[0].sourceText).toBe('')
  })
})

describe('geminiProvider — error mapping', () => {
  it('maps not-configured', async () => {
    mockFetchOnce({ ok: false, status: 503, body: { code: 'not-configured' } })
    const out = await geminiProcess({ message: MESSAGE, preferences: PREFS })
    expect(out.status).toBe(ProcessStatus.NOT_CONFIGURED)
  })

  it('maps rate-limited', async () => {
    mockFetchOnce({ ok: false, status: 429, body: { code: 'rate-limited' } })
    const out = await geminiProcess({ message: MESSAGE, preferences: PREFS })
    expect(out.status).toBe(ProcessStatus.RATE_LIMITED)
  })

  it('maps quota-exhausted', async () => {
    mockFetchOnce({ ok: false, status: 429, body: { code: 'quota-exhausted' } })
    const out = await geminiProcess({ message: MESSAGE, preferences: PREFS })
    expect(out.status).toBe(ProcessStatus.QUOTA_EXHAUSTED)
  })

  it('maps an unknown server error to ERROR', async () => {
    mockFetchOnce({ ok: false, status: 502, body: { code: 'error' } })
    const out = await geminiProcess({ message: MESSAGE, preferences: PREFS })
    expect(out.status).toBe(ProcessStatus.ERROR)
  })

  it('handles a network failure gracefully', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'))
    const out = await geminiProcess({ message: MESSAGE, preferences: PREFS })
    expect(out.status).toBe(ProcessStatus.ERROR)
    expect(out.result).toBeNull()
  })

  it('handles a malformed OK response', async () => {
    mockFetchOnce({ body: { result: { nonsense: true } } })
    const out = await geminiProcess({ message: MESSAGE, preferences: PREFS })
    expect(out.status).toBe(ProcessStatus.ERROR)
  })
})
