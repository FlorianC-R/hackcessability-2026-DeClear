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

// Speak the given text in the given language (e.g. 'en-US', 'fr-FR').
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
    if (onEnd) utterance.onend = onEnd
    if (onError) utterance.onerror = onError
    window.speechSynthesis.speak(utterance)
  } catch {
    onError?.()
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
