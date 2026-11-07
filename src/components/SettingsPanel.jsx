import { EXPLANATION_LEVELS, LANGUAGES } from '../data/settingsOptions.js'

// SettingsPanel lets the user personalize DeClear: how detailed explanations
// are, which language the output uses, and whether a read-aloud button is
// offered. It is a controlled component — the parent owns the settings and
// saves them.
//
// `speechSupported` is passed in so we can explain plainly when read-aloud is
// not available in the current browser, instead of offering a dead control.
function SettingsPanel({
  settings,
  onChange,
  isOpen,
  onToggle,
  speechSupported,
  saveFailed,
}) {
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
        {isOpen ? 'Hide settings' : 'Change settings'}
      </button>

      <h2 id="dc-settings-heading" className="dc-visually-hidden">
        Settings
      </h2>

      {isOpen && (
        <div id="dc-settings-body" className="dc-settings__body">
          {saveFailed && (
            <p className="dc-notice" role="alert">
              Your settings could not be saved in this browser, so they may not
              be remembered next time. They still apply right now.
            </p>
          )}

          <fieldset className="dc-fieldset">
            <legend className="dc-legend">How detailed should explanations be?</legend>
            {EXPLANATION_LEVELS.map((option) => (
              <label key={option.value} className="dc-choice">
                <input
                  type="radio"
                  name="dc-level"
                  value={option.value}
                  checked={settings.level === option.value}
                  onChange={() => update({ level: option.value })}
                />
                <span className="dc-choice__text">
                  <span className="dc-choice__label">{option.label}</span>
                  <span className="dc-choice__desc">{option.description}</span>
                </span>
              </label>
            ))}
          </fieldset>

          <fieldset className="dc-fieldset">
            <legend className="dc-legend">Which language should the explanation use?</legend>
            {LANGUAGES.map((option) => (
              <label key={option.value} className="dc-choice">
                <input
                  type="radio"
                  name="dc-language"
                  value={option.value}
                  checked={settings.language === option.value}
                  onChange={() => update({ language: option.value })}
                />
                <span className="dc-choice__text">
                  <span className="dc-choice__label">{option.label}</span>
                </span>
              </label>
            ))}
            <p className="dc-help-text">
              For now, English and French are available for the example messages
              only. Translation of your own messages will come with the AI
              feature in a later version.
            </p>
          </fieldset>

          <fieldset className="dc-fieldset">
            <legend className="dc-legend">Read explanations aloud?</legend>
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
                  Show a &ldquo;Read aloud&rdquo; button with each explanation
                </span>
                <span className="dc-choice__desc">
                  {speechSupported
                    ? 'Uses your browser’s built-in voice. Nothing is sent anywhere.'
                    : 'Your browser does not support reading aloud, so this option is turned off.'}
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
