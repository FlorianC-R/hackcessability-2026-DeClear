# Implementation Plan: DeClear MVP

## Overview

This plan implements DeClear as a browser-only React application on the existing Vite / React 19 / JavaScript / ESLint / plain-CSS stack. No runtime dependencies are added. The only new dependencies are dev-only test tools (`vitest`, `@testing-library/react`, `jsdom`, `fast-check`).

Work is organized into incremental milestones. Early milestones establish the test harness and the single data contract, then build the deterministic `Demo_Provider` and service layer, then the UI shell and components, and finally accessibility polish. The `Ollama_Provider` is a clearly-marked later/optional milestone. Each task is small and independently testable, builds on earlier tasks, and ends by wiring new code into what already exists so no code is left orphaned.

Tasks marked with `*` are optional (test tasks, the future Ollama milestone, and nice-to-have polish). Core MVP implementation tasks are never optional.

## Tasks

### Milestone 1: Project and test setup

- [ ] 1. Add dev-only test dependencies and wire up the test script
  - Add `vitest`, `@testing-library/react`, `jsdom`, and `fast-check` to `devDependencies` in `package.json` (do NOT add any runtime dependency).
  - Add a `"test": "vitest run"` script (single-run, not watch) to `package.json`.
  - Add a comment/note in the plan and in `vite.config.js` explaining these are **dev dependencies**: `vitest` is the test runner matching the Vite stack, `@testing-library/react` + `jsdom` render and query components in a simulated DOM, and `fast-check` provides property-based input generation that the project otherwise lacks. None ship in the production bundle.
  - Configure the Vitest test environment (`jsdom`) inside `vite.config.js` via the `test` field and add a test setup file importing `@testing-library/jest-dom`-style matchers only if already available (otherwise plain assertions).
  - _Requirements: 11.2, 11.3_

- [ ] 1.1 Create the source directory structure and a smoke test
  - Create folders for `src/services`, `src/storage`, `src/components`, and `src/data`.
  - Add a trivial module and a passing smoke test to confirm the Vitest + jsdom harness runs end-to-end.
  - _Requirements: 11.3_

- [ ]* 1.2 Verify ESLint and the test runner both pass on the new setup
  - Run `npm run lint` and `npm run test` and fix any configuration errors so both commands succeed on the empty harness.
  - _Requirements: 11.3_

### Milestone 2: Data contract and storage

- [ ] 2. Define the `Processing_Result` / `ProcessingError` data contract
  - Create `src/services/types.js` with JSDoc typedefs for `ExplanationComplexity`, `PreferredLanguage`, `ProcessRequest`, `RequiredAction`, `ImportantDate`, `UncertaintyIndicator`, `ProcessingResult`, and `ProcessingError` exactly as specified in the design Data Models section.
  - Export small constants: the allowed urgency set `['None','Low','Medium','High']`, the complexity levels, and the four language codes `['en','zh','fr','es']`.
  - _Requirements: 5.1, 5.5_

- [ ] 2.1 Implement the settings storage wrapper
  - Create `src/storage/settingsStorage.js` with `loadSettings()` and `saveSettings(settings)` over `localStorage` key `declear.settings.v1`.
  - `saveSettings` wraps writes in try/catch and signals failure to the caller without throwing.
  - `loadSettings` defensively parses JSON and validates that `complexity` is an allowed level and `language` is one of the four codes, falling back to default complexity and `'en'` otherwise.
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 3.2, 3.4, 3.5_

- [ ]* 2.2 Write property test for settings persistence round-trip
  - **Property 15: Settings persistence round-trips**
  - **Validates: Requirements 2.2, 3.2**
  - Tag: `Feature: declear-mvp, Property 15`. Use fast-check with >=100 cases over valid complexity/language values; mock `localStorage`.

- [ ]* 2.3 Write property test for invalid stored settings falling back to defaults
  - **Property 16: Invalid stored settings fall back to defaults**
  - **Validates: Requirements 2.5, 3.5**
  - Tag: `Feature: declear-mvp, Property 16`. Generate absent/empty/corrupt/out-of-set values (>=100 cases) and assert defaults returned.

