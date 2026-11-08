import { describe, it, expect, vi } from 'vitest'
import { generateGuidance } from './guide.js'

function guidanceResponse(steps) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: JSON.stringify({ steps }) }] } }],
    }),
  }
}

const BASE = {
  taskLabel: 'Send photos on WhatsApp',
  app: 'WhatsApp',
  device: 'iphone',
  apiKey: 'test-key',
  model: 'test-model',
}

describe('generateGuidance', () => {
  it('returns normalized AI guidance and sends the key in a header', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        guidanceResponse([{ id: 's1', instruction: 'Open WhatsApp', detail: 'Green icon.' }]),
      )
    const { guidance } = await generateGuidance({ ...BASE, fetchImpl })
    expect(guidance.source).toBe('ai')
    expect(guidance.steps[0].instruction).toMatch(/open whatsapp/i)

    const [url, options] = fetchImpl.mock.calls[0]
    expect(url).not.toContain('test-key')
    expect(options.headers['x-goog-api-key']).toBe('test-key')
  })

  it('throws code "quota" on HTTP 429', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 429 })
    await expect(generateGuidance({ ...BASE, fetchImpl })).rejects.toMatchObject({
      code: 'quota',
    })
  })

  it('rejects an unsupported image type with code "bad-image"', async () => {
    const fetchImpl = vi.fn()
    await expect(
      generateGuidance({
        ...BASE,
        image: { mimeType: 'image/gif', dataBase64: 'AAAA' },
        fetchImpl,
      }),
    ).rejects.toMatchObject({ code: 'bad-image' })
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('throws code "invalid" when the model returns non-JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: 'sorry, no json here' }] } }],
      }),
    })
    await expect(generateGuidance({ ...BASE, fetchImpl })).rejects.toMatchObject({
      code: 'invalid',
    })
  })

  it('includes a valid image as an inline part', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(guidanceResponse([{ instruction: 'Tap send' }]))
    await generateGuidance({
      ...BASE,
      image: { mimeType: 'image/png', dataBase64: 'QUJD' },
      fetchImpl,
    })
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body)
    const parts = body.contents[0].parts
    const hasInline = parts.some((p) => p.inlineData?.mimeType === 'image/png')
    expect(hasInline).toBe(true)
  })
})
