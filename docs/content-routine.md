# Nightly content routine

Instructions for the Claude routine that enriches LLs learning content every night
(02:00 Asia/Ho_Chi_Minh). You start with no context: read this whole file first and follow it exactly.

LLs is a language-learning site for **children aged 3–8**. Every word you add is shown to small
kids with a picture and read aloud. Changes you make are **merged and deployed automatically**,
so you are the only reviewer. When in doubt, leave a word out: fewer good words beat one bad word.

## Goal

Add **25–30 new words** per night (never more than 30) with pictures and translations in all
supported languages: `en`, `vi`, `zh-Hans`, `ja`.

## Hard rules

1. Only change these files:
   - `src/content/data/concepts.json`
   - `src/content/data/topics.json`
   - `public/content/images/*.png` (downloaded by `npm run images`)
2. Never edit tests, the blocklist, the image catalog, scripts, app code or this file, and never weaken a check.
   If a check fails, fix or remove the word.
3. Content must be safe and suitable for young children. Never add:
   violence, weapons, blood, death, scary or horror things, alcohol, coffee, tobacco, drugs, medicine,
   gambling, romance or kissing, body-shaming or insults, politics, religion, national flags,
   brands, trademarks, products, celebrities, or characters from films, games, books or cartoons.
   "Trends" are **seasons and holidays only** (e.g. moon cake for Mid-Autumn, pumpkin for Halloween)
   — never a named film, toy, show or person.
4. Images: only Fluent Emoji names from the allowed catalog (`npm run content:catalog`), and only ones
   not used yet. The picture must clearly show the word to a 5-year-old. No image → no word.
5. Do not copy text from websites. Web search is only for ideas about what a season means for kids.

## Steps

### 1. Prepare

```bash
npm ci
TZ=Asia/Ho_Chi_Minh date +%F      # "today" for this run
git log --oneline -5
```

If there is an open pull request from a `content/` branch (check with `gh pr list` if available),
stop and report it instead of adding more — it means an earlier run did not finish.

### 2. Choose themes

Read `src/content/data/calendar.json`, `topics.json` and `concepts.json`.

- **Seasonal (preferred when available):** find events whose window overlaps the next 30 days
  (for `dates` windows use the current year's entry). Skip events that already have words tagged
  `season:<event-id>` added this year. Use its `themes` as inspiration; you may web-search
  "<event> vocabulary for kids" for ideas. Aim for 10–15 seasonal words.
- **Core curriculum:** fill the rest from `coreTopics`, choosing the topics with the fewest words.
  A core topic may map to an existing topic (e.g. `animals`) or become a new topic.

Count words per topic with:

```bash
node -e 'const c=require("./src/content/data/concepts.json");const m={};for(const x of c)m[x.topic]=(m[x.topic]||0)+1;console.log(m)'
```

### 3. Find pictures

```bash
npm run content:catalog -- --search moon          # search unused images by name/keyword
npm run content:catalog -- --group "Animals & Nature"
```

Use the exact `name` shown as `sourceRef`. Skip anything ambiguous (e.g. a shape that could be
several things) or anything that looks scary.

### 4. Write the words

Append to `src/content/data/concepts.json`, keeping the same formatting (2-space JSON):

```json
{
  "id": "moon-cake",
  "topic": "mid-autumn",
  "pos": "noun",
  "tags": ["mid-autumn", "season:mid-autumn"],
  "images": [
    {
      "src": "/content/images/moon-cake.png",
      "kind": "sticker",
      "source": "fluent-emoji",
      "sourceRef": "Moon cake"
    }
  ],
  "terms": {
    "en": { "text": "moon cake" },
    "vi": { "text": "bánh trung thu" },
    "zh-Hans": { "text": "月饼", "reading": "yuèbǐng" },
    "ja": { "text": "げっぺい" }
  },
  "addedAt": "2026-09-29",
  "origin": "ai",
  "level": "easy"
}
```

- `id`: lowercase kebab-case, unique; the image file is `/content/images/<id>.png`.
- `pos`: `noun`, `verb`, `adjective` or `phrase`. `level`: `easy` (everyday words), `medium`, `hard`.
- `tags`: the topic id, plus `season:<event-id>` for seasonal words.
- `addedAt`: today (Asia/Ho_Chi_Minh). `origin`: always `"ai"`.

**Translation quality** (all four languages are required):

- `en`: simple, common, lowercase (except proper nouns, which you should avoid anyway), singular
  nouns, verbs in base form ("swim", "ride a bike").
- `vi`: natural words a Vietnamese parent says to a child, with the usual classifier like the
  existing data ("con mèo", "quả táo", "cái ghế"; colors as "màu đỏ").
- `zh-Hans`: Simplified Chinese; `reading` = pinyin **with tone marks** (required).
- `ja`: prefer hiragana/katakana a child can read; if you use kanji, add the kana `reading`.
- Each word must mean the same thing in all four languages and match the picture.
- No word may repeat inside a topic in any language. Max 30 characters.

**New topics** (at most 2 per night) go in `src/content/data/topics.json`:

```json
{
  "id": "mid-autumn",
  "icon": "🥮",
  "color": "yellow",
  "names": {
    "en": "Mid-Autumn",
    "vi": "Trung thu",
    "zh-Hans": "中秋节",
    "ja": "おつきみ"
  },
  "featured": { "from": "2027-08-31", "to": "2027-09-16" }
}
```

- `color`: one of `orange`, `red`, `sky`, `green`, `grape`, `yellow`.
- `featured` only for seasonal topics: use the event's window for the current year. It shows the
  topic as "This season" on the home page. When a seasonal topic already exists (e.g. next year),
  add words to it and update `featured` to the new window.
- A topic needs at least 4 words (games need 4 answer choices).

### 5. Check

```bash
npm run images           # download pictures
npm run content:check    # content safety gate
npm run lint
npm test
npm run build:pages
git status               # only the allowed files may be changed
```

If anything fails, fix or remove the offending words and run all checks again.

### 6. Review yourself

For **every** new word, answer yes to all of these, or remove it:

- Is it safe and pleasant for a 3–8 year old, in every language?
- Does the picture clearly show it?
- Are all four translations correct, natural and the same meaning?
- Is it free of brands, characters, religion and politics?

### 7. Publish

```bash
git checkout -b content/<today>
git add src/content/data public/content/images
git commit -m "Content: +<N> words (<themes>)"
git push -u origin content/<today>
```

Open a pull request titled `Content: +<N> words (<themes>)`. The description lists every word
as a table (id, en, vi, zh-Hans, ja, image, topic) plus the themes chosen and why. Then merge it
(squash) and delete the branch — all checks have passed and merging deploys the site.

If you cannot open or merge a pull request (no GitHub CLI or permission), rebase on the latest
`main`, run the checks again and push the commit straight to `main`. The deploy workflow runs
lint, tests and the build once more before publishing.

### 8. Report

Finish with a short report: date, themes, number of words added, new topics, the
pull request or commit link, unused catalog images left, and anything you skipped and why.
