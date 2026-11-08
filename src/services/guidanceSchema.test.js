import { describe, it, expect } from 'vitest'
import { normalizeGuidance } from './guidanceSchema.js'

describe('normalizeGuidance', () => {
  it('keeps valid steps and records the source', () => {
    const g = normalizeGuidance(
      { steps: [{ id: 's1', instruction: 'Do a thing', detail: 'with care' }] },
      'ai',
    )
    expect(g.source).toBe('ai')
    expect(g.steps).toHaveLength(1)
    expect(g.steps[0].instruction).toBe('Do a thing')
  })

  it('drops steps with no instruction and assigns ids when missing', () => {
    const g = normalizeGuidance(
      {
        steps: [
          { instruction: 'First' },
          { instruction: '   ' }, // dropped
          { detail: 'no instruction' }, // dropped
        ],
      },
      'scripted',
    )
    expect(g.steps).toHaveLength(1)
    expect(g.steps[0].id).toBeTruthy()
  })

  it('throws when there are no usable steps', () => {
    expect(() => normalizeGuidance({ steps: [] }, 'ai')).toThrow()
    expect(() => normalizeGuidance({}, 'ai')).toThrow()
    expect(() => normalizeGuidance(null, 'ai')).toThrow()
  })

  it('coerces an unknown source to scripted', () => {
    const g = normalizeGuidance({ steps: [{ instruction: 'x' }] }, 'weird')
    expect(g.source).toBe('scripted')
  })
})
