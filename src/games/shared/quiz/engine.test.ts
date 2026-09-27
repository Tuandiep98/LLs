import { describe, expect, it } from "vitest";
import { createGame, pointsFor, reduce, starsFor, summary, type GameState } from "./engine";

const rounds = [
  { conceptId: "cat", options: ["cat", "dog", "fish", "bird"] },
  { conceptId: "dog", options: ["cat", "dog", "fish", "bird"] },
  { conceptId: "fish", options: ["cat", "dog", "fish", "bird"] },
];

const run = (state: GameState, ...events: Parameters<typeof reduce>[1][]) => events.reduce(reduce, state);

describe("picture-guess engine", () => {
  it("reveals immediately on answer and scores correct answers", () => {
    const s = run(createGame("play", rounds, 5), { type: "answer", choiceId: "cat", ms: 1000 });
    expect(s.phase).toBe("reveal");
    expect(s.results[0]).toMatchObject({ correct: true, choiceId: "cat" });
    expect(s.score).toBe(pointsFor(true, 1000, 5, 1));
  });

  it("ignores a second answer during reveal", () => {
    const s = run(
      createGame("play", rounds, 5),
      { type: "answer", choiceId: "dog", ms: 500 },
      { type: "answer", choiceId: "cat", ms: 600 },
    );
    expect(s.results).toHaveLength(1);
    expect(s.results[0].correct).toBe(false);
  });

  it("counts a timeout as wrong with no points and resets the streak", () => {
    const s = run(
      createGame("play", rounds, 5),
      { type: "answer", choiceId: "cat", ms: 100 },
      { type: "next" },
      { type: "timeout" },
    );
    expect(s.results[1]).toMatchObject({ choiceId: null, correct: false, points: 0 });
    expect(s.streak).toBe(0);
    expect(s.bestStreak).toBe(1);
  });

  it("finishes after the last round and summarises", () => {
    const s = run(
      createGame("play", rounds, 0),
      { type: "answer", choiceId: "cat", ms: 1 },
      { type: "next" },
      { type: "answer", choiceId: "dog", ms: 1 },
      { type: "next" },
      { type: "answer", choiceId: "cat", ms: 1 },
      { type: "next" },
    );
    expect(s.phase).toBe("done");
    expect(summary(s)).toMatchObject({ total: 3, correct: 2, stars: 2, bestStreak: 2, wrongIds: ["fish"] });
  });

  it("watch mode reveals on timeout, can skip and go back, never scores", () => {
    let s = createGame("watch", rounds, 3);
    s = reduce(s, { type: "answer", choiceId: "cat", ms: 1 });
    expect(s.phase).toBe("question");
    s = run(s, { type: "timeout" });
    expect(s.phase).toBe("reveal");
    s = run(s, { type: "next" }, { type: "next" });
    expect(s.index).toBe(2);
    s = reduce(s, { type: "prev" });
    expect(s.index).toBe(1);
    expect(s.results).toHaveLength(0);
  });

  it("gives speed and streak bonuses", () => {
    expect(pointsFor(false, 0, 5, 3)).toBe(0);
    expect(pointsFor(true, 0, 5, 1)).toBe(150);
    expect(pointsFor(true, 5000, 5, 1)).toBe(100);
    expect(pointsFor(true, 0, 0, 3)).toBe(120);
  });

  it("awards 1-3 stars", () => {
    expect(starsFor(10, 10)).toBe(3);
    expect(starsFor(6, 10)).toBe(2);
    expect(starsFor(0, 10)).toBe(1);
  });
});
