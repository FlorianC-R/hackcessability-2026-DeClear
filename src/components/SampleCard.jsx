import { useTranslation } from '../i18n/context.js'

// A single selectable sample notification, shown as a large button.
// The selected state is communicated with text ("Selected") and a checkmark
// shape in addition to the border/colour, so meaning never relies on colour
// alone. `title`/`summary` are already localized by the caller.
function SampleCard({ sample, title, summary, selected, onSelect }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      className={`dc-sample-card${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(sample.id)}
    >
      <span className="dc-sample-card__title">{title}</span>
      <span className="dc-sample-card__summary">{summary}</span>
      <span className="dc-sample-card__state">
        {selected ? t('sample.selected') : t('sample.choose')}
      </span>
    </button>
  )
}

export default SampleCard
