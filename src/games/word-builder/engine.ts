import type { Concept } from "@/content/schema";
import type { Locale } from "@/i18n/config";
import { shuffle, type Rng } from "@/lib/core/random";

// Word Builder: see the picture, hear the word, tap the pieces in order to build it.
//   playing --tap right piece--> playing | solved --next--> playing | done
//   playing --tap wrong piece--> wrong --hide--> playing

export const WORD_OPTIONS = [5, 8] as const;
export const MIN_PIECES = 2;
export const MAX_PIECES = 7;
export const EXTRA_TILES = 2;
/** After this many mistakes on a word, the next right tile is highlighted. */
export const HINT_AFTER = 2;
export const WORD_POINTS = 100;
const MISTAKE_COST = 30;
const MIN_POINTS = 20;
const STREAK_BONUS = 20;

const SMALL_KANA = /^[ゃゅょぁぃぅぇぉャュョァィゥェォ]$/;

/**
 * Splits a word into the pieces a child taps: letters (with their accents, so "è" is one piece)
 * for Latin scripts, characters for Chinese, and kana syllables for Japanese ("きゅ" is one piece).
 * Spaces are not pieces.
 */
export function splitWord(text: string, learn: Locale): string[] {
  const graphemes = [...new Intl.Segmenter(learn, { granularity: "grapheme" }).segment(text.toLowerCase())]
    .map((s) => s.segment)
    .filter((g) => g.trim() !== "");
  if (learn !== "ja") return graphemes;
  const pieces: string[] = [];
  for (const g of graphemes) {
    if (SMALL_KANA.test(g) && pieces.length) pieces[pieces.length - 1] += g;
    else pieces.push(g);
  }
  return pieces;
}

/** The word split into rows of pieces, keeping the spaces between words as gaps. */
export function wordLayout(text: string, learn: Locale): string[][] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => splitWord(part, learn));
}

export function canBuild(concept: Concept, learn: Locale): boolean {
  const text = concept.terms[learn]?.text;
  if (!text) return false;
  const n = splitWord(text, learn).length;
  return n >= MIN_PIECES && n <= MAX_PIECES;
}

export type Tile = { key: string; text: string; used: boolean };
export type BuildRound = { conceptId: string; pieces: string[]; tiles: Tile[] };
export type WordResult = { conceptId: string; mistakes: number; points: number };

export type BuildState = {
  rounds: BuildRound[];
  index: number;
  /** How many pieces of the current word are in place. */
  filled: number;
  mistakes: number;
  /** Tile index that was tapped wrongly, to shake it. */
  wrongTile: number | null;
  results: WordResult[];
  score: number;
  streak: number;
  bestStreak: number;
  phase: "playing" | "wrong" | "solved" | "done";
};

export type BuildEvent = { type: "tap"; tile: number } | { type: "hide" } | { type: "next" };

/** Tiles for one word: its pieces plus a few pieces from other words, shuffled. */
export function buildRound(target: Concept, others: Concept[], learn: Locale, rng: Rng = Math.random): BuildRound {
  const pieces = splitWord(target.terms[learn]?.text ?? "", learn);
  const own = new Set(pieces);
  const pool = shuffle(
    [...new Set(others.flatMap((c) => (c.id === target.id ? [] : splitWord(c.terms[learn]?.text ?? "", learn))))].filter(
      (p) => !own.has(p),
    ),
    rng,
  );
  const texts = [...pieces, ...pool.slice(0, EXTRA_TILES)];
  return {
    conceptId: target.id,
    pieces,
    tiles: shuffle(texts, rng).map((text, i) => ({ key: `${i}-${text}`, text, used: false })),
  };
}

export function createBuild(rounds: BuildRound[]): BuildState {
  return {
    rounds,
    index: 0,
    filled: 0,
    mistakes: 0,
    wrongTile: null,
    results: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
    phase: rounds.length ? "playing" : "done",
  };
}

export function pointsFor(mistakes: number, streak: number): number {
  return Math.max(MIN_POINTS, WORD_POINTS - MISTAKE_COST * mistakes) + STREAK_BONUS * Math.min(Math.max(streak - 1, 0), 5);
}

/** Index of an unused tile that fits the next slot (for the hint). */
export function nextTile(state: BuildState): number {
  const round = state.rounds[state.index];
  if (!round || state.phase === "done") return -1;
  return round.tiles.findIndex((t) => !t.used && t.text === round.pieces[state.filled]);
}

export function reduceBuild(state: BuildState, event: BuildEvent): BuildState {
  const round = state.rounds[state.index];
  switch (event.type) {
    case "tap": {
      const tile = round?.tiles[event.tile];
      if (state.phase !== "playing" || !tile || tile.used) return state;
      // Any unused tile with the right text counts (a word may repeat a letter).
      if (tile.text !== round.pieces[state.filled]) {
        return { ...state, mistakes: state.mistakes + 1, wrongTile: event.tile, phase: "wrong" };
      }
      const tiles = round.tiles.map((t, i) => (i === event.tile ? { ...t, used: true } : t));
      const rounds = state.rounds.map((r, i) => (i === state.index ? { ...r, tiles } : r));
      const filled = state.filled + 1;
      if (filled < round.pieces.length) return { ...state, rounds, filled };
      // Solved: a word built without mistakes keeps the streak going.
      const streak = state.mistakes === 0 ? state.streak + 1 : 0;
      const points = pointsFor(state.mistakes, streak);
      return {
        ...state,
        rounds,
        filled,
        phase: "solved",
        results: [...state.results, { conceptId: round.conceptId, mistakes: state.mistakes, points }],
        score: state.score + points,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
      };
    }
    case "hide":
      return state.phase === "wrong" ? { ...state, wrongTile: null, phase: "playing" } : state;
    case "next": {
      if (state.phase !== "solved") return state;
      const index = state.index + 1;
      if (index >= state.rounds.length) return { ...state, phase: "done" };
      return { ...state, index, filled: 0, mistakes: 0, wrongTile: null, phase: "playing" };
    }
  }
}

export function buildStars(results: WordResult[]): number {
  if (!results.length) return 0;
  const clean = results.filter((r) => r.mistakes === 0).length / results.length;
  return clean >= 0.8 ? 3 : clean >= 0.5 ? 2 : 1;
}

export function buildSummary(state: BuildState) {
  return {
    total: state.results.length,
    // A word counts as known when it was built without a wrong tap.
    correct: state.results.filter((r) => r.mistakes === 0).length,
    score: state.score,
    stars: buildStars(state.results),
    bestStreak: state.bestStreak,
    wrongIds: state.results.filter((r) => r.mistakes > 0).map((r) => r.conceptId),
  };
}
