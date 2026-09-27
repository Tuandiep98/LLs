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

**Other games:**

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

Add entries to `src/content/data/concepts.json`. For Fluent Emoji images set
`"source": "fluent-emoji", "sourceRef": "<Fluent folder name>"` and run `npm run images`.
`npm test` checks translations and image files. Later an AI job can generate entries in the
same format (validated by `schema.ts`) and open a PR for review.

## Before release

- Replace `CONTACT_EMAIL` in `src/content/legal/types.ts`.
- Have Privacy Policy and Terms reviewed by a lawyer (children's product).
- Paid plan texts are prepared in `paidSections`; enable with `PAID_PLANS_ENABLED`.