- [ ] 2.4 Implement the task storage wrapper
  - Create `src/storage/taskStorage.js` with `loadTasks()`, `saveTask(action)`, and `removeTask(id)` over `localStorage` key `declear.tasks.v1`.
  - De-duplicate on normalized (trimmed) `text` so saving the same action twice keeps one entry.
  - Writes wrapped in try/catch; reads defensively parsed and shape-validated (entries must have string `text`), returning an empty list on failure.
  - _Requirements: 9.2, 9.3, 9.4, 9.5, 9.6, 9.8_

- [ ]* 2.5 Write property test for saving an action round-trip
  - **Property 17: Saving an action round-trips**
  - **Validates: Requirements 9.2**
  - Tag: `Feature: declear-mvp, Property 17`. fast-check >=100 cases; mock `localStorage`.

- [ ]* 2.6 Write property test for idempotent saving
  - **Property 18: Saving an action is idempotent**
  - **Validates: Requirements 9.3**
  - Tag: `Feature: declear-mvp, Property 18`. Save twice, assert exactly one matching entry (>=100 cases).

- [ ]* 2.7 Write property test for removing a saved action
  - **Property 19: Removing a saved action removes exactly that action**
  - **Validates: Requirements 9.8**
  - Tag: `Feature: declear-mvp, Property 19`. Generate sets of entries, remove one, assert the rest are unchanged (>=100 cases).

- [ ]* 2.8 Write example tests for storage failure paths
  - Simulate write failure (quota/denied) and corrupt/unreadable reads for both stores; assert the wrappers report failure and degrade to defaults/empty rather than throwing.
  - _Requirements: 2.3, 3.3, 9.4, 9.6_

### Milestone 3: Demo provider and processor service

- [ ] 3. Create the sample-data module
  - Create `src/data/sampleData.js` exporting between 1 and 10 entries, each `{ id, title, text }`, covering realistic appointment/bill/notice messages.
  - _Requirements: 1.1_

- [ ] 3.1 Implement the deterministic Demo_Provider
  - Create `src/services/demoProvider.js` implementing the `{ id: 'demo', process(req) }` contract.
  - Derive `requiredActions` and `importantDates` only by matching explicit substrings/patterns in `originalMessage`, recording each item's exact `sourceText`; omit anything not traceable.
  - Preserve identification order for `requiredActions`. Always return all five fields with empty collections as `[]`. Set `urgencyLevel` to one of `None/Low/Medium/High`. Attach `uncertaintyIndicators` to any implied-but-not-explicit date/action/urgency/explanation.
  - Make the result a pure function of `(originalMessage, complexity, language)` and perform no network calls.
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 6.1, 6.4, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 3.2 Tag explanation output with requested complexity and language
  - Ensure the Demo_Provider's `explanation` is produced for exactly the requested `complexity` and `language` and is identifiable as such (e.g., via internal tagging used by tests).
  - _Requirements: 3.7, 6.1_

- [ ]* 3.3 Write property test for result completeness
  - **Property 1: Result completeness**
  - **Validates: Requirements 5.1, 5.3, 5.4, 5.7**
  - Tag: `Feature: declear-mvp, Property 1`. fast-check >=100 ProcessRequests.

- [ ]* 3.4 Write property test for valid urgency category
  - **Property 2: Urgency is a valid category**
  - **Validates: Requirements 5.5**
  - Tag: `Feature: declear-mvp, Property 2`. >=100 cases.

- [ ]* 3.5 Write property test for required-action source ordering
  - **Property 3: Required-action order follows source order**
  - **Validates: Requirements 5.2**
  - Tag: `Feature: declear-mvp, Property 3`. Assert non-decreasing `sourceText` start offsets (>=100 cases).

- [ ]* 3.6 Write property test for important-date source traceability
  - **Property 4: Important dates trace to source text**
  - **Validates: Requirements 10.1, 10.2**
  - Tag: `Feature: declear-mvp, Property 4`. Embed known date phrases in arbitrary text; assert each `sourceText` is an exact substring (>=100 cases).

- [ ]* 3.7 Write property test for required-action source traceability
  - **Property 5: Required actions trace to source text**
  - **Validates: Requirements 10.3, 10.4**
  - Tag: `Feature: declear-mvp, Property 5`. >=100 cases.

