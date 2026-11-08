import OriginalMessage from './OriginalMessage.jsx'
import ReadAloudControl from './ReadAloudControl.jsx'
import ActionCard from './ActionCard.jsx'
import { useTranslation } from '../i18n/context.js'

// Shape symbol per urgency level (word + note come from translations). Urgency
// is conveyed by a word plus a shape, never by colour alone.
const URGENCY_SYMBOL = {
  None: '\u25CB',
  Low: '\u25B3',
  Medium: '\u25C6',
  High: '\u25A0',
}

function findUncertainty(uncertainties, kind, id) {
  return uncertainties.find(
    (item) => item.targetKind === kind && item.targetId === id,
  )
}

// ActionsStage is stage 2. It shows the most important information prominently
// (urgency, dates, and the action cards) and tucks the longer, nonessential
// detail into clearly labelled disclosures so the stage stays short and
// focused. On wide screens the actions sit in the primary column and the
// detail in a secondary column.
function ActionsStage({
  result,
  original,
  isOriginalOpen,
  onToggleOriginal,
  showReadAloud,
  speechLang,
  onStartGuide,
  providerLabel,
}) {
  const { t } = useTranslation()
  const level = URGENCY_SYMBOL[result.urgency] ? result.urgency : 'None'
  const symbol = URGENCY_SYMBOL[level]

  return (
    <div className="dc-actions-stage">
      <h2 id="dc-actions-heading">{result.title}</h2>
      {providerLabel && <p className="dc-result__disclaimer">{providerLabel}</p>}

      <div className="dc-actions-stage__grid">
        {/* Primary column: the things that must not be missed. */}
        <div className="dc-actions-stage__primary">
          <div className={`dc-urgency dc-urgency--${level.toLowerCase()}`}>
            <span className="dc-urgency__symbol" aria-hidden="true">
              {symbol}
            </span>
            <span className="dc-urgency__label">
              {t(`urgency.${level}.label`)}
            </span>
            <span className="dc-urgency__note">{t(`urgency.${level}.note`)}</span>
          </div>

          <div className="dc-block">
            <h3>{t('result.dates.heading')}</h3>
            {result.dates.length === 0 ? (
              <p className="dc-empty">{t('result.dates.none')}</p>
            ) : (
              <ul className="dc-list">
                {result.dates.map((date) => {
                  const uncertainty = findUncertainty(
                    result.uncertainties,
                    'importantDate',
                    date.id,
                  )
                  return (
                    <li key={date.id} className="dc-list__item">
                      <span className="dc-date__when">
                        {date.isKnown ? date.dateText : t('result.dates.unknown')}
                      </span>
                      <span className="dc-date__what">{date.label}</span>
                      {uncertainty && (
                        <span className="dc-uncertainty">
                          {t('result.checkPrefix', { label: uncertainty.label })}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="dc-block">
            <h3>{t('result.actions.heading')}</h3>
            {result.actions.length === 0 ? (
              <p className="dc-empty">{t('result.actions.none')}</p>
            ) : (
              <ul className="dc-action-list">
                {result.actions.map((action) => {
                  const uncertainty = findUncertainty(
                    result.uncertainties,
                    'requiredAction',
                    action.id,
                  )
                  return (
                    <ActionCard
                      key={action.id}
                      action={action}
                      uncertaintyLabel={uncertainty?.label}
                      onStartGuide={onStartGuide}
                    />
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Secondary column: available but not scroll-inducing. */}
        <div className="dc-actions-stage__secondary">
          <details className="dc-disclosure" open>
            <summary className="dc-disclosure__summary">
              {t('result.explanation.show')}
            </summary>
            <div className="dc-disclosure__body">
              <p className="dc-explanation">{result.explanation}</p>
              {showReadAloud && (
                <ReadAloudControl
                  text={result.explanation}
                  speechLang={speechLang}
                />
              )}
            </div>
          </details>

          {result.suggestedReply && (
            <details className="dc-disclosure">
              <summary className="dc-disclosure__summary">
                {t('result.reply.show')}
              </summary>
              <div className="dc-disclosure__body">
                <p className="dc-help-text">{t('result.reply.note')}</p>
                <p className="dc-explanation dc-suggested-reply">
                  {result.suggestedReply}
                </p>
              </div>
            </details>
          )}

          <OriginalMessage
            original={original}
            isOpen={isOriginalOpen}
            onToggle={onToggleOriginal}
          />
        </div>
      </div>
    </div>
  )
}

export default ActionsStage
