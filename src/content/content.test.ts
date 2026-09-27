import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { locales } from "@/i18n/config";
import { concepts, topics } from ".";

describe("content", () => {
  it("has unique ids and valid topics", () => {
    expect(new Set(concepts.map((c) => c.id)).size).toBe(concepts.length);
    const topicIds = new Set(topics.map((t) => t.id));
    for (const c of concepts) expect(topicIds.has(c.topic)).toBe(true);
  });

  it("translates every concept into every supported language", () => {
    for (const c of concepts) for (const l of locales) expect(c.terms[l]?.text, `${c.id}/${l}`).toBeTruthy();
  });

  it("has an image file for every concept", () => {
    for (const c of concepts)
      for (const img of c.images) expect(fs.existsSync(path.join("public", img.src)), img.src).toBe(true);
  });
});

describe("messages", () => {
  const keys = (obj: object, prefix = ""): string[] =>
    Object.entries(obj).flatMap(([k, v]) => (typeof v === "object" ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
  const load = (l: string) => JSON.parse(fs.readFileSync(`messages/${l}.json`, "utf8"));

  it("every locale has the same keys as English", () => {
    const en = keys(load("en")).sort();
    for (const l of locales) expect(keys(load(l)).sort(), l).toEqual(en);
  });
});
