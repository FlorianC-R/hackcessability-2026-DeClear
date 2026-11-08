import { useTranslation } from '../i18n/context.js'

// A progress indicator shown at the top of every stage. The Guidance step is
// CONDITIONAL: many messages need no digital walkthrough, so when there is no
// guidance to reach we show a two-step flow (Message → Actions) rather than a
// permanently-unreachable third step. Meaning is carried by text ("Step 2 of
// N" + each step's word) and a filled/empty shape, never by colour alone.
const BASE_STEPS = [
  { id: 'input', labelKey: 'progress.message' },
  { id: 'actions', labelKey: 'progress.actions' },
]
const GUIDE_STEP = { id: 'guide', labelKey: 'progress.guidance' }

function StageProgress({ current, hasGuidance = false }) {
  const { t } = useTranslation()
  const steps = hasGuidance ? [...BASE_STEPS, GUIDE_STEP] : BASE_STEPS

  // If guidance is not part of this flow but we are somehow on the guide stage,
  // clamp the index so the count never exceeds the number of steps shown.
  let currentIndex = steps.findIndex((s) => s.id === current)
  if (currentIndex === -1) currentIndex = steps.length - 1

  return (
    <nav className="dc-progress" aria-label={t('settings.heading')}>
      <p className="dc-progress__count">
        {t('progress.count', { current: currentIndex + 1, total: steps.length })}
      </p>
      <ol className="dc-progress__steps">
        {steps.map((step, i) => {
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
