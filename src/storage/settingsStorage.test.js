import { describe, it, expect, beforeEach, vi } from 'vitest'
import { loadSettings, saveSettings } from './settingsStorage.js'
import { DEFAULT_SETTINGS } from '../data/settingsOptions.js'

// Use an in-memory localStorage stub so the test does not depend on jsdom's
// (sometimes unavailable) storage.
function installMemoryStorage() {
  const map = new Map()
  const storage = {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  }
  vi.stubGlobal('window', { localStorage: storage })
  return storage
}

beforeEach(() => {
  vi.unstubAllGlobals()
})

describe('settingsStorage — language persistence', () => {
  it('round-trips each supported language', () => {
    installMemoryStorage()
    for (const language of ['en', 'fr', 'es', 'zh-CN']) {
      const ok = saveSettings({ ...DEFAULT_SETTINGS, language })
      expect(ok).toBe(true)
      expect(loadSettings().language).toBe(language)
    }
  })

  it('falls back to the default language for an invalid stored value', () => {
    const storage = installMemoryStorage()
    storage.setItem(
      'declear.settings.v1',
      JSON.stringify({ ...DEFAULT_SETTINGS, language: 'klingon' }),
    )
    expect(loadSettings().language).toBe(DEFAULT_SETTINGS.language)
  })

  it('returns defaults when nothing is stored', () => {
    installMemoryStorage()
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS)
  })
})
