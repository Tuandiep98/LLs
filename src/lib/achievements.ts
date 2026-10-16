// Badges live in src/content/data/badges.json (the nightly content routine may add some);
// this file only decides when one is earned.
import type { Badge } from "@/content/schema";

export type Stats = {
  sessions: number;
  lastSession: { mode: string; total: number; correct: number; bestStreak: number } | null;
  bestStreakEver: number;
  stickers: number;
  /** Stickers per topic (a word counts for its main topic and its tagged topics). */
  topicStickers: Record<string, number>;
  topicsCompleted: number;
  dayStreak: number;
};

export function badgeEarned(badge: Badge, s: Stats): boolean {
  const rule = badge.rule;
  switch (rule.type) {
    case "sessions":
      return s.sessions >= rule.min;
    case "dayStreak":
      return s.dayStreak >= rule.min;
    case "bestStreak":
      return s.bestStreakEver >= rule.min;
    case "perfect":
      return (
        !!s.lastSession &&
        s.lastSession.mode === "play" &&
        s.lastSession.total >= rule.min &&
        s.lastSession.correct === s.lastSession.total
      );
    case "stickers":
      return s.stickers >= rule.min;
    case "topicsCompleted":
      return s.topicsCompleted >= rule.min;
    case "topicStickers":
      return (s.topicStickers[rule.topic] ?? 0) >= rule.min;
  }
}

function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** Consecutive days (ending today or yesterday) with at least one session. */
export function dayStreak(timestamps: number[], now: number): number {
  const days = new Set(timestamps.map(dayKey));
  const DAY = 24 * 60 * 60 * 1000;
  let cursor = days.has(dayKey(now)) ? now : now - DAY;
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor -= DAY;
  }
  return streak;
}
