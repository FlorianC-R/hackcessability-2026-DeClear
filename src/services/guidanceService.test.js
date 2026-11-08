import { describe, it, expect, afterEach, vi } from 'vitest'
import { getGuidance, GuidanceStatus, GuidanceNotice } from './guidanceService.js'
import { TASK_TYPES } from '../data/guidanceTasks.js'

const WHATSAPP = TASK_TYPES.SEND_PHOTOS_WHATSAPP

afterEach(() => {
  vi.restoreAllMocks()
  delete globalThis.fetch
})

describe('getGuidance — unknown task', () => {
  it('reports an unknown task', async () => {
    const out = await getGuidance({
      taskType: 'not-a-real-task',
      device: 'iphone',
      preferences: { aiConsent: true },
    })
    expect(out.status).toBe(GuidanceStatus.UNKNOWN_TASK)
    expect(out.guidance).toBeNull()
  })
})

describe('getGuidance — without consent', () => {
  it('uses the scripted fallback and does NOT call the network', async () => {
    globalThis.fetch = vi.fn()
    const out = await getGuidance({
      taskType: WHATSAPP,
      device: 'iphone',
      preferences: { aiConsent: false },
    })
    expect(out.status).toBe(GuidanceStatus.OK)
    expect(out.guidance.source).toBe('scripted')
    expect(out.guidance.steps.length).toBeGreaterThan(0)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})

describe('getGuidance — with consent', () => {
  it('returns live AI guidance when the server responds OK', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        guidance: {
          steps: [
            { id: 'a', instruction: 'Open WhatsApp', detail: 'Green icon.' },
            { id: 'b', instruction: 'Tap the chat', detail: '' },
          ],
        },
      }),
    })
    const out = await getGuidance({
      taskType: WHATSAPP,
      device: 'iphone',
      preferences: { aiConsent: true },
    })
    expect(out.status).toBe(GuidanceStatus.OK)
    expect(out.guidance.source).toBe('ai')
    expect(out.guidance.steps[0].instruction).toMatch(/open whatsapp/i)
  })

  it('falls back to scripted steps when the server errors', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) })
    const out = await getGuidance({
      taskType: WHATSAPP,
      device: 'iphone',
      preferences: { aiConsent: true },
    })
    expect(out.status).toBe(GuidanceStatus.OK)
    expect(out.guidance.source).toBe('scripted')
    expect(out.notice).toBe(GuidanceNotice.SCRIPTED_FALLBACK)
  })

  it('falls back to scripted steps when the network throws', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('offline'))
    const out = await getGuidance({
      taskType: WHATSAPP,
      device: 'iphone',
      preferences: { aiConsent: true },
    })
    expect(out.status).toBe(GuidanceStatus.OK)
    expect(out.guidance.source).toBe('scripted')
  })
})
