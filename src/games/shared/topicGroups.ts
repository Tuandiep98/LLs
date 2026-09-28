import type { Topic } from "@/content/schema";

/** A game needs at least this many words in a topic (4 answer choices). */
export const MIN_TOPIC_WORDS = 4;

export type TopicGroups = { season: Topic[]; recent: Topic[]; rest: Topic[] };

/**
 * Splits playable topics for the topic picker: seasonal topics first, then up to
 * `maxRecent` recently played ones, then the rest. Each topic appears once.
 */
export function groupTopics(
  topics: Topic[],
  { featuredIds, recentIds, wordCount, maxRecent = 3 }: {
    featuredIds: string[];
    /** Topic ids of past sessions, newest first (may repeat). */
    recentIds: (string | null)[];
    wordCount: (topicId: string) => number;
    maxRecent?: number;
  },
): TopicGroups {
  const playable = topics.filter((t) => wordCount(t.id) >= MIN_TOPIC_WORDS);
  const byId = new Map(playable.map((t) => [t.id, t]));
  const season = featuredIds.flatMap((id) => byId.get(id) ?? []);
  const used = new Set(season.map((t) => t.id));
  const recent: Topic[] = [];
  for (const id of recentIds) {
    if (recent.length >= maxRecent) break;
    const topic = id ? byId.get(id) : undefined;
    if (!topic || used.has(topic.id)) continue;
    used.add(topic.id);
    recent.push(topic);
  }
  return { season, recent, rest: playable.filter((t) => !used.has(t.id)) };
}
