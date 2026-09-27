// Leitner boxes: words answered wrong go back to box 1 and come up again soon;
// words answered right move up and are reviewed less often.
export type WordProgress = {
  /** `${learn}:${conceptId}` */
  key: string;
  learn: string;
  conceptId: string;
  box: number;
  correct: number;
  wrong: number;
  lastSeen: number;
  due: number;
};

export const MAX_BOX = 5;
const DAY = 24 * 60 * 60 * 1000;
const INTERVAL_DAYS = [0, 0, 1, 3, 7, 14];

export function emptyProgress(learn: string, conceptId: string): WordProgress {
  return { key: `${learn}:${conceptId}`, learn, conceptId, box: 0, correct: 0, wrong: 0, lastSeen: 0, due: 0 };
}

export function applyAnswer(p: WordProgress, correct: boolean, now: number): WordProgress {
  const box = correct ? Math.min(MAX_BOX, p.box + 1) : 1;
  return {
    ...p,
    box,
    correct: p.correct + (correct ? 1 : 0),
    wrong: p.wrong + (correct ? 0 : 1),
    lastSeen: now,
    due: now + INTERVAL_DAYS[box] * DAY,
  };
}

/** Words to practice: answered at least once, not mastered, and due. */
export function needsReview(p: WordProgress, now: number): boolean {
  return p.box >= 1 && p.box < MAX_BOX && p.due <= now && (p.box === 1 || p.wrong > 0);
}

/** A sticker is unlocked the first time the word is answered correctly. */
export function isUnlocked(p: WordProgress | undefined): boolean {
  return !!p && p.correct > 0;
}