- [ ]* 3.8 Write property test for uncertainty attachment
  - **Property 6: Uncertainty attaches to unstated information**
  - **Validates: Requirements 5.6, 10.5**
  - Tag: `Feature: declear-mvp, Property 6`. >=100 cases.

- [ ]* 3.9 Write property test for determinism
  - **Property 9: Demo provider is deterministic**
  - **Validates: Requirements 6.4**
  - Tag: `Feature: declear-mvp, Property 9`. Invoke twice per input, assert deep equality (>=100 cases).

- [ ]* 3.10 Write property test for explanation complexity/language correspondence
  - **Property 10: Explanation corresponds to requested complexity and language**
  - **Validates: Requirements 3.7, 6.1**
  - Tag: `Feature: declear-mvp, Property 10`. >=100 complexity/language pairs.

- [ ] 3.11 Implement the processMessage service and provider registry
  - Create `src/services/providerRegistry.js` mapping ids to instances (`demo` only for now) with `getProvider(id)` returning `null` for unknown ids.
  - Create `src/services/notificationProcessor.js` exporting `processMessage(req, { provider, timeoutMs })`: validate input (reject `empty-input` after trim and `too-long` over 10000 chars before any provider call), reject with a provider error when provider is missing, apply a uniform 30-second timeout, and return the provider's `ProcessingResult`.
  - _Requirements: 4.1, 4.4, 6.2, 6.3, 6.7, 6.8_

- [ ]* 3.12 Write property test for input validation
  - **Property 11: Input validation rejects empty and oversized input**
  - **Validates: Requirements 4.2, 6.2**
  - Tag: `Feature: declear-mvp, Property 11`. Generate empty-after-trim and >10000-char inputs; assert rejection and that the provider's `process` is never invoked (spy) (>=100 cases).

- [ ]* 3.13 Write property test for local-only, no automatic side effects
  - **Property 14: Processing is local-only with no automatic side effects**
  - **Validates: Requirements 10.7, 10.9, 11.2, 11.6, 11.8, 11.10**
  - Tag: `Feature: declear-mvp, Property 14`. Spy on `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`; assert zero calls and no persistence across generated inputs (>=100 cases).

- [ ]* 3.14 Write example tests for processor routing and errors
  - Cover routing to the configured provider (6.7), missing-provider error (6.8), timeout behavior via fake timers (4.4), and that the Demo_Provider satisfies the interface (6.3).
  - _Requirements: 4.4, 6.3, 6.7, 6.8_

### Milestone 4: UI shell and input/settings components

- [ ] 4. Build the App.jsx coordinator shell and single-column layout
  - Replace the starter `App.jsx` with the state owner: `originalMessage`, `selectedSampleId`, `settings`, `status`, `result`, `savedActions`, `inspectOpen`, and transient notices.
  - On startup, load settings and saved actions via the storage wrappers (applying defaults/notices on failure) and render a single scrollable column shell with placeholders for each section.
  - _Requirements: 2.4, 2.5, 2.6, 3.4, 3.5, 9.5, 9.6_

- [ ] 4.1 Implement the MessageInput component
  - Create `src/components/MessageInput.jsx`: render the 1–10 selectable `Sample_Message` items with a visible selected state, a paste/type area capped at 5000 characters, and a clearly-labeled "Explain this message" button.
  - Trim entered text into `Original_Message`; clear the sample selection when the user types their own text; report changes upward.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 4.2 Wire input validation and processing invocation into App.jsx
  - Block processing and show a notice for empty-after-trim input and for input over 5000 chars, without invoking the processor.
  - On valid input, resolve the provider, set `status` to processing (show in-progress indicator), call `processMessage`, and on error retain `Original_Message` for retry with a plain-language notice.
  - _Requirements: 1.6, 1.7, 4.1, 4.2, 4.3, 4.4, 4.7, 6.7, 6.8, 10.9_

- [ ]* 4.3 Write property test for input trimming
  - **Property 12: Entered input is trimmed**
  - **Validates: Requirements 1.4**
  - Tag: `Feature: declear-mvp, Property 12`. >=100 generated strings.

