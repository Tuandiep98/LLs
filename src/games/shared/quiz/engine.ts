import type { Round } from "./deck";

// Pure state machine for one session. The UI dispatches events; timers live in the UI.
//   question --answer/timeout--> reveal --next--> question ... --> done

export type Mode = "watch" | "play";
export type Phase = "question" | "reveal" | "done";

export type RoundResult = {
  conceptId: string;
  choiceId: string | null;
  correct: boolean;
  points: number;
  ms: number;
};

export type GameState = {
  mode: Mode;
  timeLimit: number; // seconds, 0 = none
  rounds: Round[];
  index: number;
  phase: Phase;
  results: RoundResult[];
  score: number;
  streak: number;
  bestStreak: number;
};

export type GameEvent =
  | { type: "answer"; choiceId: string; ms: number }
  | { type: "timeout" }
  | { type: "next" }
  | { type: "prev" };

export function createGame(mode: Mode, rounds: Round[], timeLimit: number): GameState {
  return {
    mode,
    timeLimit,
    rounds,
    index: 0,
    phase: rounds.length ? "question" : "done",
    results: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
  };
}

export const BASE_POINTS = 100;
export const MAX_SPEED_BONUS = 50;
export const STREAK_BONUS = 10;

export function pointsFor(correct: boolean, ms: number, timeLimit: number, streak: number): number {
  if (!correct) return 0;
  const speed = timeLimit > 0 ? Math.round(MAX_SPEED_BONUS * Math.max(0, 1 - ms / (timeLimit * 1000))) : 0;
  return BASE_POINTS + speed + STREAK_BONUS * Math.min(Math.max(streak - 1, 0), 5);
}

export function starsFor(correct: number, total: number): number {
  if (total === 0) return 0;
  const ratio = correct / total;
  return ratio >= 0.9 ? 3 : ratio >= 0.6 ? 2 : 1;
}

export function currentRound(state: GameState): Round | undefined {
  return state.rounds[state.index];
}

export function reduce(state: GameState, event: GameEvent): GameState {
  const round = currentRound(state);
  switch (event.type) {
    case "answer": {
      if (state.mode !== "play" || state.phase !== "question" || !round) return state;
      if (!round.options.includes(event.choiceId)) return state;
      const correct = event.choiceId === round.conceptId;
      const streak = correct ? state.streak + 1 : 0;
      const points = pointsFor(correct, event.ms, state.timeLimit, streak);
      return {
        ...state,
        phase: "reveal",
        results: [...state.results, { conceptId: round.conceptId, choiceId: event.choiceId, correct, points, ms: event.ms }],
        score: state.score + points,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
      };
    }
    case "timeout": {
      if (state.phase !== "question" || !round) return state;
      if (state.mode === "watch") return { ...state, phase: "reveal" };
      return {
        ...state,
        phase: "reveal",
        results: [
          ...state.results,
          { conceptId: round.conceptId, choiceId: null, correct: false, points: 0, ms: state.timeLimit * 1000 },
        ],
        streak: 0,
      };
    }
    case "next": {
      if (state.phase === "done") return state;
      // Watch mode may skip straight from question to the next word.
      if (state.phase === "question" && state.mode !== "watch") return state;
      const index = state.index + 1;
      return index >= state.rounds.length
        ? { ...state, index: state.rounds.length - 1, phase: "done" }
        : { ...state, index, phase: "question" };
    }
    case "prev": {
      if (state.mode !== "watch" || state.phase === "done" || state.index === 0) return state;
      return { ...state, index: state.index - 1, phase: "question" };
    }
  }
}

export function summary(state: GameState) {
  const total = state.mode === "play" ? state.results.length : state.rounds.length;
  const correct = state.results.filter((r) => r.correct).length;
  return {
    total,
    correct,
    score: state.score,
    bestStreak: state.bestStreak,
    stars: state.mode === "play" ? starsFor(correct, total) : 3,
    wrongIds: state.results.filter((r) => !r.correct).map((r) => r.conceptId),
  };
}
