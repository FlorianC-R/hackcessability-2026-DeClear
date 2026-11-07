import { useEffect, useState } from 'react'
import { speak, stopSpeaking } from '../platform/speech.js'

// A single button that reads the given text aloud, and switches to a "Stop"
// label while speaking. It is only rendered by the parent when the read-aloud
// setting is on and the browser supports speech.
function ReadAloudControl({ text, speechLang }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [failed, setFailed] = useState(false)

  // If the text or language changes (new explanation), stop any current
  // speech so we never read stale content.
  useEffect(() => {
    return () => stopSpeaking()
  }, [text, speechLang])

  function handleClick() {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
      return
    }
    setFailed(false)
    setIsSpeaking(true)
    speak(text, speechLang, {
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false)
        setFailed(true)
      },
    })
  }

  return (
    <div className="dc-readaloud">
      <button
        type="button"
        className="dc-secondary-button"
        onClick={handleClick}
      >
        {isSpeaking ? 'Stop reading' : 'Read this aloud'}
      </button>
      {failed && (
        <p className="dc-help-text" role="alert">
          Sorry, reading aloud is not working in this browser right now.
        </p>
      )}
    </div>
  )
}

export default ReadAloudControl
