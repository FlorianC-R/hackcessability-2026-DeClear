import OriginalMessage from './OriginalMessage.jsx'
import ReadAloudControl from './ReadAloudControl.jsx'
import ActionCard from './ActionCard.jsx'

// Plain-language descriptions and shapes for each urgency level. Urgency is
// conveyed by a word plus a shape symbol, never by colour alone.
const URGENCY_DISPLAY = {
  None: { label: 'No urgency', symbol: '\u25CB', note: 'Nothing time-sensitive here.' },
  Low: { label: 'Low urgency', symbol: '\u25B3', note: 'Worth noting, but not pressing.' },
  Medium: { label: 'Medium urgency', symbol: '\u25C6', note: 'Please deal with this soon.' },
  High: { label: 'High urgency', symbol: '\u25A0', note: 'This needs your attention promptly.' },
}

function findUncertainty(uncertainties, kind, id) {
  return uncertainties.find(
    (item) => item.targetKind === kind && item.targetId === id,
  )
}

// ActionsStage is stage 2. It shows the most important information prominently
// (urgency, dates, and the action cards) and tucks the longer, nonessential
// detail (full explanation, suggested reply, original message) into clearly
// labelled disclosures so the stage stays short and focused. On wide screens
// the actions sit in the primary column and the detail in a secondary column.
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
  const urgency = URGENCY_DISPLAY[result.urgency] ?? URGENCY_DISPLAY.None

  return (
    <div className="dc-actions-stage">
      <h2 id="dc-actions-heading">{result.title}</h2>
      {providerLabel && (
        <p className="dc-result__disclaimer">{providerLabel}</p>
      )}

      <div className="dc-actions-stage__grid">
        {/* Primary column: the things that must not be missed. */}
        <div className="dc-actions-stage__primary">
          <div
            className={`dc-urgency dc-urgency--${result.urgency.toLowerCase()}`}
          >
            <span className="dc-urgency__symbol" aria-hidden="true">
              {urgency.symbol}
            </span>
            <span className="dc-urgency__label">{urgency.label}</span>
            <span className="dc-urgency__note">{urgency.note}</span>
          </div>

          <div className="dc-block">
            <h3>Important dates and deadlines</h3>
            {result.dates.length === 0 ? (
              <p className="dc-empty">No important dates were found.</p>
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
                        {date.isKnown ? date.dateText : 'Date not clearly stated'}
                      </span>
                      <span className="dc-date__what">{date.label}</span>
                      {uncertainty && (
                        <span className="dc-uncertainty">
                          Please check: {uncertainty.label}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <div className="dc-block">
            <h3>What you need to do</h3>
            {result.actions.length === 0 ? (
              <p className="dc-empty">No required actions were found.</p>
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
              Show the full explanation
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
                Show a reply you could send
              </summary>
              <div className="dc-disclosure__body">
                <p className="dc-help-text">
                  This is only a suggestion you can use if you wish. DeClear does
                  not send anything for you.
                </p>
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
