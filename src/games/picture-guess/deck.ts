import type { Concept } from "@/content/schema";
import type { Locale } from "@/i18n/config";
import { shuffle, type Rng } from "@/lib/core/random";

export type Round = { conceptId: string; options: string[] };

/** Picks `size` words, putting words that need review first (up to half the deck). */
export function buildDeck(pool: Concept[], size: number, reviewIds: string[], rng: Rng = Math.random): Concept[] {
  const review = new Set(reviewIds);
  const due = shuffle(
    pool.filter((c) => review.has(c.id)),
    rng,
  ).slice(0, Math.ceil(size / 2));
  const rest = shuffle(
    pool.filter((c) => !due.includes(c)),
    rng,
  );
  return shuffle([...due, ...rest].slice(0, size), rng);
}

/**
 * 4 answer choices: the right word + 3 from the same topic when possible,
 * never two choices that read the same in the learned language.
 */
export function buildOptions(
  target: Concept,
  allConcepts: Concept[],
  learn: Locale,
  count = 4,
  rng: Rng = Math.random,
): string[] {
  const text = (c: Concept) => c.terms[learn]?.text.toLowerCase();
  const used = new Set([text(target)]);
  const picked: Concept[] = [];
  const sameTopic = shuffle(
    allConcepts.filter((c) => c.topic === target.topic),
    rng,
  );
  const otherTopics = shuffle(
    allConcepts.filter((c) => c.topic !== target.topic),
    rng,
  );
  for (const c of [...sameTopic, ...otherTopics]) {
    if (picked.length >= count - 1) break;
    const t = text(c);
    if (c.id === target.id || !t || used.has(t)) continue;
    used.add(t);
    picked.push(c);
  }
  return shuffle([target, ...picked], rng).map((c) => c.id);
}

export function buildRounds(
  deck: Concept[],
  allConcepts: Concept[],
  learn: Locale,
  withOptions: boolean,
  rng: Rng = Math.random,
): Round[] {
  return deck.map((c) => ({
    conceptId: c.id,
    options: withOptions ? buildOptions(c, allConcepts, learn, 4, rng) : [],
  }));
}
