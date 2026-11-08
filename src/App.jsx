import { useEffect, useState } from 'react'
import AppHeader from './components/AppHeader.jsx'
import NotificationInput from './components/NotificationInput.jsx'
import ResultPanel from './components/ResultPanel.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import { sampleNotifications } from './data/sampleNotifications.js'
import { LANGUAGES } from './data/settingsOptions.js'
import { loadSettings, saveSettings } from './storage/settingsStorage.js'
import { isSpeechSupported } from './platform/speech.js'
import GuidanceFlow from './components/GuidanceFlow.jsx'
import { processNotification } from './services/notificationProcessor.js'
import { ProcessStatus } from './services/processorTypes.js'
import { getGuidance, GuidanceStatus } from './services/guidanceService.js'
import { GUIDANCE_TASKS } from './data/guidanceTasks.js'
import './App.css'

// For the MVP demo the guide targets iPhone. A later milestone can let the
// user pick their device.
const GUIDE_DEVICE = 'iphone'

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
  // The resolved processing response (async). Null until the first result.
  const [response, setResponse] = useState(null)
  // True while a processing request is in flight, so we can show progress.
  const [isProcessing, setIsProcessing] = useState(false)
  // Whether the original-message panel is expanded.
  const [isOriginalOpen, setIsOriginalOpen] = useState(false)

  // Step-by-step guidance state. `guideTask` is the task metadata being guided;
  // `guidance` is the current { steps, source }; the rest track async/errors.
  const [guideTask, setGuideTask] = useState(null)
  const [guidance, setGuidance] = useState(null)
  const [guidePending, setGuidePending] = useState(false)
  const [stuckPending, setStuckPending] = useState(false)
  const [guideNotice, setGuideNotice] = useState('')
  // Bumped every time new guidance is set, so GuidanceFlow remounts (and resets
  // to step 1) when fresh steps arrive after "I'm stuck".
  const [guideVersion, setGuideVersion] = useState(0)

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
    // If a result is on screen, changing level/language will re-run processing
    // (via the effect), so show the in-progress state right away. Setting this
    // from the event handler keeps the effect free of synchronous setState.
    if (
      submittedMessage !== null &&
      (next.level !== settings.level ||
        next.language !== settings.language ||
        next.mode !== settings.mode ||
        next.aiConsent !== settings.aiConsent)
    ) {
      setIsProcessing(true)
    }
    setSettings(next)
    const ok = saveSettings(next)
    setSaveFailed(!ok)
  }

  // Clear any shown result and processing state. Called from the event
  // handlers (not an effect) so we never set state synchronously inside one.
  function clearResult() {
    setSubmittedMessage(null)
    setResponse(null)
    setIsProcessing(false)
  }

  // Selecting a sample fills the input with its text and clears any old result.
  function handleSelectSample(id) {
    const sample = sampleNotifications.find((item) => item.id === id)
    if (!sample) return
    setSelectedSampleId(id)
    setText(sample.text)
    clearResult()
    setIsOriginalOpen(false)
  }

  // Typing clears the sample selection, since the message is now the user's own.
  function handleChangeText(value) {
    setText(value)
    if (selectedSampleId) setSelectedSampleId(null)
    if (submittedMessage !== null) clearResult()
  }

  // "Explain this message": hand the text to the processing service. The
  // service decides what can and cannot be explained — the UI does not invent
  // results of its own.
  function handleExplain() {
    setSubmittedMessage(text)
    setIsProcessing(true)
    setIsOriginalOpen(false)
  }

  // "Help me do this" on an action card: open the guidance flow for the task.
  async function handleStartGuide(action) {
    const task = GUIDANCE_TASKS[action.taskType]
    if (!task) return
    setGuideTask({ ...task, device: GUIDE_DEVICE })
    setGuidance(null)
    setGuideNotice('')
    setGuidePending(true)
    const out = await getGuidance({
      taskType: action.taskType,
      device: GUIDE_DEVICE,
      preferences: { aiConsent: settings.aiConsent },
    })
    setGuidePending(false)
    if (out.status === GuidanceStatus.OK) {
      setGuidance(out.guidance)
      setGuideVersion((v) => v + 1)
      setGuideNotice(out.message ?? '')
    } else {
      setGuideNotice(out.message ?? 'Step-by-step help is not available right now.')
    }
  }

  // "I'm stuck": ask for revised guidance using the user's description and/or
  // an optional screenshot (only sent with explicit consent).
  async function handleStuck({ stuckText, image }) {
    if (!guideTask) return
    setStuckPending(true)
    const out = await getGuidance({
      taskType: guideTask.id,
      device: guideTask.device,
      preferences: { aiConsent: settings.aiConsent },
      stuckText,
      image,
    })
    setStuckPending(false)
    if (out.status === GuidanceStatus.OK) {
      setGuidance(out.guidance)
      setGuideVersion((v) => v + 1)
      setGuideNotice(out.message ?? '')
    } else {
      setGuideNotice(out.message ?? 'Sorry, DeClear could not get new steps right now.')
    }
  }

  function closeGuide() {
    setGuideTask(null)
    setGuidance(null)
    setGuideNotice('')
    setGuidePending(false)
    setStuckPending(false)
  }

  // Run the processor whenever there is a submitted message or the preferences
  // change, so the shown explanation always reflects the current settings.
  // Processing is asynchronous, so we run it in an effect and store the
  // resolved response. A `cancelled` flag ignores a stale result if the inputs
  // change (or the component unmounts) before the promise settles.
  useEffect(() => {
    // Nothing submitted: the event handlers already cleared any result, so the
    // effect has no work to do. (Avoids setting state synchronously here.)
    if (submittedMessage === null) return

    let cancelled = false

    processNotification({
      message: submittedMessage,
      providerId: settings.mode === 'ai' ? 'ai' : 'demo',
      preferences: {
        level: settings.level,
        language: settings.language,
        aiConsent: settings.aiConsent,
      },
    })
      .then((result) => {
        if (cancelled) return
        setResponse(result)
        setIsProcessing(false)
      })
      .catch(() => {
        // processNotification is designed not to reject, but guard anyway so a
        // failure never leaves the UI stuck in a loading state.
        if (cancelled) return
        setResponse({
          status: ProcessStatus.ERROR,
          original: submittedMessage,
          result: null,
          message:
            'Something went wrong while explaining this message. Please try again.',
        })
        setIsProcessing(false)
      })

    return () => {
      cancelled = true
    }
  }, [
    submittedMessage,
    settings.level,
    settings.language,
    settings.mode,
    settings.aiConsent,
  ])

  const speechLang =
    LANGUAGES.find((item) => item.value === settings.language)?.speechLang ??
    'en-US'

  const okResult =
    !isProcessing && response && response.status === ProcessStatus.OK
      ? response.result
      : null
  // Any non-OK status carries a plain-language message to show the user. We
  // suppress it while a new request is in flight so stale text does not linger.
  const notice =
    !isProcessing && response && response.status !== ProcessStatus.OK
      ? response.message
      : ''

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

      {isProcessing && (
        <p className="dc-processing" role="status" aria-live="polite">
          Working on your message…
        </p>
      )}

      {okResult && response && (
        <ResultPanel
          result={okResult}
          original={response.original}
          isOriginalOpen={isOriginalOpen}
          onToggleOriginal={() => setIsOriginalOpen((open) => !open)}
          showReadAloud={settings.readAloud && speechSupported}
          speechLang={speechLang}
          onStartGuide={handleStartGuide}
        />
      )}

      {guideTask && guidePending && !guidance && (
        <p className="dc-processing" role="status" aria-live="polite">
          Preparing your step-by-step guide…
        </p>
      )}

      {guideTask && !guidance && !guidePending && guideNotice && (
        <p className="dc-notice" role="alert">
          {guideNotice}{' '}
          <button
            type="button"
            className="dc-link-button"
            onClick={closeGuide}
          >
            Close
          </button>
        </p>
      )}

      {guideTask && guidance && (
        <GuidanceFlow
          key={guideVersion}
          task={guideTask}
          guidance={guidance}
          speechLang={speechLang}
          canReadAloud={settings.readAloud && speechSupported}
          aiConsent={settings.aiConsent}
          onStuck={handleStuck}
          stuckPending={stuckPending}
          sourceNotice={guideNotice}
          onClose={closeGuide}
        />
      )}
    </main>
  )
}

export default App
