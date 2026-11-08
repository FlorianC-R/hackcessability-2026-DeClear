// Best-effort, no-cost rate limiting for the public /api/explain route.
//
// IMPORTANT LIMITATION — read before relying on this:
// This is an IN-MEMORY, PER-INSTANCE counter. Vercel serverless functions run
// as many short-lived instances, and memory is NOT shared between them and is
// lost on cold start. So this does NOT provide a reliable global request cap
// and MUST NOT be described as production-grade abuse protection. It only
// smooths bursts hitting a single warm instance.
//
// The real, zero-cost protections for this prototype are:
//   - a small per-request output-token cap and request timeout (bounds cost),
//   - the Gemini free tier itself (no billing is ever enabled, so quota
//     exhaustion fails closed rather than spending money),
//   - a short input-size limit.
// A durable limiter (e.g. Upstash/Redis or Vercel KV) would be the next step
// but is deferred to avoid adding a paid/managed dependency without approval.

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 8 // per warm instance, per client key

const hits = new Map() // key -> number[] (timestamps within the window)

// Returns { allowed: boolean, retryAfterMs: number }.
export function checkRateLimit(key, now = Date.now()) {
  const windowStart = now - WINDOW_MS
  const recent = (hits.get(key) ?? []).filter((t) => t > windowStart)

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recent[0]
    return { allowed: false, retryAfterMs: Math.max(0, oldest + WINDOW_MS - now) }
  }

  recent.push(now)
  hits.set(key, recent)

  // Opportunistic cleanup so the map does not grow without bound.
  if (hits.size > 500) {
    for (const [k, times] of hits) {
      if (times.every((t) => t <= windowStart)) hits.delete(k)
    }
  }

  return { allowed: true, retryAfterMs: 0 }
}

export const RATE_LIMIT_CONFIG = { WINDOW_MS, MAX_REQUESTS_PER_WINDOW }
