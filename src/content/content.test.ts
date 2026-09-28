// Content safety gate. Runs in `npm test`, in the nightly content routine and before
// every deploy, so unsafe or broken content can never reach the site.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { games } from "@/games/registry";
import { locales } from "@/i18n/config";
import { concepts, inTopic, topics } from ".";
import blocklist from "./data/blocklist.json";
import calendarJson from "./data/calendar.json";
import catalogJson from "./data/fluent-catalog.json";
import { calendarSchema } from "./schema";

const MAX_TEXT_LENGTH = 30;
const MAX_NEW_PER_DAY = 30;
// ~370 bytes per word minified: ~3,000 words. Gzipped this is still ~200 KB.
const MAX_CONTENT_KB = 1200;

const catalog = new Set((catalogJson as { name: string }[]).map((e) => e.name));

function containsBlockedWord(text: string, locale: string): string | undefined {
  const words = (blocklist.words as Record<string, string[]>)[locale] ?? [];
  const lower = text.toLowerCase();
  const latin = locale === "en" || locale === "vi";
  return words.find((w) =>
    latin
      ? new RegExp(`(^|[^\\p{L}])${w}($|[^\\p{L}])`, "u").test(lower)
      : lower.includes(w),
  );
}

describe("content", () => {
  it("has unique ids and valid topics", () => {
    expect(new Set(concepts.map((c) => c.id)).size).toBe(concepts.length);
    expect(new Set(topics.map((t) => t.id)).size).toBe(topics.length);
    const topicIds = new Set(topics.map((t) => t.id));
    for (const c of concepts)
      expect(topicIds.has(c.topic), `${c.id} topic ${c.topic}`).toBe(true);
    for (const t of topics)
      expect(
        concepts.some((c) => c.topic === t.id),
        `empty topic ${t.id}`,
      ).toBe(true);
  });

  it("translates every concept into every supported language", () => {
    for (const c of concepts)
      for (const l of locales) {
        const text = c.terms[l]?.text ?? "";
        expect(text.trim(), `${c.id}/${l}`).toBeTruthy();
        expect(text.length, `${c.id}/${l} too long`).toBeLessThanOrEqual(
          MAX_TEXT_LENGTH,
        );
      }
  });

  it("gives Chinese words a pinyin reading", () => {
    for (const c of concepts)
      expect(c.terms["zh-Hans"]?.reading, `${c.id} pinyin`).toBeTruthy();
  });

  it("gives Japanese words a romaji reading", () => {
    for (const c of concepts)
      expect(c.terms.ja?.reading ?? "", `${c.id} romaji`).toMatch(/^[a-zāīūēō' ]+$/);
  });

  it("only lists existing topics in tags", () => {
    const topicIds = new Set(topics.map((t) => t.id));
    for (const c of concepts)
      for (const tag of c.tags)
        expect(tag.startsWith("season:") || topicIds.has(tag), `${c.id} tag ${tag}`).toBe(true);
  });

  // Every word ships to the browser with the app. Past this size, load content per topic instead.
  it(`keeps word data under ${MAX_CONTENT_KB} KB`, () => {
    const kb = JSON.stringify(concepts).length / 1024;
    expect(kb).toBeLessThan(MAX_CONTENT_KB);
  });

  it("never uses blocked words", () => {
    for (const c of concepts)
      for (const l of locales) {
        const hit = containsBlockedWord(c.terms[l]?.text ?? "", l);
        expect(hit, `${c.id}/${l} contains "${hit}"`).toBeUndefined();
      }
    for (const t of topics)
      for (const l of locales)
        expect(
          containsBlockedWord(t.names[l], l),
          `topic ${t.id}/${l}`,
        ).toBeUndefined();
  });

  it("only uses allowed catalog images, and every image file exists", () => {
    for (const c of concepts)
      for (const img of c.images) {
        if (img.source === "fluent-emoji")
          expect(
            catalog.has(img.sourceRef ?? ""),
            `${c.id}: ${img.sourceRef}`,
          ).toBe(true);
        expect(fs.existsSync(path.join("public", img.src)), img.src).toBe(true);
      }
  });

  it("does not repeat a word inside a topic", () => {
    for (const t of topics)
      for (const l of locales) {
        const texts = concepts
          .filter((c) => inTopic(c, t.id))
          .map((c) => c.terms[l]?.text.toLowerCase());
        const dupes = texts.filter((x, i) => texts.indexOf(x) !== i);
        expect(dupes, `${t.id}/${l}`).toEqual([]);
      }
  });

  it(`adds at most ${MAX_NEW_PER_DAY} words per day`, () => {
    const perDay = new Map<string, number>();
    for (const c of concepts)
      if (c.origin === "ai" && c.addedAt)
        perDay.set(c.addedAt, (perDay.get(c.addedAt) ?? 0) + 1);
    for (const [day, n] of perDay)
      expect(n, day).toBeLessThanOrEqual(MAX_NEW_PER_DAY);
  });

  it("has valid featured date ranges and calendar", () => {
    for (const t of topics)
      if (t.featured) expect(t.featured.from <= t.featured.to, t.id).toBe(true);
    expect(() => calendarSchema.parse(calendarJson)).not.toThrow();
  });
});

describe("messages", () => {
  const keys = (obj: object, prefix = ""): string[] =>
    Object.entries(obj).flatMap(([k, v]) =>
      typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
    );
  const load = (l: string) =>
    JSON.parse(fs.readFileSync(`messages/${l}.json`, "utf8"));

  it("every locale has the same keys as English", () => {
    const en = keys(load("en")).sort();
    for (const l of locales) expect(keys(load(l)).sort(), l).toEqual(en);
  });

  // Session history shows `modes.<mode>` for every saved game.
  it("names every game and game mode", () => {
    const en = new Set(keys(load("en")));
    for (const g of games) {
      expect(en.has(`games.${g.id}.name`), g.id).toBe(true);
      for (const m of g.modes) expect(en.has(`modes.${m}`), `${g.id} mode ${m}`).toBe(true);
    }
  });
});
