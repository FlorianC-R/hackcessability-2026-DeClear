import SampleCard from './SampleCard.jsx'

const MAX_LENGTH = 5000
// Show the character counter only once the user is close to the limit, so it
// does not add noise during normal use.
const COUNTER_THRESHOLD = 4500

// NotificationInput owns the top half of the screen: three sample cards, a
// paste/type area, and the primary "Explain this message" button. It is a
// controlled component — the parent holds the text and selection state.
function NotificationInput({
  samples,
  selectedSampleId,
  text,
  onSelectSample,
  onChangeText,
  onExplain,
  notice,
}) {
  const trimmedLength = text.trim().length
  const tooLong = text.length > MAX_LENGTH
  const canExplain = trimmedLength > 0 && !tooLong
  const showCounter = text.length >= COUNTER_THRESHOLD

  return (
    <section className="dc-input" aria-labelledby="dc-input-heading">
      <h2 id="dc-input-heading">Choose an example or paste your own message</h2>

      <div className="dc-sample-list" role="group" aria-label="Example messages">
        {samples.map((sample) => (
          <SampleCard
            key={sample.id}
            sample={sample}
            selected={selectedSampleId === sample.id}
            onSelect={onSelectSample}
          />
        ))}
      </div>

      <div className="dc-paste">
        <label className="dc-label" htmlFor="dc-message">
          Or paste your own message here
        </label>
        <textarea
          id="dc-message"
          className="dc-textarea"
          value={text}
          onChange={(event) => onChangeText(event.target.value)}
          rows={8}
          aria-describedby={showCounter ? 'dc-counter' : undefined}
          placeholder="Type or paste a letter, bill, or message..."
        />
        {showCounter && (
          <p
            id="dc-counter"
            className={`dc-counter-text${tooLong ? ' is-over' : ''}`}
          >
            {text.length.toLocaleString()} of {MAX_LENGTH.toLocaleString()} characters
            {tooLong ? '. This message is too long. Please shorten it.' : ''}
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
        Explain this message
      </button>
    </section>
  )
}

export default NotificationInput
export { MAX_LENGTH }
