import { describe, expect, it } from "vitest";
import { seededRng } from "@/lib/core/random";
import { connectStars, connectSummary, createConnect, reduceConnect, type ConnectState } from "./engine";

const ids = ["cat", "dog", "fish", "bird"];
const leftOf = (s: ConnectState, id: string) => s.leftIds.indexOf(id);
const rightOf = (s: ConnectState, id: string) => s.rightIds.indexOf(id);
const run = (s: ConnectState, ...events: Parameters<typeof reduceConnect>[1][]) => events.reduce(reduceConnect, s);

describe("connect pairs engine", () => {
  it("never lines up the same concept at the same left/right position", () => {
    for (let seed = 0; seed < 40; seed++) {
      const s = createConnect(ids, seededRng(seed));
      for (let i = 0; i < ids.length; i++) expect(s.leftIds[i]).not.toBe(s.rightIds[i]);
    }
  });

  it("selects a left card, then matches it against the right card", () => {
    const s0 = createConnect(ids, seededRng(1));
    const s1 = run(s0, { type: "tapLeft", index: leftOf(s0, "cat") });
    expect(s1.selectedLeft).toBe(leftOf(s0, "cat"));
    const s2 = run(s1, { type: "tapRight", index: rightOf(s1, "cat") });
    expect(s2.matched).toEqual(["cat"]);
    expect(s2.selectedLeft).toBeNull();
    expect(s2.score).toBe(100);
  });

  it("ignores tapping right before a left card is selected, and re-tapping a matched left card", () => {
    const s0 = createConnect(ids, seededRng(2));
    expect(run(s0, { type: "tapRight", index: 0 })).toBe(s0);
    const matched = run(
      s0,
      { type: "tapLeft", index: leftOf(s0, "cat") },
      { type: "tapRight", index: rightOf(s0, "cat") },
    );
    expect(run(matched, { type: "tapLeft", index: leftOf(s0, "cat") })).toBe(matched);
  });

  it("flags a wrong pair, blocks further taps until hide, and tracks it for review", () => {
    const s0 = createConnect(ids, seededRng(3));
    const wrongRight = rightOf(s0, "dog") !== leftOf(s0, "cat") ? rightOf(s0, "dog") : rightOf(s0, "fish");
    const s1 = run(s0, { type: "tapLeft", index: leftOf(s0, "cat") }, { type: "tapRight", index: wrongRight });
    expect(s1.phase).toBe("wrong");
    expect(s1.mistakes).toBe(1);
    expect(s1.missed.sort()).toEqual(["cat", s0.rightIds[wrongRight]].sort());
    expect(run(s1, { type: "tapLeft", index: 0 })).toBe(s1);
    const s2 = run(s1, { type: "hide" });
    expect(s2).toMatchObject({ phase: "playing", wrong: null, selectedLeft: null });
  });

  it("finishes once every pair is matched, scoring streak bonuses", () => {
    let s = createConnect(ids, seededRng(4));
    for (const id of ids) {
      s = run(s, { type: "tapLeft", index: leftOf(s, id) }, { type: "tapRight", index: rightOf(s, id) });
    }
    expect(s.phase).toBe("done");
    expect(s.bestStreak).toBe(4);
    expect(connectSummary(s)).toMatchObject({ total: 4, correct: 4, moves: 4 });
  });

  it("awards stars by number of mistakes", () => {
    expect(connectStars(0, 4)).toBe(3);
    expect(connectStars(2, 4)).toBe(3);
    expect(connectStars(4, 4)).toBe(2);
    expect(connectStars(9, 4)).toBe(1);
  });
});
