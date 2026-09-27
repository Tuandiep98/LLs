// Badges. Each check receives aggregate stats; add a badge by adding an entry.
export type Stats = {
  sessions: number;
  lastSession: { mode: string; total: number; correct: number; bestStreak: number } | null;
  bestStreakEver: number;
  stickers: number;
  topicsCompleted: number;
  dayStreak: number;
};

export type Achievement = { id: string; icon: string; check: (s: Stats) => boolean };

export const achievements: Achievement[] = [
  { id: "first-game", icon: "🎉", check: (s) => s.sessions >= 1 },
  {
    id: "perfect",
    icon: "🌟",
    check: (s) =>
      !!s.lastSession &&
      s.lastSession.mode === "play" &&
      s.lastSession.total >= 5 &&
      s.lastSession.correct === s.lastSession.total,
  },
  { id: "streak-5", icon: "🔥", check: (s) => s.bestStreakEver >= 5 },
  { id: "games-10", icon: "🏅", check: (s) => s.sessions >= 10 },
  { id: "stickers-10", icon: "📒", check: (s) => s.stickers >= 10 },
  { id: "stickers-30", icon: "📚", check: (s) => s.stickers >= 30 },
  { id: "topic-master", icon: "👑", check: (s) => s.topicsCompleted >= 1 },
  { id: "daily-3", icon: "📅", check: (s) => s.dayStreak >= 3 },
];

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
