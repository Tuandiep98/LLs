import { describe, expect, it } from "vitest";
import { dayStreak } from "../achievements";
import { applyAnswer, emptyProgress, isUnlocked, needsReview } from "./leitner";

const DAY = 86_400_000;

describe("leitner", () => {
  it("wrong answers go to box 1 and need review", () => {
    const p = applyAnswer(emptyProgress("en", "cat"), false, 1000);
    expect(p.box).toBe(1);
    expect(needsReview(p, 1000)).toBe(true);
    expect(isUnlocked(p)).toBe(false);
  });

  it("correct answers move up, unlock the sticker, and leave review", () => {
    let p = applyAnswer(emptyProgress("en", "cat"), false, 0);
    p = applyAnswer(p, true, 0);
    expect(p.box).toBe(2);
    expect(isUnlocked(p)).toBe(true);
    expect(needsReview(p, 0)).toBe(false);
    expect(needsReview(p, 2 * DAY)).toBe(true);
  });

  it("counts consecutive play days", () => {
    const now = new Date(2026, 8, 28, 12).getTime();
    expect(dayStreak([now, now - DAY, now - 2 * DAY], now)).toBe(3);
    expect(dayStreak([now - DAY, now - 2 * DAY], now)).toBe(2);
    expect(dayStreak([now - 3 * DAY], now)).toBe(0);
  });
});
