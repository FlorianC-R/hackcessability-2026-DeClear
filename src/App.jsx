import { useState } from 'react'
import AppHeader from './components/AppHeader.jsx'
import NotificationInput, { MAX_LENGTH } from './components/NotificationInput.jsx'
import ResultPanel from './components/ResultPanel.jsx'
import { sampleNotifications } from './data/sampleNotifications.js'
import './App.css'

function App() {
  // The message currently in the input area.
  const [text, setText] = useState('')
  // Which sample card is selected, if any.
  const [selectedSampleId, setSelectedSampleId] = useState(null)
  // The result being shown, plus the exact original text it came from.
  const [result, setResult] = useState(null)
  const [resultOriginal, setResultOriginal] = useState('')
  // Whether the original-message panel is expanded.
  const [isOriginalOpen, setIsOriginalOpen] = useState(false)
  // A plain-language notice shown near the input (validation or info).
  const [notice, setNotice] = useState('')

  // Selecting a sample fills the input with its text and clears any old result.
  function handleSelectSample(id) {
    const sample = sampleNotifications.find((item) => item.id === id)
    if (!sample) return
    setSelectedSampleId(id)
    setText(sample.text)
    setResult(null)
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
  // results for the three sample messages. We never invent a result for
  // arbitrary pasted text, so we say so plainly instead.
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
      setResult(null)
      setNotice(
        'Example explanations are available for the three example messages above. ' +
          'Explaining your own messages is coming in a later version.',
      )
      return
    }

    setNotice('')
    setResult(sample.exampleResult)
    setResultOriginal(sample.text)
    setIsOriginalOpen(false)
  }

  return (
    <main className="dc-app">
      <AppHeader />

      <NotificationInput
        samples={sampleNotifications}
        selectedSampleId={selectedSampleId}
        text={text}
        onSelectSample={handleSelectSample}
        onChangeText={handleChangeText}
        onExplain={handleExplain}
        notice={notice}
      />

      {result && (
        <ResultPanel
          result={result}
          original={resultOriginal}
          isOriginalOpen={isOriginalOpen}
          onToggleOriginal={() => setIsOriginalOpen((open) => !open)}
        />
      )}
    </main>
  )
}

export default App
