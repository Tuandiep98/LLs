import type { Concept } from "@/content/schema";
import type { Locale } from "@/i18n/config";
import { shuffle, type Rng } from "@/lib/core/random";

// Connect Pairs: tap a picture on the left, then its matching word on the right.
//   playing --tapLeft--> playing (selects a picture)
//   playing --tapRight (match)--> playing | done
//   playing --tapRight (no match)--> wrong --hide--> playing

export const PAIR_OPTIONS = [4, 6] as const;
export const PAIR_POINTS = 100;
export const STREAK_BONUS = 20;

export type ConnectState = {
  /** Concept ids, left column order (pictures). */
  leftIds: string[];
  /** Same concept ids, right column order (words) — never aligned row-for-row with the left. */
  rightIds: string[];
  /** Index into leftIds currently picked, or null. */
  selectedLeft: number | null;
  matched: string[];
  /** Words that were part of a wrong pair at least once (fed back into review). */
  missed: string[];
  /** Indexes of the last wrong left/right tap, so both can flash. */
  wrong: { left: number; right: number } | null;
  moves: number;
  mistakes: number;
  streak: number;
  bestStreak: number;
  score: number;
  phase: "playing" | "wrong" | "done";
};

export type ConnectEvent =
  | { type: "tapLeft"; index: number }
  | { type: "tapRight"; index: number }
  | { type: "hide" };

/** Shuffles `ids` so no position lands on the same concept as `base` at that index. */
function derangeAgainst(ids: string[], base: string[], rng: Rng): string[] {
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = shuffle(ids, rng);
    if (candidate.every((id, i) => id !== base[i])) return candidate;
  }
  // Extremely unlikely fallback for tiny pools: swap away any remaining collisions.
  const candidate = shuffle(ids, rng);
  for (let i = 0; i < candidate.length; i++) {
    if (candidate[i] === base[i]) {
      const j = (i + 1) % candidate.length;
      [candidate[i], candidate[j]] = [candidate[j], candidate[i]];
    }
  }
  return candidate;
}

export function createConnect(
  conceptIds: string[],
  rng: Rng = Math.random,
): ConnectState {
  const leftIds = shuffle(conceptIds, rng);
  return {
    leftIds,
    rightIds:
      conceptIds.length > 1
        ? derangeAgainst(conceptIds, leftIds, rng)
        : [...leftIds],
    selectedLeft: null,
    matched: [],
    missed: [],
    wrong: null,
    moves: 0,
    mistakes: 0,
    streak: 0,
    bestStreak: 0,
    score: 0,
    phase: conceptIds.length ? "playing" : "done",
  };
}

export function reduceConnect(
  state: ConnectState,
  event: ConnectEvent,
): ConnectState {
  switch (event.type) {
    case "tapLeft": {
      const id = state.leftIds[event.index];
      if (state.phase !== "playing" || !id || state.matched.includes(id))
        return state;
      return { ...state, selectedLeft: event.index };
    }
    case "tapRight": {
      const rightId = state.rightIds[event.index];
      if (
        state.phase !== "playing" ||
        state.selectedLeft === null ||
        !rightId ||
        state.matched.includes(rightId)
      ) {
        return state;
      }
      const leftId = state.leftIds[state.selectedLeft];
      const moves = state.moves + 1;
      if (leftId === rightId) {
        const streak = state.streak + 1;
        const matched = [...state.matched, leftId];
        return {
          ...state,
          selectedLeft: null,
          matched,
          moves,
          streak,
          bestStreak: Math.max(state.bestStreak, streak),
          score:
            state.score + PAIR_POINTS + STREAK_BONUS * Math.min(streak - 1, 5),
          phase: matched.length === state.leftIds.length ? "done" : "playing",
        };
      }
      return {
        ...state,
        selectedLeft: null,
        wrong: { left: state.selectedLeft, right: event.index },
        moves,
        mistakes: state.mistakes + 1,
        streak: 0,
        missed: [...new Set([...state.missed, leftId, rightId])],
        phase: "wrong",
      };
    }
    case "hide":
      return state.phase === "wrong"
        ? { ...state, wrong: null, phase: "playing" }
        : state;
  }
}

export function connectStars(mistakes: number, pairs: number): number {
  if (mistakes <= Math.ceil(pairs / 2)) return 3;
  if (mistakes <= pairs + 1) return 2;
  return 1;
}

export function connectSummary(state: ConnectState) {
  return {
    total: state.leftIds.length,
    correct: state.matched.length,
    score: state.score,
    stars: connectStars(state.mistakes, state.leftIds.length),
    bestStreak: state.bestStreak,
    wrongIds: state.missed,
    moves: state.moves,
  };
}

/** Picks words for the board; no two may read the same in the learn language. */
export function pickPairs(
  pool: Concept[],
  count: number,
  learn: Locale,
  rng: Rng = Math.random,
): Concept[] {
  const seen = new Set<string>();
  const out: Concept[] = [];
  for (const c of shuffle(pool, rng)) {
    const text = c.terms[learn]?.text.toLowerCase();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(c);
    if (out.length === count) break;
  }
  return out;
}