- [ ]* 4.4 Write example tests for MessageInput and processing flow
  - Cover sample bounds/selection (1.1–1.3, 1.5), the 5000-char boundary (1.3, 1.7), empty-input block (1.6), in-progress indicator (4.3), and failure-notice-with-retry (4.7).
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.6, 1.7, 4.3, 4.7_

- [ ] 4.5 Implement the SettingsPanel component
  - Create `src/components/SettingsPanel.jsx`: a single-select `Explanation_Complexity` control and a control for exactly the four languages (English, Mandarin, French, Spanish).
  - On change, persist via `settingsStorage`, apply to the session immediately, and show a textual notice if the save fails while keeping the chosen value.
  - Pass current complexity and language with each processing request.
  - _Requirements: 2.1, 2.2, 2.3, 2.7, 3.1, 3.2, 3.3, 3.6_

- [ ]* 4.6 Write example tests for SettingsPanel
  - Cover single-select behavior, exactly four languages, startup application of persisted values, defaults, save-failure notices, and that selected values are passed to the processor.
  - _Requirements: 2.1, 2.3, 2.4, 2.6, 2.7, 3.1, 3.3, 3.4, 3.6_

### Milestone 5: Results display

- [ ] 5. Implement the ResultView component
  - Create `src/components/ResultView.jsx`: display `explanation` (in the requested language), `requiredActions`, `importantDates`, and `urgencyLevel` in dedicated, prominent blocks.
  - Show "No required actions were found" / "No important dates were found" when those collections are empty.
  - Render a textual uncertainty label on every element carrying an `UncertaintyIndicator` (never colour alone); show urgency as a worded label plus icon/shape.
  - Offer a "Save this action" control per required action, and host the ReadAloudControl slot.
  - _Requirements: 3.7, 4.5, 4.6, 9.1, 10.6_

- [ ]* 5.1 Write property test for complete result rendering
  - **Property 8: Result rendering is complete**
  - **Validates: Requirements 4.5, 4.6**
  - Tag: `Feature: declear-mvp, Property 8`. Render generated results; assert explanation, every action, every date, urgency, and empty-state notices appear (>=100 cases).

- [ ]* 5.2 Write property test for uncertainty text rendering
  - **Property 7: Uncertainty renders as a text label**
  - **Validates: Requirements 10.6**
  - Tag: `Feature: declear-mvp, Property 7`. Assert a visible textual uncertainty label for every indicator (>=100 cases).

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Milestone 6: Read aloud

- [ ] 7. Implement the speech platform wrapper
  - Create `src/platform/speech.js` wrapping `speechSynthesis` with feature detection and `speak(text, handlers)` / `stop()` helpers that surface start/finish/error events.
  - _Requirements: 7.1, 7.7_

- [ ] 7.1 Implement the ReadAloudControl component and wire into ResultView
  - Create `src/components/ReadAloudControl.jsx`: render only when `speechSynthesis` is supported; start speaking the full explanation within 1s, swap to a "Stop reading" control while speaking, stop on user request or completion, and show an "unavailable" notice on error.
  - Mount it in the ResultView slot.
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ]* 7.2 Write example tests for read-aloud
  - Mock `speechSynthesis`: cover presence/absence by feature detection (7.1, 7.7), start/stop/finish, and the error path (7.2–7.6).
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

### Milestone 7: Saved actions

- [ ] 8. Implement the SavedActions component and wire save/remove into App.jsx
  - Create `src/components/SavedActions.jsx`: list all `Saved_Action` entries loaded at startup, with per-item "Remove" controls and a load-failure notice when the store can't be read.
  - In App.jsx, persist a `Saved_Action` only on explicit "Save this action" (show success/failure notices, de-dupe, leave existing entries unchanged on write failure) and remove on explicit "Remove".
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 10.10_

- [ ]* 8.1 Write example tests for SavedActions wiring
  - Cover save control present and success notice (9.1, 9.2), save-failure notice with unchanged entries (9.4), load-all on startup (9.5), read-failure notice (9.6), and remove behavior (9.7, 9.8).
  - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6, 9.7, 9.8_

