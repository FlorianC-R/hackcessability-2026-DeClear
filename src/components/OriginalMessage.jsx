import { useTranslation } from '../i18n/context.js'

// Shows the original message exactly as it was provided, with no changes to
// spacing or wording. This keeps the source document always available so the
// user can check the plain-language explanation against it. The source text is
// never translated — only the surrounding controls are.
function OriginalMessage({ original, isOpen, onToggle }) {
  const { t } = useTranslation()
  return (
    <section className="dc-original" aria-labelledby="dc-original-heading">
      <h2 id="dc-original-heading" className="dc-visually-hidden">
        {t('original.heading')}
      </h2>
      <button
        type="button"
        className="dc-secondary-button"
        aria-expanded={isOpen}
        aria-controls="dc-original-text"
        onClick={onToggle}
      >
        {isOpen ? t('original.hide') : t('original.show')}
      </button>

      {isOpen && (
        <div id="dc-original-text" className="dc-original__body">
          {original ? (
            <pre className="dc-original__pre">{original}</pre>
          ) : (
            <p className="dc-empty">{t('original.none')}</p>
          )}
        </div>
      )}
    </section>
  )
}

export default OriginalMessage
