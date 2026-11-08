// A thin wrapper around the browser's built-in speechSynthesis API.
//
// Read-aloud uses the browser's own voice. No audio or text is sent to any
// server — this keeps the "process everything locally" promise intact.

// True only if this browser actually supports speech synthesis.
export function isSpeechSupported() {
  return (
    typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function'
  )
}

// Names (or fragments) of the nicer, more natural voices that ship with common
// systems. We prefer these over the default robotic voice when available.
// Matching is case-insensitive and by substring, so "Google UK English Female"
// and "Microsoft Aria Online (Natural)" both match.
const PREFERRED_VOICE_HINTS = [
  'natural', // Microsoft "… (Natural)" voices, highest quality
  'siri',
  'premium',
  'enhanced',
  'google', // Google voices are noticeably smoother than eSpeak/SAPI
  'samantha', // Apple US female, warm
  'aria',
  'jenny',
  'flo',
  'eloquence',
]

// Choose the best-sounding available voice for a language. Scores each voice:
// a higher score for matching the exact locale, for being a "preferred" natural
// voice, and a penalty for being flagged as a plain default. Returns null if no
// voice matches the language (caller then lets the browser decide).
export function pickBestVoice(speechLang) {
  if (!isSpeechSupported()) return null
  let voices
  try {
    voices = window.speechSynthesis.getVoices()
  } catch {
    return null
  }
  if (!voices || voices.length === 0) return null

  const want = (speechLang || 'en-US').toLowerCase()
  const wantBase = want.split('-')[0]

  const matches = voices.filter(
    (v) => (v.lang ?? '').toLowerCase().split('-')[0] === wantBase,
  )
  if (matches.length === 0) return null

  function score(v) {
    const name = (v.name ?? '').toLowerCase()
    const lang = (v.lang ?? '').toLowerCase()
    let s = 0
    if (lang === want) s += 3 // exact locale (e.g. en-US) over just en
    const hintIndex = PREFERRED_VOICE_HINTS.findIndex((h) => name.includes(h))
    if (hintIndex !== -1) s += 10 - hintIndex // earlier hints score higher
    if (v.localService === false) s += 1 // online/cloud voices tend to be nicer
    if (v.default) s -= 1 // the default is usually the robotic one
    return s
  }

  return matches.slice().sort((a, b) => score(b) - score(a))[0]
}

// Speak the given text in the given language (e.g. 'en-US', 'fr-FR'), using the
// nicest available voice and a gentle, natural delivery (slightly slower, so it
// is easy to follow and sounds less mechanical).
// `onEnd` and `onError` let the caller update the UI when speech finishes or
// fails. Any ongoing speech is cancelled first so we never overlap voices.
export function speak(text, speechLang, { onEnd, onError } = {}) {
  if (!isSpeechSupported()) {
    onError?.()
    return
  }
  try {
    window.speechSynthesis.cancel()
    const utterance = new window.SpeechSynthesisUtterance(text)
    if (speechLang) utterance.lang = speechLang
    const voice = pickBestVoice(speechLang)
    if (voice) utterance.voice = voice
    // A calmer, warmer delivery than the defaults: a touch slower and a natural
    // pitch read more pleasantly, especially for older listeners.
    utterance.rate = 0.95
    utterance.pitch = 1.0
    if (onEnd) utterance.onend = onEnd
    if (onError) utterance.onerror = onError
    window.speechSynthesis.speak(utterance)
  } catch {
    onError?.()
  }
}

// Prime the voice list. In some browsers (e.g. Chrome) getVoices() is empty
// until the async 'voiceschanged' event fires, so we nudge it once at load so a
// good voice is ready by the time the user presses Read aloud.
if (
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.speechSynthesis.getVoices === 'function'
) {
  try {
    window.speechSynthesis.getVoices()
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
      // Accessing the list is enough to keep it warm; no action needed.
      window.speechSynthesis.getVoices()
    })
  } catch {
    // Ignore — voice priming is best-effort.
  }
}

// Stop any speech that is currently playing.
export function stopSpeaking() {
  if (!isSpeechSupported()) return
  try {
    window.speechSynthesis.cancel()
  } catch {
    // Ignore — stopping is best-effort.
  }
}

// Whether the browser has a voice whose language matches `speechLang` (e.g.
// 'fr-FR' matches a 'fr' or 'fr-FR' voice). Voices load asynchronously, so an
// empty list is treated as "unknown" (true) rather than "missing", to avoid a
// false warning before voices are ready.
export function hasVoiceFor(speechLang) {
  if (!isSpeechSupported() || !speechLang) return true
  try {
    const voices = window.speechSynthesis.getVoices()
    if (!voices || voices.length === 0) return true // not loaded yet
    const base = speechLang.toLowerCase().split('-')[0]
    return voices.some((v) =>
      (v.lang ?? '').toLowerCase().split('-')[0] === base,
    )
  } catch {
    return true
  }
}
