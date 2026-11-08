import { describe, it, expect, vi } from 'vitest'
import { buildPrompt, generateExplanation } from './gemini.js'

const MESSAGE = 'Pay $84.60 by 30 November.'

function geminiResponse(obj) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: JSON.stringify(obj) }] } }],
    }),
  }
}

describe('buildPrompt', () => {
  it('embeds the message and forbids invention', () => {
    const prompt = buildPrompt({ message: MESSAGE, level: 'standard', language: 'en' })
    expect(prompt).toContain(MESSAGE)
    expect(prompt).toMatch(/never invent/i)
    expect(prompt).toMatch(/exact word-for-word excerpt/i)
  })
})

describe('generateExplanation', () => {
  it('validates and grounds a good response', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      geminiResponse({
        title: 'Electricity bill',
        explanation: 'You owe money by a date.',
        actions: [{ id: 'a1', text: 'Pay the bill', sourceText: 'Pay $84.60' }],
        dates: [
          {
            id: 'd1',
            label: 'Due date',
            dateText: '30 November',
            isKnown: true,
            sourceText: '30 November',
            isDerived: false,
          },
        ],
        urgency: 'High',
        uncertainties: [],
        suggestedReply: null,
      }),
    )

    const { result } = await generateExplanation({
      message: MESSAGE,
      level: 'standard',
      language: 'en',
      apiKey: 'test-key',
      model: 'test-model',
      fetchImpl,
    })

    expect(result.urgency).toBe('High')
    expect(result.actions[0].sourceVerified).toBe(true)
    expect(result.dates[0].sourceVerified).toBe(true)
    // The key is sent in a header, never in the URL.
    const [url, options] = fetchImpl.mock.calls[0]
    expect(url).not.toContain('test-key')
    expect(options.headers['x-goog-api-key']).toBe('test-key')
  })

  it('throws code "quota" on HTTP 429', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 429 })
    await expect(
      generateExplanation({
        message: MESSAGE,
        level: 'standard',
        language: 'en',
        apiKey: 'k',
        model: 'm',
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: 'quota' })
  })

  it('throws code "invalid" when the model returns non-JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'not json at all' }] } }],
      }),
    })
    await expect(
      generateExplanation({
        message: MESSAGE,
        level: 'standard',
        language: 'en',
        apiKey: 'k',
        model: 'm',
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: 'invalid' })
  })

  it('throws code "upstream" on a non-429 error status', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 })
    await expect(
      generateExplanation({
        message: MESSAGE,
        level: 'standard',
        language: 'en',
        apiKey: 'k',
        model: 'm',
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: 'upstream' })
  })
})

describe('generateExplanation — retry on transient failures', () => {
  const GOOD = {
    title: 'Bill',
    explanation: 'You owe money by a date.',
    actions: [],
    dates: [],
    urgency: 'High',
    uncertainties: [],
  }

  it('retries a 503 and then succeeds', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'high demand' })
      .mockResolvedValueOnce(geminiResponse(GOOD))

    const { result } = await generateExplanation({
      message: MESSAGE,
      level: 'standard',
      language: 'en',
      apiKey: 'k',
      model: 'm',
      fetchImpl,
    })
    expect(result.urgency).toBe('High')
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('gives up after MAX_ATTEMPTS of persistent 503', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 503, text: async () => 'high demand' })

    await expect(
      generateExplanation({
        message: MESSAGE,
        level: 'standard',
        language: 'en',
        apiKey: 'k',
        model: 'm',
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: 'upstream', upstreamStatus: 503 })
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })

  it('does NOT retry a 404 (bad model) — fails fast', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 404, text: async () => 'not found' })

    await expect(
      generateExplanation({
        message: MESSAGE,
        level: 'standard',
        language: 'en',
        apiKey: 'k',
        model: 'm',
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: 'upstream', upstreamStatus: 404 })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })
})
