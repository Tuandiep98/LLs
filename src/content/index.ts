import { z } from "zod";
import type { Locale } from "@/i18n/config";
import conceptsJson from "./data/concepts.json";
import topicsJson from "./data/topics.json";
import { conceptSchema, topicSchema, type Concept, type Term, type Topic } from "./schema";

// Content is validated once at load, so bad data fails the build instead of a game.
export const topics: Topic[] = z.array(topicSchema).parse(topicsJson);
export const concepts: Concept[] = z.array(conceptSchema).parse(conceptsJson);

const conceptById = new Map(concepts.map((c) => [c.id, c]));

export function getConcept(id: string): Concept | undefined {
  return conceptById.get(id);
}

export function getTopic(id: string): Topic | undefined {
  return topics.find((t) => t.id === id);
}

/** Concepts usable for a language pair (both sides translated). */
export function conceptsFor(learn: Locale, native: Locale, topicId?: string): Concept[] {
  return concepts.filter(
    (c) =>
      (!topicId || c.topic === topicId) && c.terms[learn] !== undefined && c.terms[native] !== undefined,
  );
}

export function termOf(concept: Concept, locale: Locale): Term {
  return concept.terms[locale] ?? concept.terms.en ?? { text: concept.id };
}
