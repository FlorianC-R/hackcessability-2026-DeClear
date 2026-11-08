# DeClear

**Understand your technology in the clearest words.**

DeClear is an accessibility-first web app that helps older adults deal with everyday digital messages — bills, appointment reminders, service notices, and family texts. It explains a message in plain language, pulls out the real actions, dates, and urgency, and — for supported tasks — guides the user through completing them on their phone, one step at a time.

Built for **Hackcessability 2026** (Boston University), Information Access track, with a Cybersecurity sub-track.

---

## The problem

Older adults are the fastest-growing, most digitally-excluded group. The barrier usually isn't understanding *what* a message says — it's carrying out the *digital task* it asks for: sending a photo, replying in an unfamiliar app, collecting a prescription. Most tools explain the words. Almost none help with the doing. That gap quietly costs people their independence.

## What DeClear does

A focused, three-stage flow — one screen at a time to reduce cognitive load:

1. **Message** — paste a message, or pick one of six built-in examples.
2. **Actions** — DeClear explains it in plain words and extracts the actions, important dates, and urgency. It is **honest**: if there's nothing to do, it says *"Nothing you need to do right now"* instead of inventing a task, and it flags anything unclear rather than guessing.
3. **Guidance** — for a supported digital task (e.g. *Send photos on WhatsApp*), tap **"Help me do this"** for a step-by-step walkthrough with **Back / Next / Repeat aloud / I'm stuck**.

### Key principles
- **Honesty over false confidence** — never fabricates dates, actions, or certainty; states plainly that it *guides* you and cannot control your phone.
- **Cognitive accessibility first** — short sentences, one task per screen, large high-contrast text, meaning never conveyed by colour alone, no logins or jargon.
- **Four languages** — English, French, Spanish, Simplified Chinese. The *entire* interface is localized, not just the AI output.
- **Read-aloud** — built-in text-to-speech that picks the nicest available system voice.
- **Privacy by design** — no accounts, no database, no personal data stored.

---

## How it works

DeClear runs the same request through one interface with **two interchangeable providers**:

- **Demo mode** — deterministic, offline, no AI. Hand-written results for the built-in examples. This is the reliable fallback that makes the demo impossible to break.
- **AI mode (Google Gemini)** — explains any pasted message, in the chosen language, via a serverless backend. Requires explicit user consent before any text leaves the device.

Both providers return the **same structured result** (title, explanation, actions, dates, urgency, uncertainties, optional suggested reply), so the UI never changes when the engine does.

### Source-grounding (anti-hallucination)
The AI must quote the original message for every action and date it reports. The server then **verifies those quotes actually appear** in the message; anything it can't trace is excluded or flagged as uncertain. The AI can only tag an action as "guidable" using a task from a fixed, server-validated catalog — so it can never promise a walkthrough that doesn't exist.

### Resilience
Automatic retry on transient AI failures (HTTP 503 / timeouts), graceful fallback to scripted guidance, and Demo mode as the ultimate safety net.

---

## Tech stack

| Area | Tool |
| --- | --- |
| Language | JavaScript (throughout) |
| UI | React 19 |
| Build / dev server | Vite |
| Backend | Node.js serverless functions on Vercel (`/api/explain`, `/api/guide`) |
| AI | Google Gemini API (free tier, Flash model) |
| Browser APIs | `localStorage` (preferences), `speechSynthesis` (read-aloud) |
| i18n | Lightweight, dependency-free dictionary system with English fallback |
| Quality | ESLint, Vitest + Testing Library (jsdom) |

No runtime dependencies beyond React. No paid services.

---

## Project structure

```
api/
  explain.js            # serverless route: explain a message (holds Gemini key)
  guide.js              # serverless route: step-by-step guidance
  _lib/                 # Gemini helpers, guidance helper, rate limiting
src/
  components/           # React UI (stages, cards, guidance flow, settings…)
  services/             # notificationProcessor, providers (demo + gemini), schemas
  data/                 # sample notifications, guidance tasks, settings options
  i18n/                 # en / fr / es / zh-CN dictionaries + translation helper
  platform/             # speech (TTS), image helpers
  storage/              # localStorage settings
docs/                   # development journal / changelog
```

---

## Getting started

### Prerequisites
- Node.js 18+ and npm

### Install
```bash
npm install
```

### Run locally (Demo mode)
```bash
npm run dev
```
Open the printed local URL. Demo mode works fully offline — no API key needed.

### Run with live AI locally
The `/api` routes are serverless functions, so plain `npm run dev` does **not** run them. Use the Vercel CLI:
```bash
npm i -g vercel
vercel dev
```
…with the environment variables below set in a gitignored `.env.local` (see `.env.example`).

### Scripts
| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server (live preview) |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the test suite (Vitest) |

---

## Environment variables (AI mode only)

Set these **server-side** (in Vercel, or a local `.env.local`). They must **not** be prefixed with `VITE_`, which would leak them into the browser bundle.

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Your Google AI Studio API key (free tier; no billing required) |
| `GEMINI_MODEL` | The exact free-tier Gemini model id from your account (e.g. a `gemini-*-flash`) |

If these are missing, the app returns a clear "not configured" message and Demo mode still works.

---

## Security & privacy

DeClear's strongest protection is the data it **doesn't** collect.

- **Data handled:** accessibility preferences (language, detail level, read-aloud) stored only in the browser; the message you choose to explain (sent to Gemini only in AI mode, after explicit consent); an optional "I'm stuck" screenshot used for a single request and never stored.
- **Not handled:** no names, accounts, logins, location, contacts, analytics, tracking, or message history.
- **API key** lives only in server-side environment variables, used inside the serverless functions — never in the browser, the URL, logs, or git.
- **Explicit consent** gates any transmission to the AI; Demo mode transmits nothing.
- **No accounts, no database** — nothing to breach or tamper with; no user IDs in the URL.
- **Abuse limits:** input-size limits, request timeouts, output-token caps, best-effort rate limiting, and a hard billing cap so abuse fails closed rather than costing money.

**Known limitation:** rate limiting is in-memory per serverless instance (best-effort). A future improvement is a shared, persistent limiter (e.g. Redis/Upstash) for a true global request cap.

---

## Accessibility notes

Designed to the project's accessibility principles: large readable type, high contrast, text + shape (never colour alone) for urgency and uncertainty, clear button labels, focus moved to each stage heading, `aria-live` announcements, one task per screen, and no login barrier. Full WCAG conformance requires manual testing with assistive technology and expert review; the key flows were designed and tested against these principles.

---

## What's next

- **All-platform + direct notification receiving** — run on phone/tablet/computer and offer to explain notifications directly, removing copy-and-paste.
- **A growing library of guided walkthroughs** — video calls, online banking, booking appointments (each honest about what the user does themselves).
- **Optional trusted-family feature** — with the user's permission, a relative can add walkthroughs or check in — keeping older users independent, not supervised.

The principle won't change: **DeClear guides, it never takes over.**

---

## Honest limitations

- A web app cannot see or control native phone apps, so guidance is instructions the user follows themselves — by design, not pretence.
- Read-aloud quality depends on the voices installed on the user's device; some devices lack Spanish or Chinese voices, which DeClear detects and communicates gracefully.
- Demo-mode explanations for Spanish and Chinese fall back to English for the built-in samples; AI mode generates in all four languages.

---

*Built with care for older adults — so they can use technology on their own, with dignity.*
