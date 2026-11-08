// A single actionable request, shown as a large, clear card. If the action is
// a digital task DeClear can guide (e.g. sending photos on WhatsApp), it offers
// a "Help me do this" button that opens the step-by-step guide.
import { GUIDANCE_TASKS, TASK_TYPES } from '../data/guidanceTasks.js'

function ActionCard({ action, onStartGuide, uncertaintyLabel }) {
  const taskType = action.taskType ?? TASK_TYPES.NONE
  const isGuidable =
    action.isDigitalTask === true && Boolean(GUIDANCE_TASKS[taskType])

  return (
    <li className="dc-action-card">
      <p className="dc-action-card__text">{action.text}</p>

      {uncertaintyLabel && (
        <p className="dc-uncertainty">Please check: {uncertaintyLabel}</p>
      )}

      {isGuidable ? (
        <button
          type="button"
          className="dc-primary-button dc-action-card__help"
          onClick={() => onStartGuide(action)}
        >
          Help me do this
        </button>
      ) : (
        action.isDigitalTask === true && (
          <p className="dc-help-text">
            A step-by-step guide for this task is not available yet.
          </p>
        )
      )}
    </li>
  )
}

export default ActionCard
