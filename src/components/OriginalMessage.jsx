// Shows the original message exactly as it was provided, with no changes to
// spacing or wording. This keeps the source document always available so the
// user can check the plain-language explanation against it.
//
// The parent controls whether this is open via `isOpen`/`onToggle`.
function OriginalMessage({ original, isOpen, onToggle }) {
  return (
    <section className="dc-original" aria-labelledby="dc-original-heading">
      <h2 id="dc-original-heading" className="dc-visually-hidden">
        Original message
      </h2>
      <button
        type="button"
        className="dc-secondary-button"
        aria-expanded={isOpen}
        aria-controls="dc-original-text"
        onClick={onToggle}
      >
        {isOpen ? 'Hide the original message' : 'Show the original message'}
      </button>

      {isOpen && (
        <div id="dc-original-text" className="dc-original__body">
          {original ? (
            <pre className="dc-original__pre">{original}</pre>
          ) : (
            <p className="dc-empty">No original message is available.</p>
          )}
        </div>
      )}
    </section>
  )
}

export default OriginalMessage
