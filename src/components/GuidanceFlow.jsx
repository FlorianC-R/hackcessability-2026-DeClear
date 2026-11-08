import { useEffect, useRef, useState } from 'react'
import { speak, stopSpeaking } from '../platform/speech.js'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BASE64_CHARS,
  fileToInlineImage,
} from '../platform/image.js'

// GuidanceFlow shows ONE instruction at a time with Next / Back / Repeat aloud
// / I'm stuck. It is honest that DeClear cannot see or control the user's
// phone: the user follows the steps themselves.
//
// Props:
//   task            : { label, app, device }
//   guidance        : { steps: [{id,instruction,detail}], source: 'ai'|'scripted' }
//   speechLang      : BCP-47 code for read-aloud
//   canReadAloud    : whether read-aloud is available/enabled
//   aiConsent       : whether the user consented to AI (gates screenshot upload)
//   onStuck         : async ({ stuckText, image }) => void  (fetches revised steps)
//   stuckPending    : boolean
//   sourceNotice    : optional string explaining a fallback
//   onClose         : () => void
function GuidanceFlow({
  task,
  guidance,
  speechLang,
  canReadAloud,
  aiConsent,
  onStuck,
  stuckPending,
  sourceNotice,
  onClose,
}) {
  const [index, setIndex] = useState(0)
  const [stuckOpen, setStuckOpen] = useState(false)
  const [stuckText, setStuckText] = useState('')
  const [imageConsent, setImageConsent] = useState(false)
  const [image, setImage] = useState(null) // { mimeType, dataBase64, name }
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef(null)

  const steps = guidance.steps
  const step = steps[Math.min(index, steps.length - 1)]
  const isFirst = index === 0
  const isLast = index === steps.length - 1

  // When new guidance arrives (e.g. after "I'm stuck"), the parent remounts
  // this component via a changing `key`, so state resets to step 1 naturally
  // without a setState-in-effect.

  // Stop any speech when the step changes or the flow unmounts.
  useEffect(() => {
    return () => stopSpeaking()
  }, [index])

  function readCurrentStep() {
    if (!canReadAloud) return
    const text = `${step.instruction}. ${step.detail}`
    speak(text, speechLang)
  }

  async function handleImageChosen(event) {
    setImageError('')
    const file = event.target.files?.[0]
    if (!file) return
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Please choose a PNG, JPEG, or WebP image.')
      return
    }
    try {
      const inline = await fileToInlineImage(file)
      if (inline.dataBase64.length > MAX_IMAGE_BASE64_CHARS) {
        setImageError('That image is too large. Please use one under about 1 MB.')
        return
      }
      setImage({ ...inline, name: file.name })
    } catch {
      setImageError('Sorry, that image could not be read. Please try another.')
    }
  }

  function submitStuck() {
    onStuck({
      stuckText: stuckText.trim(),
      image: imageConsent && image ? { mimeType: image.mimeType, dataBase64: image.dataBase64 } : null,
    })
  }

  return (
    <section className="dc-guide" aria-labelledby="dc-guide-heading">
      <div className="dc-guide__header">
        <h2 id="dc-guide-heading">{task.label}</h2>
        <button type="button" className="dc-secondary-button" onClick={onClose}>
          Close guide
        </button>
      </div>

      <p className="dc-guide__source">
        {guidance.source === 'ai'
          ? 'These steps were created just now by AI for your situation.'
          : 'These are DeClear’s written steps (not live AI).'}
      </p>
      <p className="dc-help-text">
        DeClear cannot see or control your phone. Follow these steps yourself on
        your device. DeClear never sends anything or taps anything for you.
      </p>
      {sourceNotice && (
        <p className="dc-notice" role="status">
          {sourceNotice}
        </p>
      )}

      <p className="dc-guide__progress" aria-live="polite">
        Step {index + 1} of {steps.length}
      </p>

      <div className="dc-guide__step">
        <p className="dc-guide__instruction">{step.instruction}</p>
        {step.detail && <p className="dc-guide__detail">{step.detail}</p>}
      </div>

      <div className="dc-guide__controls">
        <button
          type="button"
          className="dc-secondary-button"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
        >
          Back
        </button>
        {canReadAloud && (
          <button
            type="button"
            className="dc-secondary-button"
            onClick={readCurrentStep}
          >
            Repeat aloud
          </button>
        )}
        <button
          type="button"
          className="dc-primary-button dc-guide__next"
          onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
          disabled={isLast}
        >
          Next
        </button>
      </div>

      {isLast && (
        <p className="dc-guide__done">
          That is the last step. Well done! You can go Back to review any step.
        </p>
      )}

      <div className="dc-guide__stuck">
        <button
          type="button"
          className="dc-secondary-button"
          aria-expanded={stuckOpen}
          aria-controls="dc-stuck-panel"
          onClick={() => setStuckOpen((open) => !open)}
        >
          I&rsquo;m stuck
        </button>

        {stuckOpen && (
          <div id="dc-stuck-panel" className="dc-stuck-panel">
            <label className="dc-label" htmlFor="dc-stuck-text">
              Tell DeClear what you see on your screen, and it will try again.
            </label>
            <textarea
              id="dc-stuck-text"
              className="dc-textarea"
              rows={3}
              value={stuckText}
              onChange={(e) => setStuckText(e.target.value)}
              placeholder="For example: I see a list of chats but no + button."
            />

            {aiConsent ? (
              <fieldset className="dc-fieldset">
                <legend className="dc-legend">Optional: add a screenshot</legend>
                <p className="dc-help-text">
                  You can add a picture of your screen to get more exact help.
                  The picture is sent to the AI for this one answer only and is
                  <strong> not stored</strong> by DeClear.
                </p>
                <label className="dc-choice">
                  <input
                    type="checkbox"
                    checked={imageConsent}
                    onChange={(e) => {
                      setImageConsent(e.target.checked)
                      if (!e.target.checked) setImage(null)
                    }}
                  />
                  <span className="dc-choice__text">
                    <span className="dc-choice__label">
                      I agree to send a screenshot to the AI for this answer
                    </span>
                  </span>
                </label>

                {imageConsent && (
                  <div className="dc-stuck-panel__upload">
                    <button
                      type="button"
                      className="dc-secondary-button"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Choose a screenshot
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      className="dc-visually-hidden"
                      onChange={handleImageChosen}
                    />
                    {image && <p className="dc-help-text">Selected: {image.name}</p>}
                    {imageError && (
                      <p className="dc-uncertainty" role="alert">
                        {imageError}
                      </p>
                    )}
                  </div>
                )}
              </fieldset>
            ) : (
              <p className="dc-help-text">
                Turn on AI mode and consent to also send a screenshot. Without
                that, DeClear will use your written description only.
              </p>
            )}

            <button
              type="button"
              className="dc-primary-button"
              onClick={submitStuck}
              disabled={stuckPending || (stuckText.length === 0 && !image)}
            >
              {stuckPending ? 'Getting new steps…' : 'Help me with this'}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default GuidanceFlow
