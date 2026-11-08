import {
  EXPLANATION_LEVELS,
  LANGUAGES,
  PROCESSING_MODES,
} from '../data/settingsOptions.js'

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
            <legend className="dc-legend">How should DeClear explain messages?</legend>
            {PROCESSING_MODES.map((option) => (
              <label key={option.value} className="dc-choice">
                <input
                  type="radio"
                  name="dc-mode"
                  value={option.value}
                  checked={settings.mode === option.value}
                  onChange={() => update({ mode: option.value })}
                />
                <span className="dc-choice__text">
                  <span className="dc-choice__label">{option.label}</span>
                  <span className="dc-choice__desc">{option.description}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {settings.mode === 'ai' && (
            <fieldset className="dc-fieldset">
              <legend className="dc-legend">
                Consent to use AI (Google Gemini)
              </legend>
              <p className="dc-help-text">
                In AI mode, the message you choose to explain is sent over the
                internet to Google&rsquo;s Gemini service to be processed.
                DeClear uses Google&rsquo;s <strong>free tier</strong>. Outside
                the EEA, UK, and Switzerland, Google may use free-tier content to
                improve its products, and such content may be reviewed by people.
                Do not send anything you want to keep private. You can switch
                back to Demo mode at any time; Demo mode sends nothing.
              </p>
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
                    I understand and agree to send my message to Google Gemini
                  </span>
                  <span className="dc-choice__desc">
                    AI explanations stay turned off until you check this box.
                  </span>
                </span>
              </label>
            </fieldset>
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
              English and French are supported. In Demo mode this applies to the
              example messages; in AI mode the explanation of your own message is
              produced in the language you choose here.
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
