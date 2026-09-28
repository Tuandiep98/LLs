import { describe, expect, it } from "vitest";
import { concepts } from "@/content";
import { seededRng } from "@/lib/core/random";
import { pickDistinct } from "../shared/quiz/deck";
import { createMemory, memoryStars, memorySummary, reduceMemory, type MemoryState } from "./engine";

const indexOf = (s: MemoryState, id: string, nth = 0) =>
  s.cards.map((c, i) => (c.conceptId === id ? i : -1)).filter((i) => i >= 0)[nth];

describe("memory match engine", () => {
  it("creates two cards per word; words mode mixes picture and word faces", () => {
    const s = createMemory(["cat", "dog"], "words", seededRng(1));
    expect(s.cards).toHaveLength(4);
    const cat = s.cards.filter((c) => c.conceptId === "cat").map((c) => c.face).sort();
    expect(cat).toEqual(["picture", "word"]);
    expect(createMemory(["cat"], "pictures").cards.every((c) => c.face === "picture")).toBe(true);
  });

  it("keeps a matching pair and finishes when all pairs are found", () => {
    let s = createMemory(["cat", "dog"], "pictures", seededRng(2));
    s = reduceMemory(s, { type: "flip", index: indexOf(s, "cat") });
    s = reduceMemory(s, { type: "flip", index: indexOf(s, "cat", 1) });
    expect(s.matched).toEqual(["cat"]);
    expect(s.open).toEqual([]);
    expect(s.phase).toBe("playing");
    s = reduceMemory(s, { type: "flip", index: indexOf(s, "dog") });
    s = reduceMemory(s, { type: "flip", index: indexOf(s, "dog", 1) });
    expect(s.phase).toBe("done");
    expect(s.moves).toBe(2);
    expect(s.bestStreak).toBe(2);
    expect(s.score).toBe(100 + 120);
  });

  it("waits on a wrong pair, blocks more flips, then hides them", () => {
    let s = createMemory(["cat", "dog", "fish"], "pictures", seededRng(3));
    s = reduceMemory(s, { type: "flip", index: indexOf(s, "cat") });
    s = reduceMemory(s, { type: "flip", index: indexOf(s, "dog") });
    expect(s.phase).toBe("checking");
    expect(s.missed.sort()).toEqual(["cat", "dog"]);
    const blocked = reduceMemory(s, { type: "flip", index: indexOf(s, "fish") });
    expect(blocked).toBe(s);
    s = reduceMemory(s, { type: "hide" });
    expect(s).toMatchObject({ phase: "playing", open: [], mismatches: 1, streak: 0 });
  });

  it("ignores flipping the same or a matched card", () => {
    let s = createMemory(["cat", "dog"], "pictures", seededRng(4));
    const i = indexOf(s, "cat");
    s = reduceMemory(s, { type: "flip", index: i });
    expect(reduceMemory(s, { type: "flip", index: i })).toBe(s);
    s = reduceMemory(s, { type: "flip", index: indexOf(s, "cat", 1) });
    expect(reduceMemory(s, { type: "flip", index: i })).toBe(s);
  });

  it("gives stars by number of mistakes and summarises", () => {
    expect(memoryStars(0, 4)).toBe(3);
    expect(memoryStars(4, 4)).toBe(2);
    expect(memoryStars(9, 4)).toBe(1);
    const s = createMemory(["cat"], "pictures");
    expect(memorySummary(s)).toMatchObject({ total: 1, correct: 0, moves: 0 });
  });

  it("never picks two words that read the same", () => {
    for (let seed = 0; seed < 30; seed++) {
      const picked = pickDistinct(concepts, 20, "en", [], seededRng(seed));
      const texts = picked.map((c) => c.terms.en!.text);
      expect(new Set(texts).size).toBe(texts.length);
    }
  });
});
