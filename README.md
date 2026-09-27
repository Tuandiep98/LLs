# LLs – Play & Learn Languages

Simple mini games that help kids (5+) learn words in another language with pictures and sounds.
Mobile/tablet first, light/dark auto theme, no accounts, all progress stored on the device.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (game engine, deck, review boxes, content, messages)
npm run lint
npm run build        # normal build (Node host, e.g. Vercel)
npm run build:pages  # static build for GitHub Pages → out/ (served under /LLs)
```

## Deploy

**GitHub Pages (current):** every push to `main` runs `.github/workflows/pages.yml`
(lint → test → static build → deploy) to https://tuandiep98.github.io/LLs/.
Static hosting has no server, so `/` detects the language in the browser (`src/app/page.tsx`)
and the CSP is a `<meta>` tag instead of a header.

**Vercel (later):** import the repo in Vercel, no env vars needed. The language-detecting proxy
and full security headers are used automatically.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · next-intl · Zustand · Dexie (IndexedDB) · Zod · Motion · canvas-confetti · Vitest

## Structure

```
messages/<locale>.json          UI texts (en, vi, zh-Hans, ja)
src/i18n/                       locales, routing, locale detection (proxy.ts)
src/content/
  data/topics.json              topics
  data/concepts.json            words: id, topic, images, translations per locale
  schema.ts                     Zod schema (content is validated at build)
  legal/                        Privacy Policy / Terms (+ drafts for paid plans)
src/games/
  registry.ts                   list of games shown on the home page
  types.ts                      GameManifest
  shared/                       countdown, sticker, confetti – reusable by every game
  shared/quiz/                  shared quiz flow for word games
    engine.ts                   pure state machine (tested)
    deck.ts                     deck + answer options (tested)
    useQuizSession.ts           timer, feedback, auto-advance, finishing
    QuizFlow / Setup / Summary / QuizChrome.tsx
  picture-guess/                game 1: see a picture, pick the word (watch + play)
  listen-pick/                  game 2: hear a word, pick the picture
  true-false/                   game 3: picture + word, tap ✓ or ✗
  balloon-pop/                  game 4: hear a word, pop the balloon with its picture
  memory-match/                 game 5: flip cards, find pairs (picture–picture or picture–word)
  shared/SetupParts.tsx         topic picker, mode cards, chips, page shell (any game)
  shared/Summary.tsx            end screen + saving (any game)
src/lib/
  settings.ts                   settings (localStorage) + theme
  storage/                      IndexedDB: sessions, word progress, badges
  core/leitner.ts               review boxes ("words to practice")
  achievements.ts               badges
  audio/                        text-to-speech + synthesized sound effects
public/content/images/          sticker images (Fluent Emoji, MIT)
```

## Add a mini game

**Word quiz games** (like Picture Guess and Listen & Pick) reuse `src/games/shared/quiz/`:
the flow (language → setup → play → summary), engine, deck, scoring, countdown, reveal feedback
and saving are shared. A new quiz game is a manifest + one screen component using
`useQuizSession()` + a one-line `<QuizFlow game={...} Screen={...} />` wrapper.

**Other games** (like Memory Match) build their own board and reuse `SetupParts`,
`Summary`, `QuitModal` and the audio/confetti helpers:

1. Create `src/games/<id>/` with `manifest.ts`, a pure `engine.ts` (+ tests) and the UI.
2. Add the manifest to `src/games/registry.ts`.
3. Add `games.<id>.name/desc` to every `messages/*.json`.
4. Add the page `src/app/[locale]/games/<id>/page.tsx`.
5. Save results with `recordSession()` so history, stickers and badges work automatically.

## Add a language

1. Add the code to `locales` and `localeMeta` in `src/i18n/config.ts` (BCP 47 code, e.g. `ko`).
2. Add `messages/<code>.json` (the test checks that all keys exist).
3. Add `terms.<code>` to the words in `concepts.json` and `names.<code>` in `topics.json`.

## Add words

Add entries to `src/content/data/concepts.json`. Pictures come from the allowed Fluent Emoji
catalog (`npm run content:catalog -- --search <word>`); set `"sourceRef"` to the catalog name and
run `npm run images`. `npm run content:check` is the content safety gate (translations, blocklist,
catalog images, duplicates, topic sizes, daily limit); it also runs in `npm test` and before deploy.

**Nightly content routine:** a Claude Code routine runs every night at 02:00 (Asia/Ho_Chi_Minh),
follows [`docs/content-routine.md`](docs/content-routine.md), adds 25–30 seasonal/core words,
passes all checks and merges automatically. Manage it at https://claude.ai/code/routines.

Content data files:

- `concepts.json` / `topics.json` — words and topics (`featured` dates show a seasonal banner)
- `calendar.json` — seasons and holidays the routine plans around, plus core topics
- `blocklist.json` — banned words (4 languages) and banned/limited image groups
- `fluent-catalog.json` — allowed Fluent Emoji images (rebuild: `node scripts/build-fluent-catalog.mjs`)

## Before release

- Replace `CONTACT_EMAIL` in `src/content/legal/types.ts`.
- Have Privacy Policy and Terms reviewed by a lawyer (children's product).
- Paid plan texts are prepared in `paidSections`; enable with `PAID_PLANS_ENABLED`.
