import { useEffect, useRef, useState } from 'react'
import { speak, stopSpeaking } from '../platform/speech.js'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BASE64_CHARS,
  fileToInlineImage,
} from '../platform/image.js'
import { useTranslation } from '../i18n/context.js'

// GuidanceFlow shows ONE instruction at a time with Next / Back / Repeat aloud
// / I'm stuck. It is honest that DeClear cannot see or control the user's
// phone: the user follows the steps themselves.
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
  const { t } = useTranslation()
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
      setImageError(t('stuck.image.badType'))
      return
    }
    try {
      const inline = await fileToInlineImage(file)
      if (inline.dataBase64.length > MAX_IMAGE_BASE64_CHARS) {
        setImageError(t('stuck.image.tooLarge'))
        return
      }
      setImage({ ...inline, name: file.name })
    } catch {
      setImageError(t('stuck.image.unreadable'))
    }
  }

  function submitStuck() {
    onStuck({
      stuckText: stuckText.trim(),
      image:
        imageConsent && image
          ? { mimeType: image.mimeType, dataBase64: image.dataBase64 }
          : null,
    })
  }

  return (
    <section className="dc-guide" aria-labelledby="dc-guide-heading">
      <div className="dc-guide__header">
        <h2 id="dc-guide-heading">{task.label}</h2>
        <button type="button" className="dc-secondary-button" onClick={onClose}>
          {t('guide.close')}
        </button>
      </div>

      <p className="dc-guide__source">
        {guidance.source === 'ai'
          ? t('guide.source.ai')
          : t('guide.source.scripted')}
      </p>
      <p className="dc-help-text">{t('guide.disclaimer')}</p>
      {sourceNotice && (
        <p className="dc-notice" role="status">
          {sourceNotice}
        </p>
      )}

      <p className="dc-guide__progress" aria-live="polite">
        {t('guide.stepCount', { current: index + 1, total: steps.length })}
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
          {t('guide.back')}
        </button>
        {canReadAloud && (
          <button
            type="button"
            className="dc-secondary-button"
            onClick={readCurrentStep}
          >
            {t('guide.repeat')}
          </button>
        )}
        <button
          type="button"
          className="dc-primary-button dc-guide__next"
          onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
          disabled={isLast}
        >
          {t('guide.next')}
        </button>
      </div>

      {isLast && <p className="dc-guide__done">{t('guide.done')}</p>}

      <div className="dc-guide__stuck">
        <button
          type="button"
          className="dc-secondary-button"
          aria-expanded={stuckOpen}
          aria-controls="dc-stuck-panel"
          onClick={() => setStuckOpen((open) => !open)}
        >
          {t('stuck.open')}
        </button>

        {stuckOpen && (
          <div id="dc-stuck-panel" className="dc-stuck-panel">
            <label className="dc-label" htmlFor="dc-stuck-text">
              {t('stuck.prompt')}
            </label>
            <textarea
              id="dc-stuck-text"
              className="dc-textarea"
              rows={3}
              value={stuckText}
              onChange={(e) => setStuckText(e.target.value)}
              placeholder={t('stuck.placeholder')}
            />

            {aiConsent ? (
              <fieldset className="dc-fieldset">
                <legend className="dc-legend">
                  {t('stuck.screenshot.legend')}
                </legend>
                <p className="dc-help-text">{t('stuck.screenshot.note')}</p>
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
                      {t('stuck.screenshot.consent')}
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
                      {t('stuck.screenshot.choose')}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ALLOWED_IMAGE_TYPES.join(',')}
                      className="dc-visually-hidden"
                      onChange={handleImageChosen}
                    />
                    {image && (
                      <p className="dc-help-text">
                        {t('stuck.screenshot.selected', { name: image.name })}
                      </p>
                    )}
                    {imageError && (
                      <p className="dc-uncertainty" role="alert">
                        {imageError}
                      </p>
                    )}
                  </div>
                )}
              </fieldset>
            ) : (
              <p className="dc-help-text">{t('stuck.screenshot.noConsent')}</p>
            )}

            <button
              type="button"
              className="dc-primary-button"
              onClick={submitStuck}
              disabled={stuckPending || (stuckText.length === 0 && !image)}
            >
              {stuckPending ? t('stuck.submitting') : t('stuck.submit')}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default GuidanceFlow
