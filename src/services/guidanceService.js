// Client-side guidance service. Mirrors the provider pattern: it calls our own
// /api/guide route (which holds the Gemini key server-side). It NEVER talks to
// Gemini directly and never sees the key.
//
// It always returns a guidance object that names its `source`:
//   - 'ai'       : generated live by Gemini for the user's situation
//   - 'scripted' : the hand-written fallback from guidanceTasks.js
// so the UI can tell the user honestly where the steps came from.
//
// It also returns a `notice` CODE (not UI text) for non-OK / fallback cases, so
// the component can translate it into the active language.

import {
  GUIDANCE_TASKS,
  getScriptedGuide,
  taskLabel,
} from '../data/guidanceTasks.js'
import { normalizeGuidance } from './guidanceSchema.js'

export const GuidanceStatus = {
  OK: 'ok',
  CONSENT_REQUIRED: 'consent-required',
  UNKNOWN_TASK: 'unknown-task',
  ERROR: 'error',
}

// Notice codes the UI translates (see 'guide.notice.*' / 'error.*' keys).
export const GuidanceNotice = {
  NONE: null,
  SCRIPTED_FALLBACK: 'scripted-fallback',
  UNAVAILABLE: 'unavailable',
}

function scriptedResult(taskType, device, language) {
  const steps = getScriptedGuide(taskType, device, language)
  if (!steps) return null
  return normalizeGuidance({ steps }, 'scripted')
}

/**
 * Get guidance for a task. Tries AI when consent is given; otherwise (or on any
 * AI failure) uses the scripted fallback if one exists.
 *
 * @param {object} args
 * @param {string} args.taskType
 * @param {string} args.device - 'iphone' | 'android'
 * @param {string} args.language - 'en' | 'fr' | 'es' | 'zh-CN'
 * @param {object} args.preferences - { aiConsent }
 * @param {string} [args.stuckText]
 * @param {{ mimeType, dataBase64 } | null} [args.image]
 * @returns {Promise<{ status, guidance|null, notice }>}
 */
export async function getGuidance({
  taskType,
  device,
  language = 'en',
  preferences,
  stuckText = '',
  image = null,
}) {
  const task = GUIDANCE_TASKS[taskType]
  if (!task) {
    return {
      status: GuidanceStatus.UNKNOWN_TASK,
      guidance: null,
      notice: GuidanceNotice.UNAVAILABLE,
    }
  }

  const scripted = scriptedResult(taskType, device, language)

  // Without consent we never send anything. Use the scripted guide if present.
  if (!preferences?.aiConsent) {
    if (scripted) {
      return { status: GuidanceStatus.OK, guidance: scripted, notice: GuidanceNotice.NONE }
    }
    return {
      status: GuidanceStatus.CONSENT_REQUIRED,
      guidance: null,
      notice: GuidanceNotice.UNAVAILABLE,
    }
  }

  // Consent given: try live AI (in the selected language), fall back to
  // scripted on any failure.
  try {
    const response = await fetch('/api/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskLabel: taskLabel(taskType, language),
        app: task.app,
        device,
        language,
        stuckText,
        image,
      }),
    })

    if (response.ok) {
      const payload = await response.json()
      const guidance = normalizeGuidance(payload?.guidance, 'ai')
      return { status: GuidanceStatus.OK, guidance, notice: GuidanceNotice.NONE }
    }
    // Non-OK: fall through to scripted below.
  } catch {
    // Network error: fall through to scripted below.
  }

  if (scripted) {
    return {
      status: GuidanceStatus.OK,
      guidance: scripted,
      notice: GuidanceNotice.SCRIPTED_FALLBACK,
    }
  }

  return {
    status: GuidanceStatus.ERROR,
    guidance: null,
    notice: GuidanceNotice.UNAVAILABLE,
  }
}

export default { getGuidance, GuidanceStatus, GuidanceNotice }