### Milestone 8: Inspect original

- [ ] 9. Implement the InspectOriginal component and wire into App.jsx
  - Create `src/components/InspectOriginal.jsx`: an inspect control that shows the `Original_Message` byte-for-byte (preserving whitespace, line breaks, punctuation, capitalization) within 1s in a text-preserving container, with a close control and a "No original message is available" message when empty.
  - Ensure App.jsx retains the `Original_Message` unchanged through processing and display.
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 10.8_

- [ ]* 9.1 Write property test for original-message fidelity end-to-end
  - **Property 13: Original-message fidelity is preserved end-to-end**
  - **Validates: Requirements 8.2, 8.3, 10.8**
  - Tag: `Feature: declear-mvp, Property 13`. Generate arbitrary strings (whitespace/line breaks/punctuation); assert the retained and inspected value is byte-for-byte identical before/during/after processing (>=100 cases).

- [ ]* 9.2 Write example tests for InspectOriginal
  - Cover control presence, close behavior, and the empty-message message.
  - _Requirements: 8.1, 8.4, 8.5_

### Milestone 9: Accessibility polish and scope guards

- [ ] 10. Apply accessibility styling and layout in plain CSS
  - In `App.css` / `index.css`: large high-contrast type (>=18px body), prominent date/action/urgency blocks placed high, clear action-describing button labels, meaning never by colour alone, single-column minimal-chrome layout.
  - _Requirements: 4.5, 10.6_

- [ ]* 10.1 Write example tests for scope guards
  - Assert no auth/login/registration/credential UI is present anywhere (11.1) and that persistence uses only localStorage (11.2).
  - _Requirements: 11.1, 11.2_

- [ ]* 10.2 Nice-to-have accessibility polish (optional)
  - Optional refinements such as focus-visible outlines, reduced-motion handling, and ARIA live-region notices for transient messages.
  - _Requirements: 10.6_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

### Milestone 10: Future Ollama provider (later / optional)

- [ ]* 12. Implement the Ollama_Provider (future, optional)
  - Create `src/services/ollamaProvider.js` with the same `{ id: 'ollama', process(req) }` signature, calling the local Ollama HTTP endpoint via `fetch`, prompting for the `Processing_Result` shape and a "never invent facts" instruction, normalizing/validating the response into the contract, and reporting an error (no partial result) on unreachable endpoint or 30s timeout. Register it in `providerRegistry`.
  - _Requirements: 5.8, 6.5, 6.6, 10.7_

- [ ]* 12.1 Write integration tests for the Ollama_Provider (future, optional)
  - Validate the normalize-and-validate layer against the completeness and urgency contract, and exercise reachable, unreachable (error, no partial result), and timeout cases.
  - _Requirements: 5.8, 6.5, 6.6_

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP path; the entire Ollama milestone (Milestone 10) is optional/future.
- The dev-only test dependencies (`vitest`, `@testing-library/react`, `jsdom`, `fast-check`) add no runtime dependency and do not ship in the production bundle; they are required because the template ships no test setup and property-based generation is not otherwise available.
- Each property-based test runs a minimum of 100 generated inputs and is tagged `Feature: declear-mvp, Property N`.
- Each task references the requirement numbers it satisfies; property-test tasks also reference the design correctness property by number.
- Checkpoints provide incremental validation points.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["1.1", "1.2"] },
    { "id": 2, "tasks": ["2", "2.1", "2.4", "3"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.5", "2.6", "2.7", "2.8", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8", "3.9", "3.10"] },
    { "id": 5, "tasks": ["3.11", "7"] },
    { "id": 6, "tasks": ["3.12", "3.13", "3.14", "4"] },
    { "id": 7, "tasks": ["4.1", "4.5", "5", "8", "9"] },
    { "id": 8, "tasks": ["4.2", "4.6", "5.1", "5.2", "7.1", "8.1", "9.1", "9.2"] },
    { "id": 9, "tasks": ["4.3", "4.4", "7.2", "10"] },
    { "id": 10, "tasks": ["10.1", "10.2", "12"] },
    { "id": 11, "tasks": ["12.1"] }
  ]
}
```
