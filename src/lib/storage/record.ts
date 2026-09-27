"use client";

import { concepts } from "@/content";
import { achievements, dayStreak, type Stats } from "../achievements";
import { applyAnswer, emptyProgress, isUnlocked } from "../core/leitner";
import { db, type SessionRecord } from "./db";

export type AnswerRecord = { conceptId: string; correct: boolean };

export type SessionOutcome = {
  newStickers: string[];
  newAchievements: string[];
};

/**
 * Saves a finished session. Answers (play mode only) update the review boxes
 * and sticker collection; then badges are re-checked.
 */
export async function recordSession(
  session: Omit<SessionRecord, "id">,
  answers: AnswerRecord[],
): Promise<SessionOutcome> {
  const now = session.endedAt;
  return db.transaction("rw", db.sessions, db.progress, db.achievements, async () => {
    await db.sessions.add(session);

    const newStickers: string[] = [];
    for (const a of answers) {
      const key = `${session.learn}:${a.conceptId}`;
      const prev = (await db.progress.get(key)) ?? emptyProgress(session.learn, a.conceptId);
      const next = applyAnswer(prev, a.correct, now);
      if (!isUnlocked(prev) && isUnlocked(next)) newStickers.push(a.conceptId);
      await db.progress.put(next);
    }

    const stats = await computeStats(session.learn, now, session);
    const owned = new Set((await db.achievements.toArray()).map((a) => a.id));
    const newAchievements = achievements
      .filter((a) => !owned.has(a.id) && a.check(stats))
      .map((a) => a.id);
    await db.achievements.bulkPut(newAchievements.map((id) => ({ id, unlockedAt: now })));

    return { newStickers, newAchievements };
  });
}

async function computeStats(learn: string, now: number, last: Omit<SessionRecord, "id">): Promise<Stats> {
  const sessions = await db.sessions.toArray();
  const progress = await db.progress.where("learn").equals(learn).toArray();
  const unlocked = new Set(progress.filter(isUnlocked).map((p) => p.conceptId));
  const byTopic = new Map<string, string[]>();
  for (const c of concepts) byTopic.set(c.topic, [...(byTopic.get(c.topic) ?? []), c.id]);
  const topicsCompleted = [...byTopic.values()].filter((ids) => ids.every((id) => unlocked.has(id))).length;

  return {
    sessions: sessions.length,
    lastSession: last,
    bestStreakEver: Math.max(0, ...sessions.map((s) => s.bestStreak)),
    stickers: unlocked.size,
    topicsCompleted,
    dayStreak: dayStreak(
      sessions.map((s) => s.startedAt),
      now,
    ),
  };
}
