import { useEffect, useRef, useState } from 'react'
import AppHeader from './components/AppHeader.jsx'
import NotificationInput from './components/NotificationInput.jsx'
import ActionsStage from './components/ActionsStage.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'
import StageProgress from './components/StageProgress.jsx'
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

// The three focused stages. Only one is on screen at a time.
const STAGE = { INPUT: 'input', ACTIONS: 'actions', GUIDE: 'guide' }

function App() {
  // Which focused stage is visible. On a browser refresh this resets to INPUT,
  // which is the correct, predictable starting point (no server state).
  const [stage, setStage] = useState(STAGE.INPUT)

  // The message currently in the input area.
  const [text, setText] = useState('')
  // Which sample card is selected, if any.
  const [selectedSampleId, setSelectedSampleId] = useState(null)
  // The exact message that was last submitted for processing.
  const [submittedMessage, setSubmittedMessage] = useState(null)
  // The resolved processing response (async). Null until the first result.
  const [response, setResponse] = useState(null)
  // True while a processing request is in flight, so we can show progress.
  const [isProcessing, setIsProcessing] = useState(false)
  // Whether the original-message panel is expanded.
  const [isOriginalOpen, setIsOriginalOpen] = useState(false)

  // Step-by-step guidance state.
  const [guideTask, setGuideTask] = useState(null)
  const [guidance, setGuidance] = useState(null)
  const [guidePending, setGuidePending] = useState(false)
  const [stuckPending, setStuckPending] = useState(false)
  const [guideNotice, setGuideNotice] = useState('')
  const [guideVersion, setGuideVersion] = useState(0)

  // User settings, loaded from localStorage once at startup.
  const [settings, setSettings] = useState(() => {
    const loaded = loadSettings()
    return speechSupported ? loaded : { ...loaded, readAloud: false }
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [saveFailed, setSaveFailed] = useState(false)

  // Focus the stage heading on each stage change, so keyboard and screen-reader
  // users are moved to the new content rather than left where they were.
  const stageHeadingRef = useRef(null)
  useEffect(() => {
    stageHeadingRef.current?.focus()
  }, [stage])

  function handleSettingsChange(next) {
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

  // Start completely fresh: clear the message, result, and guidance, and return
  // to the input stage.
  function startNewMessage() {
    setText('')
    setSelectedSampleId(null)
    setSubmittedMessage(null)
    setResponse(null)
    setIsProcessing(false)
    setIsOriginalOpen(false)
    setGuideTask(null)
    setGuidance(null)
    setGuideNotice('')
    setStage(STAGE.INPUT)
  }

  // Clear only the generated result (used when the message changes on input).
  function clearResult() {
    setSubmittedMessage(null)
    setResponse(null)
    setIsProcessing(false)
  }

  function handleSelectSample(id) {
    const sample = sampleNotifications.find((item) => item.id === id)
    if (!sample) return
    setSelectedSampleId(id)
    setText(sample.text)
    clearResult()
    setIsOriginalOpen(false)
  }

  function handleChangeText(value) {
    setText(value)
    if (selectedSampleId) setSelectedSampleId(null)
    if (submittedMessage !== null) clearResult()
  }

  // "Explain this message": submit for processing. We stay on the input stage
  // while processing; advancing to the actions stage happens when a successful
  // result arrives (see the effect below).
  function handleExplain() {
    setSubmittedMessage(text)
    setIsProcessing(true)
    setIsOriginalOpen(false)
  }

  // "Help me do this": fetch guidance, and advance to the guide stage only when
  // guidance actually arrives (so a failure keeps the user on the actions stage
  // with a clear notice).
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
      setStage(STAGE.GUIDE)
    } else {
      setGuideNotice(out.message ?? 'Step-by-step help is not available right now.')
    }
  }

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

  // Back from the guide to the actions stage. Guidance is kept in memory so the
  // user can re-open it without re-fetching (also saves AI tokens).
  function backToActions() {
    setStage(STAGE.ACTIONS)
  }

  // Back from actions to input. The message and result are preserved so the
  // user can tweak and re-explain, or simply return to the actions.
  function backToInput() {
    setStage(STAGE.INPUT)
  }

  useEffect(() => {
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
        // Advance to the actions stage only on a usable result.
        if (result.status === ProcessStatus.OK) setStage(STAGE.ACTIONS)
      })
      .catch(() => {
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
    response && response.status === ProcessStatus.OK ? response.result : null
  // A non-OK status carries a plain-language message to show on the input stage.
  const inputNotice =
    !isProcessing && response && response.status !== ProcessStatus.OK
      ? response.message
      : ''

  const providerLabel =
    response?.provider === 'demo'
      ? 'This is a fixed example explanation. It was not generated by artificial intelligence.'
      : null

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

      <StageProgress current={stage} />

      {/* ---------------- Stage 1: Message ---------------- */}
      {stage === STAGE.INPUT && (
        <section className="dc-stage" aria-labelledby="dc-input-heading">
          <h2 className="dc-visually-hidden" tabIndex={-1} ref={stageHeadingRef}>
            Step 1: Choose or paste a message
          </h2>
          <NotificationInput
            samples={sampleNotifications}
            selectedSampleId={selectedSampleId}
            text={text}
            onSelectSample={handleSelectSample}
            onChangeText={handleChangeText}
            onExplain={handleExplain}
            notice={inputNotice}
          />
          {isProcessing && (
            <p className="dc-processing" role="status" aria-live="polite">
              Working on your message…
            </p>
          )}
          {okResult && (
            <div className="dc-stage__nav">
              <button
                type="button"
                className="dc-primary-button"
                onClick={() => setStage(STAGE.ACTIONS)}
              >
                Continue to your actions
              </button>
            </div>
          )}
        </section>
      )}

      {/* ---------------- Stage 2: Actions ---------------- */}
      {stage === STAGE.ACTIONS && okResult && response && (
        <section className="dc-stage" aria-labelledby="dc-actions-heading">
          <div className="dc-stage__topnav">
            <button
              type="button"
              className="dc-secondary-button"
              onClick={backToInput}
            >
              Back to message
            </button>
          </div>
          {/* Focusable heading target for stage changes. */}
          <span
            className="dc-visually-hidden"
            tabIndex={-1}
            ref={stageHeadingRef}
          >
            Step 2: Your actions
          </span>
          <ActionsStage
            result={okResult}
            original={response.original}
            isOriginalOpen={isOriginalOpen}
            onToggleOriginal={() => setIsOriginalOpen((open) => !open)}
            showReadAloud={settings.readAloud && speechSupported}
            speechLang={speechLang}
            onStartGuide={handleStartGuide}
            providerLabel={providerLabel}
          />
          {guidePending && (
            <p className="dc-processing" role="status" aria-live="polite">
              Preparing your step-by-step guide…
            </p>
          )}
          {!guidePending && guideNotice && !guidance && (
            <p className="dc-notice" role="alert">
              {guideNotice}
            </p>
          )}
          <div className="dc-stage__nav">
            <button
              type="button"
              className="dc-secondary-button"
              onClick={startNewMessage}
            >
              Start a new message
            </button>
          </div>
        </section>
      )}

      {/* ---------------- Stage 3: Guidance ---------------- */}
      {stage === STAGE.GUIDE && guideTask && guidance && (
        <section className="dc-stage" aria-labelledby="dc-guide-heading">
          <div className="dc-stage__topnav">
            <button
              type="button"
              className="dc-secondary-button"
              onClick={backToActions}
            >
              Back to your actions
            </button>
          </div>
          <span
            className="dc-visually-hidden"
            tabIndex={-1}
            ref={stageHeadingRef}
          >
            Step 3: Step-by-step guidance
          </span>
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
            onClose={backToActions}
          />
        </section>
      )}
    </main>
  )
}

export default App
