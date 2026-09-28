import { shuffle, type Rng } from "@/lib/core/random";

// Memory Match: flip two cards, keep them if they show the same word.
//   playing --flip 2 matching--> playing | done
//   playing --flip 2 different--> checking --hide--> playing

/** "pictures": two identical pictures. "words": a picture and its written word. */
export type Variant = "pictures" | "words";
export type Face = "picture" | "word";
export type Card = { key: string; conceptId: string; face: Face };

export type MemoryState = {
  variant: Variant;
  cards: Card[];
  /** Indexes of face-up cards not matched yet (0–2). */
  open: number[];
  matched: string[];
  /** Words that were part of a wrong pair at least once. */
  missed: string[];
  moves: number;
  mismatches: number;
  streak: number;
  bestStreak: number;
  score: number;
  phase: "playing" | "checking" | "done";
};

export type MemoryEvent = { type: "flip"; index: number } | { type: "hide" };

export const PAIR_OPTIONS = [3, 4, 6] as const;
export const PAIR_POINTS = 100;
export const STREAK_BONUS = 20;


export function createMemory(conceptIds: string[], variant: Variant, rng: Rng = Math.random): MemoryState {
  const cards = conceptIds.flatMap((id): Card[] => [
    { key: `${id}-a`, conceptId: id, face: "picture" },
    { key: `${id}-b`, conceptId: id, face: variant === "words" ? "word" : "picture" },
  ]);
  return {
    variant,
    cards: shuffle(cards, rng),
    open: [],
    matched: [],
    missed: [],
    moves: 0,
    mismatches: 0,
    streak: 0,
    bestStreak: 0,
    score: 0,
    phase: cards.length ? "playing" : "done",
  };
}

export function reduceMemory(state: MemoryState, event: MemoryEvent): MemoryState {
  switch (event.type) {
    case "flip": {
      const card = state.cards[event.index];
      if (state.phase !== "playing" || !card) return state;
      if (state.matched.includes(card.conceptId) || state.open.includes(event.index)) return state;
      const open = [...state.open, event.index];
      if (open.length < 2) return { ...state, open };

      const [a, b] = open.map((i) => state.cards[i]);
      const moves = state.moves + 1;
      if (a.conceptId === b.conceptId) {
        const streak = state.streak + 1;
        const matched = [...state.matched, a.conceptId];
        return {
          ...state,
          open: [],
          matched,
          moves,
          streak,
          bestStreak: Math.max(state.bestStreak, streak),
          score: state.score + PAIR_POINTS + STREAK_BONUS * Math.min(streak - 1, 5),
          phase: matched.length * 2 === state.cards.length ? "done" : "playing",
        };
      }
      return {
        ...state,
        open,
        moves,
        mismatches: state.mismatches + 1,
        streak: 0,
        missed: [...new Set([...state.missed, a.conceptId, b.conceptId])],
        phase: "checking",
      };
    }
    case "hide":
      return state.phase === "checking" ? { ...state, open: [], phase: "playing" } : state;
  }
}

export function memoryStars(mismatches: number, pairs: number): number {
  if (mismatches <= Math.ceil(pairs / 2)) return 3;
  if (mismatches <= pairs + 1) return 2;
  return 1;
}

export function memorySummary(state: MemoryState) {
  const pairs = state.cards.length / 2;
  return {
    total: pairs,
    correct: state.matched.length,
    score: state.score,
    stars: memoryStars(state.mismatches, pairs),
    bestStreak: state.bestStreak,
    wrongIds: state.missed,
    moves: state.moves,
  };
}
