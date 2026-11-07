// A single selectable sample notification, shown as a large button.
// The selected state is communicated with text ("Selected") and a checkmark
// shape in addition to the border/colour, so meaning never relies on colour
// alone.
function SampleCard({ sample, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`dc-sample-card${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(sample.id)}
    >
      <span className="dc-sample-card__title">{sample.title}</span>
      <span className="dc-sample-card__summary">{sample.summary}</span>
      <span className="dc-sample-card__state">
        {selected ? '\u2713 Selected' : 'Choose this example'}
      </span>
    </button>
  )
}

export default SampleCard
