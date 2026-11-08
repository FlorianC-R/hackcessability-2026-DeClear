import SampleCard from './SampleCard.jsx'
import { useTranslation } from '../i18n/context.js'
import { localizedSampleMeta } from '../data/sampleLocale.js'

const MAX_LENGTH = 5000
// Show the character counter only once the user is close to the limit, so it
// does not add noise during normal use.
const COUNTER_THRESHOLD = 4500

// NotificationInput owns stage 1: sample cards, a paste/type area, and the
// primary "Explain this message" button. It is a controlled component — the
// parent holds the text and selection state.
function NotificationInput({
  samples,
  selectedSampleId,
  text,
  onSelectSample,
  onChangeText,
  onExplain,
  notice,
}) {
  const { t, language } = useTranslation()
  const trimmedLength = text.trim().length
  const tooLong = text.length > MAX_LENGTH
  const canExplain = trimmedLength > 0 && !tooLong
  const showCounter = text.length >= COUNTER_THRESHOLD

  return (
    <section className="dc-input" aria-labelledby="dc-input-heading">
      <h2 id="dc-input-heading">{t('input.heading')}</h2>

      <div
        className="dc-sample-list"
        role="group"
        aria-label={t('input.samplesLabel')}
      >
        {samples.map((sample) => {
          const { title, summary } = localizedSampleMeta(sample, language)
          return (
            <SampleCard
              key={sample.id}
              sample={sample}
              title={title}
              summary={summary}
              selected={selectedSampleId === sample.id}
              onSelect={onSelectSample}
            />
          )
        })}
      </div>

      <div className="dc-paste">
        <label className="dc-label" htmlFor="dc-message">
          {t('input.pasteLabel')}
        </label>
        <textarea
          id="dc-message"
          className="dc-textarea"
          value={text}
          onChange={(event) => onChangeText(event.target.value)}
          rows={8}
          aria-describedby={showCounter ? 'dc-counter' : undefined}
          placeholder={t('input.placeholder')}
        />
        {showCounter && (
          <p
            id="dc-counter"
            className={`dc-counter-text${tooLong ? ' is-over' : ''}`}
          >
            {t('input.counter', {
              count: text.length.toLocaleString(language),
              max: MAX_LENGTH.toLocaleString(language),
            })}
            {tooLong ? t('input.tooLong') : ''}
          </p>
        )}
      </div>

      {notice && (
        <p className="dc-notice" role="alert">
          {notice}
        </p>
      )}

      <button
        type="button"
        className="dc-primary-button"
        onClick={onExplain}
        disabled={!canExplain}
      >
        {t('input.explain')}
      </button>
    </section>
  )
}

export default NotificationInput
export { MAX_LENGTH }
