"use client";

import Dexie, { type EntityTable } from "dexie";
import type { WordProgress } from "../core/leitner";

export type SessionRecord = {
  id?: number;
  gameId: string;
  mode: string;
  learn: string;
  native: string;
  topic: string | null;
  startedAt: number;
  endedAt: number;
  total: number;
  correct: number;
  score: number;
  stars: number;
  bestStreak: number;
  wrongIds: string[];
};

export type AchievementRecord = { id: string; unlockedAt: number };

// Local-only database (IndexedDB) for the single default profile.
export const db = new Dexie("lls") as Dexie & {
  sessions: EntityTable<SessionRecord, "id">;
  progress: EntityTable<WordProgress, "key">;
  achievements: EntityTable<AchievementRecord, "id">;
};

db.version(1).stores({
  sessions: "++id, gameId, learn, startedAt",
  progress: "key, learn, conceptId, due",
  achievements: "id",
});

export async function clearAllData() {
  await Promise.all([db.sessions.clear(), db.progress.clear(), db.achievements.clear()]);
}
