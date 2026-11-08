# Changelog

This file is updated automatically by the "Commit Documentation" GitHub Actions
workflow. Each push to `main` appends an entry for every new commit, including
its short hash, date, message, changed files, and change statistics.

Please do not edit entries by hand. Add notes above this line if needed.

<!-- CHANGELOG:START -->
<!-- New entries are inserted below this marker, newest first. -->
### `63d4fb3` — 2026-11-07 22:28

**feat: tag AI actions with supported digital tasks so Help me do this shows in AI mode**

Changed files:

- `api/_lib/gemini.js`
- `src/data/guidanceTasks.js`
- `src/services/resultSchema.js`
- `src/services/resultSchema.test.js`

Stats: 4 files changed, 88 insertions(+), 6 deletions(-)

### `30634b7` — 2026-11-07 22:08

**fix: retry Gemini 503 and timeout with backoff for demo reliability**

Changed files:

- `api/_lib/gemini.js`
- `api/_lib/gemini.test.js`
- `api/_lib/guide.js`

Stats: 3 files changed, 240 insertions(+), 124 deletions(-)

### `5bc51fa` — 2026-11-07 21:44

**fix: raise function timeout, set Vercel maxDuration, and log timeout vs network failures**

Changed files:

- `api/_lib/gemini.js`
- `api/_lib/guide.js`
- `vercel.json`

Stats: 3 files changed, 29 insertions(+), 4 deletions(-)

### `589d948` — 2026-11-07 21:36

**fix: disable thinking budget and raise output cap so gemini-3.x returns full JSON**

Changed files:

- `api/_lib/gemini.js`
- `api/_lib/guide.js`

Stats: 2 files changed, 22 insertions(+), 4 deletions(-)

### `f5653b3` — 2026-11-07 21:06

**gemini fixes 1**

Changed files:

- `api/_lib/gemini.js`
- `api/_lib/guide.js`
- `api/explain.js`
- `api/guide.js`

Stats: 4 files changed, 39 insertions(+), 1 deletion(-)

### `336c640` — 2026-11-07 19:37

**feat: add action cards + WhatsApp photo guidance flow (AI + scripted fallback)**

Changed files:

- `api/_lib/guide.js`
- `api/_lib/guide.test.js`
- `api/guide.js`
- `src/App.css`
- `src/App.jsx`
- `src/components/ActionCard.jsx`
- `src/components/GuidanceFlow.jsx`
- `src/components/ResultPanel.jsx`
- `src/data/guidanceTasks.js`
- `src/data/sampleNotifications.js`
- `src/platform/image.js`
- `src/services/guidanceSchema.js`
- `src/services/guidanceSchema.test.js`
- `src/services/guidanceService.js`
- `src/services/guidanceService.test.js`

Stats: 15 files changed, 1452 insertions(+), 9 deletions(-)

### `29a3271` — 2026-11-07 19:20

**feat: add Gemini free-tier AI provider via serverless /api/explain with consent + grounding**

Changed files:

- `.env.example`
- `api/_lib/gemini.js`
- `api/_lib/gemini.test.js`
- `api/_lib/rateLimit.js`
- `api/explain.js`
- `eslint.config.js`
- `src/App.jsx`
- `src/components/SettingsPanel.jsx`
- `src/data/settingsOptions.js`
- `src/services/processorTypes.js`
- `src/services/providers/geminiProvider.js`
- `src/services/providers/geminiProvider.test.js`
- `src/services/providers/index.js`
- `src/services/resultSchema.js`
- `src/services/resultSchema.test.js`
- `src/storage/settingsStorage.js`

Stats: 16 files changed, 1130 insertions(+), 7 deletions(-)

### `99ea172` — 2026-11-07 18:30

**async notification processing refactor**

Changed files:

- `src/App.css`
- `src/App.jsx`
- `src/services/notificationProcessor.js`
- `src/services/notificationProcessor.test.js`
- `src/services/processorTypes.js`
- `src/services/providers/demoProvider.js`
- `src/services/providers/index.js`

Stats: 7 files changed, 184 insertions(+), 71 deletions(-)

### `cb66348` — 2026-11-07 17:38

**docs: add AI development journal**

Changed files:

- `package-lock.json`
- `package.json`
- `src/App.css`
- `src/App.jsx`
- `src/components/ResultPanel.jsx`
- `src/data/sampleNotifications.js`
- `src/services/notificationProcessor.js`
- `src/services/notificationProcessor.test.js`
- `src/services/processorTypes.js`
- `src/services/providers/demoProvider.js`
- `src/services/providers/index.js`

Stats: 11 files changed, 2246 insertions(+), 223 deletions(-)

### `340146d` — 2026-11-07 17:38

**docs: add AI development journal**

Changed files:

- `.kiro/agents/commit-reviewer.md`
- `.kiro/hooks/journal-after-task.json`

Stats: 2 files changed, 123 insertions(+), 42 deletions(-)

### `94f512c` — 2026-11-07 17:11

**make UI accessibe (details + French addition)**

Changed files:

- `src/App.css`
- `src/App.jsx`
- `src/components/ReadAloudControl.jsx`
- `src/components/ResultPanel.jsx`
- `src/components/SettingsPanel.jsx`
- `src/data/sampleNotifications.js`
- `src/data/settingsOptions.js`
- `src/platform/speech.js`
- `src/storage/settingsStorage.js`

Stats: 9 files changed, 988 insertions(+), 100 deletions(-)

### `691b837` — 2026-11-07 16:51

**first UI design implementation**

Changed files:

- `index.html`
- `src/App.css`
- `src/App.jsx`
- `src/components/AppHeader.jsx`
- `src/components/NotificationInput.jsx`
- `src/components/OriginalMessage.jsx`
- `src/components/ResultPanel.jsx`
- `src/components/SampleCard.jsx`
- `src/data/sampleNotifications.js`
- `src/index.css`

Stats: 10 files changed, 844 insertions(+), 260 deletions(-)

### `e2562d4` — 2026-11-07 16:36

**feature specification MVP**

Changed files:

- `.kiro/specs/declear-mvp/.config.kiro`
- `.kiro/specs/declear-mvp/design.md`
- `.kiro/specs/declear-mvp/requirements.md`
- `.kiro/specs/declear-mvp/tasks.md`

Stats: 4 files changed, 962 insertions(+)

### `a0a7c45` — 2026-11-07 15:04

**Created 3 primary agents developing agents**

Changed files:

- `.kiro/agents/accessibility-specialist.md`
- `.kiro/agents/qa-reviewer.md`
- `.kiro/agents/ui-designer.md`

Stats: 3 files changed, 104 insertions(+)

### `22b9977` — 2026-11-07 14:52

**Created commit documentation workflow agent**

Changed files:

- `.github/workflows/commit-docs.yml`
- `.kiro/agents/commit-reviewer.md`
- `docs/CHANGELOG.md`

Stats: 3 files changed, 202 insertions(+)

