import { useTranslation } from '../i18n/context.js'

// A single selectable sample notification, shown as a large button with just
// its title and a choose/selected label — no sub-description, to keep the grid
// compact. The selected state is communicated with text ("Selected") and a
// checkmark shape in addition to colour, so meaning never relies on colour
// alone. `title` is already localized by the caller.
function SampleCard({ sample, title, selected, onSelect }) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      className={`dc-sample-card${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(sample.id)}
    >
      <span className="dc-sample-card__title">{title}</span>
      <span className="dc-sample-card__state">
        {selected ? t('sample.selected') : t('sample.choose')}
      </span>
    </button>
  )
}

export default SampleCard
