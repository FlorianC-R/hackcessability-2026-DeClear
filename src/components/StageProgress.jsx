// A simple three-step progress indicator shown at the top of every stage.
// Meaning is carried by text ("Step 2 of 3" + each step's word) and a filled/
// empty shape, never by colour alone, per the accessibility steering.
const STEPS = [
  { id: 'input', label: 'Message' },
  { id: 'actions', label: 'Actions' },
  { id: 'guide', label: 'Guidance' },
]

function StageProgress({ current }) {
  const currentIndex = STEPS.findIndex((s) => s.id === current)

  return (
    <nav className="dc-progress" aria-label="Progress">
      <p className="dc-progress__count">
        Step {currentIndex + 1} of {STEPS.length}
      </p>
      <ol className="dc-progress__steps">
        {STEPS.map((step, i) => {
          const state =
            i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming'
          // Filled square = current/done, empty circle = upcoming. Text labels
          // and aria-current carry the meaning for screen readers.
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
              <span className="dc-progress__label">{step.label}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default StageProgress
