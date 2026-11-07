import { useMemo, useState } from 'react'
import AppHeader from './components/AppHeader.jsx'
import NotificationInput, { MAX_LENGTH } from './components/NotificationInput.jsx'
import ResultPanel from './components/ResultPanel.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import { sampleNotifications } from './data/sampleNotifications.js'
import { LANGUAGES } from './data/settingsOptions.js'
import { loadSettings, saveSettings } from './storage/settingsStorage.js'
import { isSpeechSupported } from './platform/speech.js'
import './App.css'

// Whether this browser can read text aloud. Computed once at startup.
const speechSupported = isSpeechSupported()

function App() {
  // The message currently in the input area.
  const [text, setText] = useState('')
  // Which sample card is selected, if any.
  const [selectedSampleId, setSelectedSampleId] = useState(null)
  // The id of the sample whose result is currently shown. The actual result
  // is derived from this plus the current settings, so changing a setting
  // updates the visible explanation immediately.
  const [resultSampleId, setResultSampleId] = useState(null)
  // Whether the original-message panel is expanded.
  const [isOriginalOpen, setIsOriginalOpen] = useState(false)
  // A plain-language notice shown near the input (validation or info).
  const [notice, setNotice] = useState('')

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
    setResultSampleId(null)
    setNotice('')
    setIsOriginalOpen(false)
  }

  // Typing clears the sample selection, since the message is now the user's own.
  function handleChangeText(value) {
    setText(value)
    if (selectedSampleId) setSelectedSampleId(null)
    if (notice) setNotice('')
  }

  // "Explain this message": for this milestone we only have fixed example
  // results for the three sample messages, in the two declared languages at
  // the three levels. We never invent a result for arbitrary pasted text.
  function handleExplain() {
    const trimmed = text.trim()
    if (trimmed.length === 0) {
      setNotice('Please choose an example or paste a message first.')
      return
    }
    if (text.length > MAX_LENGTH) {
      setNotice('This message is too long. Please shorten it and try again.')
      return
    }

    const sample = sampleNotifications.find((item) => item.id === selectedSampleId)
    if (!sample) {
      setResultSampleId(null)
      setNotice(
        'Example explanations are available for the three example messages above. ' +
          'Explaining your own messages is coming in a later version.',
      )
      return
    }

    setNotice('')
    setResultSampleId(sample.id)
    setIsOriginalOpen(false)
  }

  // Derive the currently shown sample and its result for the active settings.
  const resultSample = resultSampleId
    ? sampleNotifications.find((item) => item.id === resultSampleId)
    : null

  const result = useMemo(() => {
    if (!resultSample) return null
    const byLanguage = resultSample.results[settings.language] ?? resultSample.results.en
    return byLanguage[settings.level] ?? byLanguage.standard
  }, [resultSample, settings.language, settings.level])

  const speechLang =
    LANGUAGES.find((item) => item.value === settings.language)?.speechLang ?? 'en-US'

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

      {result && resultSample && (
        <ResultPanel
          result={result}
          original={resultSample.text}
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
