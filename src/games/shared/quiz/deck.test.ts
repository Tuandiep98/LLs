import { describe, expect, it } from "vitest";
import { concepts, conceptsFor } from "@/content";
import { seededRng } from "@/lib/core/random";
import { buildDeck, buildOptions } from "./deck";

const all = conceptsFor("en", "vi");

describe("deck", () => {
  it("builds a deck of the requested size without duplicates", () => {
    const deck = buildDeck(all, 10, [], seededRng(1));
    expect(deck).toHaveLength(10);
    expect(new Set(deck.map((c) => c.id)).size).toBe(10);
  });

  it("puts review words in the deck first", () => {
    const review = ["cat", "dog", "apple"];
    const deck = buildDeck(all, 10, review, seededRng(2));
    for (const id of review) expect(deck.map((c) => c.id)).toContain(id);
  });

  it("builds 4 options with the answer, same topic, and no duplicate texts", () => {
    for (const target of concepts) {
      const options = buildOptions(target, all, "en", 4, seededRng(3));
      expect(options).toHaveLength(4);
      expect(options).toContain(target.id);
      const texts = options.map((id) => all.find((c) => c.id === id)!.terms.en!.text);
      expect(new Set(texts).size).toBe(4);
      const sameTopic = options.filter((id) => all.find((c) => c.id === id)!.topic === target.topic);
      expect(sameTopic.length).toBe(4);
    }
  });
});
