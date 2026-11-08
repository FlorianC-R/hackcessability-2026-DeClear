# Changelog

This file is updated automatically by the "Commit Documentation" GitHub Actions
workflow. Each push to `main` appends an entry for every new commit, including
its short hash, date, message, changed files, and change statistics.

Please do not edit entries by hand. Add notes above this line if needed.

<!-- CHANGELOG:START -->
<!-- New entries are inserted below this marker, newest first. -->
### `476732d` — 2026-11-08 01:04

**style: inline Explain loading state, teal accent, colour-coded urgency levels**

Changed files:

- `src/App.css`
- `src/App.jsx`
- `src/components/NotificationInput.jsx`

Stats: 3 files changed, 101 insertions(+), 8 deletions(-)

### `e100e0b` — 2026-11-08 00:43

**fix: make guidance stage conditional so no-action messages complete cleanly**

Changed files:

- `src/App.css`
- `src/App.jsx`
- `src/App.test.jsx`
- `src/components/ActionsStage.jsx`
- `src/components/StageProgress.jsx`
- `src/i18n/en.js`
- `src/i18n/es.js`
- `src/i18n/fr.js`
- `src/i18n/zh-CN.js`

Stats: 9 files changed, 138 insertions(+), 14 deletions(-)

### `0113c86` — 2026-11-08 00:24

**fix: show settings only on the message stage so language can't desync generated output**

Changed files:

- `src/App.jsx`
- `src/App.test.jsx`

Stats: 2 files changed, 13 insertions(+), 7 deletions(-)

### `3d72d9c` — 2026-11-08 00:22

**style: warm theme, brand font, brighter dark mode, reordered message stage, CTA polish**

Changed files:

- `src/App.css`
- `src/App.jsx`
- `src/components/NotificationInput.jsx`
- `src/i18n/en.js`
- `src/i18n/es.js`
- `src/i18n/fr.js`
- `src/i18n/zh-CN.js`
- `src/index.css`

Stats: 8 files changed, 231 insertions(+), 95 deletions(-)

### `f4310d8` — 2026-11-07 23:40

**feat: full multilingual UI (en/fr/es/zh-CN) with translated scripted guidance**

Changed files:

- `api/_lib/guide.js`
- `api/guide.js`
- `src/App.css`
- `src/App.jsx`
- `src/App.test.jsx`
- `src/components/ActionCard.jsx`
- `src/components/ActionsStage.jsx`
- `src/components/AppHeader.jsx`
- `src/components/GuidanceFlow.jsx`
- `src/components/NotificationInput.jsx`
- `src/components/OriginalMessage.jsx`
- `src/components/ReadAloudControl.jsx`
- `src/components/SampleCard.jsx`
- `src/components/SettingsPanel.jsx`
- `src/components/StageProgress.jsx`
- `src/data/guidanceTasks.js`
- `src/data/sampleLocale.js`
- `src/data/settingsOptions.js`
- `src/i18n/LanguageContext.jsx`
- `src/i18n/context.js`
- `src/i18n/en.js`
- `src/i18n/es.js`
- `src/i18n/fr.js`
- `src/i18n/i18n.test.js`
- `src/i18n/index.js`
- `src/i18n/zh-CN.js`
- `src/index.css`
- `src/platform/speech.js`
- `src/services/guidanceService.js`
- `src/services/guidanceService.test.js`
- `src/storage/settingsStorage.test.js`

Stats: 31 files changed, 1624 insertions(+), 306 deletions(-)

### `23605e7` — 2026-11-07 23:11

**feat: focused three-stage UI (Message/Actions/Guidance) with state preservation and nav tests**

Changed files:

- `package-lock.json`
- `package.json`
- `src/App.css`
- `src/App.jsx`
- `src/App.test.jsx`
- `src/components/ActionsStage.jsx`
- `src/components/ResultPanel.jsx`
- `src/components/StageProgress.jsx`
- `src/test/setup.js`
- `vite.config.js`

Stats: 10 files changed, 1687 insertions(+), 238 deletions(-)

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

