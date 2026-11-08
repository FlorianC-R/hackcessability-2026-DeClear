import { useEffect, useState } from 'react'
import { speak, stopSpeaking, hasVoiceFor } from '../platform/speech.js'
import { useTranslation } from '../i18n/context.js'

// A single button that reads the given text aloud, and switches to a "Stop"
// label while speaking. It is only rendered by the parent when the read-aloud
// setting is on and the browser supports speech. If no voice is installed for
// the current language, it says so gracefully rather than failing silently.
function ReadAloudControl({ text, speechLang }) {
  const { t } = useTranslation()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [failed, setFailed] = useState(false)

  // If the text or language changes (new explanation), stop any current speech.
  useEffect(() => {
    return () => stopSpeaking()
  }, [text, speechLang])

  const noVoice = !hasVoiceFor(speechLang)

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
        {isSpeaking ? t('readaloud.stop') : t('readaloud.play')}
      </button>
      {noVoice && !failed && (
        <p className="dc-help-text" role="status">
          {t('readaloud.noVoice')}
        </p>
      )}
      {failed && (
        <p className="dc-help-text" role="alert">
          {t('readaloud.unavailable')}
        </p>
      )}
    </div>
  )
}

export default ReadAloudControl
