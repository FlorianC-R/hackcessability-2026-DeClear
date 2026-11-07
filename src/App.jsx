import { useMemo, useState } from 'react'
import AppHeader from './components/AppHeader.jsx'
import NotificationInput from './components/NotificationInput.jsx'
import ResultPanel from './components/ResultPanel.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import { sampleNotifications } from './data/sampleNotifications.js'
import { LANGUAGES } from './data/settingsOptions.js'
import { loadSettings, saveSettings } from './storage/settingsStorage.js'
import { isSpeechSupported } from './platform/speech.js'
import { processNotification } from './services/notificationProcessor.js'
import { ProcessStatus } from './services/processorTypes.js'
import './App.css'

// Whether this browser can read text aloud. Computed once at startup.
const speechSupported = isSpeechSupported()

function App() {
  // The message currently in the input area.
  const [text, setText] = useState('')
  // Which sample card is selected, if any.
  const [selectedSampleId, setSelectedSampleId] = useState(null)
  // The exact message that was last submitted for processing. Keeping this
  // separate from the editable input lets us re-run the processor when
  // settings change without depending on later edits to the text box.
  const [submittedMessage, setSubmittedMessage] = useState(null)
  // Whether the original-message panel is expanded.
  const [isOriginalOpen, setIsOriginalOpen] = useState(false)

  // User settings, loaded from localStorage once at startup. If the browser
  // cannot read aloud, we never start with read-aloud "on".
  const [settings, setSettings] = useState(() => {
    const loaded = loadSettings()
    return speechSupported ? loaded : { ...loaded, readAloud: false }
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)

  // Persist settings whenever they change, and remember if the save failed so
  // we can tell the user honestly.
  function handleSettingsChange(next) {
    setSettings(next)
    const ok = saveSettings(next)
    setSaveFailed(!ok)
  }

  // Selecting a sample fills the input with its text and clears any old result.
  function handleSelectSample(id) {
    const sample = sampleNotifications.find((item) => item.id === id)
    if (!sample) return
    setSelectedSampleId(id)
    setText(sample.text)
    setSubmittedMessage(null)
    setIsOriginalOpen(false)
  }

  // Typing clears the sample selection, since the message is now the user's own.
  function handleChangeText(value) {
    setText(value)
    if (selectedSampleId) setSelectedSampleId(null)
    if (submittedMessage !== null) setSubmittedMessage(null)
  }

  // "Explain this message": hand the text to the processing service. The
  // service decides what can and cannot be explained — the UI does not invent
  // results of its own.
  function handleExplain() {
    setSubmittedMessage(text)
    setIsOriginalOpen(false)
  }

  // Run the processor whenever there is a submitted message or the preferences
  // change, so the shown explanation always reflects the current settings.
  const response = useMemo(() => {
    if (submittedMessage === null) return null
    return processNotification({
      message: submittedMessage,
      preferences: { level: settings.level, language: settings.language },
    })
  }, [submittedMessage, settings.level, settings.language])

  const speechLang =
    LANGUAGES.find((item) => item.value === settings.language)?.speechLang ??
    'en-US'

  const okResult =
    response && response.status === ProcessStatus.OK ? response.result : null
  // Any non-OK status carries a plain-language message to show the user.
  const notice =
    response && response.status !== ProcessStatus.OK ? response.message : ''

  return (
    <main className="dc-app">
      <AppHeader />

      <SettingsPanel
        settings={settings}
        onChange={handleSettingsChange}
        isOpen={isSettingsOpen}
        onToggle={() => setIsSettingsOpen((open) => !open)}
        speechSupported={speechSupported}
        saveFailed={saveFailed}
      />

      <NotificationInput
        samples={sampleNotifications}
        selectedSampleId={selectedSampleId}
        text={text}
        onSelectSample={handleSelectSample}
        onChangeText={handleChangeText}
        onExplain={handleExplain}
        notice={notice}
      />

      {okResult && response && (
        <ResultPanel
          result={okResult}
          original={response.original}
          isOriginalOpen={isOriginalOpen}
          onToggleOriginal={() => setIsOriginalOpen((open) => !open)}
          showReadAloud={settings.readAloud && speechSupported}
          speechLang={speechLang}
        />
      )}
    </main>
  )
}

export default App
