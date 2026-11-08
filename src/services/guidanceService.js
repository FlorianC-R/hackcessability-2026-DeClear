// Client-side guidance service. Mirrors the provider pattern: it calls our own
// /api/guide route (which holds the Gemini key server-side). It NEVER talks to
// Gemini directly and never sees the key.
//
// It always returns a guidance object that names its `source`:
//   - 'ai'       : generated live by Gemini for the user's situation
//   - 'scripted' : the hand-written fallback from guidanceTasks.js
// so the UI can tell the user honestly where the steps came from.

import { GUIDANCE_TASKS, getScriptedGuide } from '../data/guidanceTasks.js'
import { normalizeGuidance } from './guidanceSchema.js'

export const GuidanceStatus = {
  OK: 'ok',
  CONSENT_REQUIRED: 'consent-required',
  UNKNOWN_TASK: 'unknown-task',
  ERROR: 'error',
}

// Build a scripted result, or null if we have no script for this task/device.
function scriptedResult(taskType, device) {
  const steps = getScriptedGuide(taskType, device)
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
 * @param {object} args.preferences - { aiConsent }
 * @param {string} [args.stuckText]
 * @param {{ mimeType, dataBase64 } | null} [args.image]
 * @returns {Promise<{ status, guidance|null, message|null }>}
 */
export async function getGuidance({
  taskType,
  device,
  preferences,
  stuckText = '',
  image = null,
}) {
  const task = GUIDANCE_TASKS[taskType]
  if (!task) {
    return {
      status: GuidanceStatus.UNKNOWN_TASK,
      guidance: null,
      message: 'DeClear does not have a guide for this task yet.',
    }
  }

  const scripted = scriptedResult(taskType, device)

  // Without consent we never send anything. Use the scripted guide if present.
  if (!preferences?.aiConsent) {
    if (scripted) {
      return { status: GuidanceStatus.OK, guidance: scripted, message: null }
    }
    return {
      status: GuidanceStatus.CONSENT_REQUIRED,
      guidance: null,
      message:
        'Turn on AI mode and give consent to get step-by-step help for this task.',
    }
  }

  // Consent given: try live AI, fall back to scripted on any failure.
  try {
    const response = await fetch('/api/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskLabel: task.label,
        app: task.app,
        device,
        stuckText,
        image,
      }),
    })

    if (response.ok) {
      const payload = await response.json()
      const guidance = normalizeGuidance(payload?.guidance, 'ai')
      return { status: GuidanceStatus.OK, guidance, message: null }
    }
    // Non-OK: fall through to scripted below.
  } catch {
    // Network error: fall through to scripted below.
  }

  if (scripted) {
    return {
      status: GuidanceStatus.OK,
      guidance: scripted,
      message:
        'Live AI help was not available, so these are DeClear’s written steps instead.',
    }
  }

  return {
    status: GuidanceStatus.ERROR,
    guidance: null,
    message: 'Sorry, step-by-step help is not available right now.',
  }
}

export default { getGuidance, GuidanceStatus }
