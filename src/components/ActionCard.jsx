// A single actionable request, shown as a large, clear card. If the action is
// a digital task DeClear can guide (e.g. sending photos on WhatsApp), it offers
// a "Help me do this" button that opens the step-by-step guide.
import { GUIDANCE_TASKS, TASK_TYPES } from '../data/guidanceTasks.js'
import { useTranslation } from '../i18n/context.js'

function ActionCard({ action, onStartGuide, uncertaintyLabel }) {
  const { t } = useTranslation()
  const taskType = action.taskType ?? TASK_TYPES.NONE
  const isGuidable =
    action.isDigitalTask === true && Boolean(GUIDANCE_TASKS[taskType])

  return (
    <li className="dc-action-card">
      <p className="dc-action-card__text">{action.text}</p>

      {uncertaintyLabel && (
        <p className="dc-uncertainty">
          {t('result.checkPrefix', { label: uncertaintyLabel })}
        </p>
      )}

      {isGuidable ? (
        <button
          type="button"
          className="dc-primary-button dc-action-card__help"
          onClick={() => onStartGuide(action)}
        >
          {t('action.help')}
        </button>
      ) : (
        action.isDigitalTask === true && (
          <p className="dc-help-text">{t('action.noGuide')}</p>
        )
      )}
    </li>
  )
}

export default ActionCard
