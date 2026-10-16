import { describe, expect, it } from "vitest";
import type { Badge } from "@/content/schema";
import { badgeEarned, type Stats } from "./achievements";

const stats: Stats = {
  sessions: 3,
  lastSession: { mode: "play", total: 5, correct: 5, bestStreak: 5 },
  bestStreakEver: 5,
  stickers: 12,
  topicStickers: { animals: 6 },
  topicsCompleted: 0,
  dayStreak: 2,
};

const badge = (rule: Badge["rule"]): Badge => ({ id: "x", icon: "⭐", rule, names: {} as Badge["names"], descs: {} as Badge["descs"] });

describe("badgeEarned", () => {
  it("compares each rule with its stat", () => {
    expect(badgeEarned(badge({ type: "sessions", min: 3 }), stats)).toBe(true);
    expect(badgeEarned(badge({ type: "sessions", min: 4 }), stats)).toBe(false);
    expect(badgeEarned(badge({ type: "stickers", min: 10 }), stats)).toBe(true);
    expect(badgeEarned(badge({ type: "dayStreak", min: 3 }), stats)).toBe(false);
    expect(badgeEarned(badge({ type: "topicsCompleted", min: 1 }), stats)).toBe(false);
  });

  it("counts stickers per topic", () => {
    expect(badgeEarned(badge({ type: "topicStickers", topic: "animals", min: 6 }), stats)).toBe(true);
    expect(badgeEarned(badge({ type: "topicStickers", topic: "food", min: 4 }), stats)).toBe(false);
  });

  it("needs a perfect played game of at least `min` words", () => {
    expect(badgeEarned(badge({ type: "perfect", min: 5 }), stats)).toBe(true);
    expect(badgeEarned(badge({ type: "perfect", min: 10 }), stats)).toBe(false);
    const watched = { ...stats, lastSession: { ...stats.lastSession!, mode: "watch" } };
    expect(badgeEarned(badge({ type: "perfect", min: 5 }), watched)).toBe(false);
  });
});
