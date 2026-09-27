import { describe, expect, it } from "vitest";
import { concepts, conceptsFor } from "@/content";
import { seededRng } from "@/lib/core/random";
import { buildDeck, buildOptions, buildTrueFalseRounds, trueFalseChoice } from "./deck";

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

describe("true or false rounds", () => {
  it("shows either the answer or a same-topic distractor, and maps yes/no to options", () => {
    const deck = buildDeck(all, 15, [], seededRng(5));
    const rounds = buildTrueFalseRounds(deck, all, "en", seededRng(6));
    let shownRight = 0;
    for (const r of rounds) {
      expect(r.options).toHaveLength(2);
      expect(r.options).toContain(r.conceptId);
      expect(r.options).toContain(r.shown);
      const [a, b] = r.options.map((id) => all.find((c) => c.id === id)!);
      expect(a.topic).toBe(b.topic);
      if (r.shown === r.conceptId) shownRight++;
      // "yes" is right exactly when the shown word is the answer; "no" otherwise.
      expect(trueFalseChoice(r, true) === r.conceptId).toBe(r.shown === r.conceptId);
      expect(trueFalseChoice(r, false) === r.conceptId).toBe(r.shown !== r.conceptId);
    }
    expect(shownRight).toBeGreaterThan(0);
    expect(shownRight).toBeLessThan(rounds.length);
  });
});
