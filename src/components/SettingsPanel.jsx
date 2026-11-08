import { useTranslation } from '../i18n/context.js'
import { SUPPORTED_LANGUAGES } from '../i18n/index.js'

// SettingsPanel lets the user personalize DeClear: processing mode, AI consent,
// explanation level, interface language, and read-aloud. It is a controlled
// component — the parent owns the settings and saves them. Changing the
// language updates the whole interface immediately (the parent re-renders under
// a new LanguageProvider value).
//
// Option labels/descriptions come from translation keys, so every control is
// localized, not just free text.
const MODE_OPTIONS = [
  { value: 'demo', labelKey: 'settings.mode.demo.label', descKey: 'settings.mode.demo.desc' },
  { value: 'ai', labelKey: 'settings.mode.ai.label', descKey: 'settings.mode.ai.desc' },
]

const LEVEL_OPTIONS = [
  { value: 'brief', labelKey: 'settings.level.brief.label', descKey: 'settings.level.brief.desc' },
  { value: 'standard', labelKey: 'settings.level.standard.label', descKey: 'settings.level.standard.desc' },
  { value: 'guided', labelKey: 'settings.level.guided.label', descKey: 'settings.level.guided.desc' },
]

function SettingsPanel({
  settings,
  onChange,
  isOpen,
  onToggle,
  speechSupported,
  saveFailed,
}) {
  const { t } = useTranslation()

  function update(partial) {
    onChange({ ...settings, ...partial })
  }

  return (
    <section className="dc-settings" aria-labelledby="dc-settings-heading">
      <button
        type="button"
        className="dc-secondary-button dc-settings__toggle"
        aria-expanded={isOpen}
        aria-controls="dc-settings-body"
        onClick={onToggle}
      >
        {isOpen ? t('settings.hide') : t('settings.show')}
      </button>

      <h2 id="dc-settings-heading" className="dc-visually-hidden">
        {t('settings.heading')}
      </h2>

      {isOpen && (
        <div id="dc-settings-body" className="dc-settings__body">
          {saveFailed && (
            <p className="dc-notice" role="alert">
              {t('settings.saveFailed')}
            </p>
          )}

          {/* Language first: changing it re-localizes everything below. */}
          <fieldset className="dc-fieldset">
            <legend className="dc-legend">{t('settings.language.legend')}</legend>
            {SUPPORTED_LANGUAGES.map((code) => (
              <label key={code} className="dc-choice">
                <input
                  type="radio"
                  name="dc-language"
                  value={code}
                  checked={settings.language === code}
                  onChange={() => update({ language: code })}
                />
                <span className="dc-choice__text">
                  <span className="dc-choice__label">{t(`language.${code}`)}</span>
                </span>
              </label>
            ))}
            <p className="dc-help-text">{t('settings.language.help')}</p>
          </fieldset>

          <fieldset className="dc-fieldset">
            <legend className="dc-legend">{t('settings.mode.legend')}</legend>
            {MODE_OPTIONS.map((option) => (
              <label key={option.value} className="dc-choice">
                <input
                  type="radio"
                  name="dc-mode"
                  value={option.value}
                  checked={settings.mode === option.value}
                  onChange={() => update({ mode: option.value })}
                />
                <span className="dc-choice__text">
                  <span className="dc-choice__label">{t(option.labelKey)}</span>
                  <span className="dc-choice__desc">{t(option.descKey)}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {settings.mode === 'ai' && (
            <fieldset className="dc-fieldset">
              <legend className="dc-legend">{t('settings.consent.legend')}</legend>
              <p className="dc-help-text">{t('settings.consent.notice')}</p>
              <label className="dc-choice">
                <input
                  type="checkbox"
                  name="dc-ai-consent"
                  checked={settings.aiConsent}
                  onChange={(event) =>
                    update({ aiConsent: event.target.checked })
                  }
                />
                <span className="dc-choice__text">
                  <span className="dc-choice__label">
                    {t('settings.consent.checkbox')}
                  </span>
                  <span className="dc-choice__desc">
                    {t('settings.consent.checkboxDesc')}
                  </span>
                </span>
              </label>
            </fieldset>
          )}

          <fieldset className="dc-fieldset">
            <legend className="dc-legend">{t('settings.level.legend')}</legend>
            {LEVEL_OPTIONS.map((option) => (
              <label key={option.value} className="dc-choice">
                <input
                  type="radio"
                  name="dc-level"
                  value={option.value}
                  checked={settings.level === option.value}
                  onChange={() => update({ level: option.value })}
                />
                <span className="dc-choice__text">
                  <span className="dc-choice__label">{t(option.labelKey)}</span>
                  <span className="dc-choice__desc">{t(option.descKey)}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset className="dc-fieldset">
            <legend className="dc-legend">{t('settings.readAloud.legend')}</legend>
            <label className="dc-choice">
              <input
                type="checkbox"
                name="dc-read-aloud"
                checked={settings.readAloud}
                disabled={!speechSupported}
                onChange={(event) => update({ readAloud: event.target.checked })}
              />
              <span className="dc-choice__text">
                <span className="dc-choice__label">
                  {t('settings.readAloud.label')}
                </span>
                <span className="dc-choice__desc">
                  {speechSupported
                    ? t('settings.readAloud.descOn')
                    : t('settings.readAloud.descOff')}
                </span>
              </span>
            </label>
          </fieldset>
        </div>
      )}
    </section>
  )
}

export default SettingsPanel
