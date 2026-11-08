import { useTranslation } from '../i18n/context.js'

// A simple three-step progress indicator shown at the top of every stage.
// Meaning is carried by text ("Step 2 of 3" + each step's word) and a filled/
// empty shape, never by colour alone, per the accessibility steering.
const STEPS = [
  { id: 'input', labelKey: 'progress.message' },
  { id: 'actions', labelKey: 'progress.actions' },
  { id: 'guide', labelKey: 'progress.guidance' },
]

function StageProgress({ current }) {
  const { t } = useTranslation()
  const currentIndex = STEPS.findIndex((s) => s.id === current)

  return (
    <nav className="dc-progress" aria-label={t('settings.heading')}>
      <p className="dc-progress__count">
        {t('progress.count', { current: currentIndex + 1, total: STEPS.length })}
      </p>
      <ol className="dc-progress__steps">
        {STEPS.map((step, i) => {
          const state =
            i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming'
          const symbol = state === 'upcoming' ? '\u25CB' : '\u25A0'
          return (
            <li
              key={step.id}
              className={`dc-progress__step is-${state}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span className="dc-progress__symbol" aria-hidden="true">
                {symbol}
              </span>
              <span className="dc-progress__label">{t(step.labelKey)}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default StageProgress
