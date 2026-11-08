// Validation for a guidance response (the step-by-step instructions).
// Framework-independent so the serverless route, the client provider, and the
// tests all share it.
//
// Guidance shape:
//   {
//     steps: [{ id: string, instruction: string, detail: string }],
//     source: 'ai' | 'scripted',
//   }

function asString(v, fallback = '') {
  return typeof v === 'string' ? v : fallback
}

/**
 * Coerce an untrusted object into a valid guidance object. Throws if there are
 * no usable steps, so a provider never returns empty guidance.
 *
 * @param {unknown} raw
 * @param {'ai'|'scripted'} source
 */
export function normalizeGuidance(raw, source) {
  const rawSteps = Array.isArray(raw?.steps) ? raw.steps : []
  const steps = rawSteps
    .map((s, i) => ({
      id: asString(s?.id) || `step-${i + 1}`,
      instruction: asString(s?.instruction).trim(),
      detail: asString(s?.detail).trim(),
    }))
    .filter((s) => s.instruction.length > 0)

  if (steps.length === 0) {
    throw new Error('Guidance has no usable steps')
  }

  return { steps, source: source === 'ai' ? 'ai' : 'scripted' }
}

export default { normalizeGuidance }
