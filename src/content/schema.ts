import { z } from "zod";
import { locales } from "@/i18n/config";

const localeEnum = z.enum(locales);

export const termSchema = z.object({
  text: z.string().min(1),
  // Latin-letter pronunciation shown under the word: pinyin (zh-Hans), romaji (ja).
  reading: z.string().optional(),
  // What the voice reads when `text` alone is ambiguous, e.g. ja "あめ" → "飴" (not 雨).
  tts: z.string().optional(),
  audio: z.string().optional(),
});

export const imageKinds = ["sticker", "photo", "action", "illustration"] as const;

export const imageSchema = z.object({
  src: z.string().startsWith("/"),
  kind: z.enum(imageKinds),
  source: z.string(),
  sourceRef: z.string().optional(),
});

export const conceptSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  topic: z.string(),
  pos: z.enum(["noun", "verb", "adjective", "phrase"]),
  /** Other topic ids here also list the word in those topics (e.g. pumpkin: autumn + food). */
  tags: z.array(z.string()),
  images: z.array(imageSchema).min(1),
  terms: z.partialRecord(localeEnum, termSchema),
  /** Date the word was added (YYYY-MM-DD). */
  addedAt: z.iso.date().optional(),
  /** "seed" = hand-made starter data, "ai" = added by the nightly content routine. */
  origin: z.enum(["seed", "ai"]).optional(),
  /** Rough difficulty for young learners. */
  level: z.enum(["easy", "medium", "hard"]).optional(),
});

export const topicColors = ["orange", "red", "sky", "green", "grape", "yellow"] as const;

export const topicSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  icon: z.string(),
  color: z.enum(topicColors),
  names: z.record(localeEnum, z.string()),
  /** Show as the seasonal "featured" topic on the home page between these dates (inclusive). */
  featured: z.object({ from: z.iso.date(), to: z.iso.date() }).optional(),
});

/**
 * How a badge is earned. Everything is counted for the language being learned, except
 * `sessions` and `dayStreak` (all games). `perfect`: a played game of at least `min` words, all right.
 */
export const badgeRuleSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("sessions"), min: z.int().min(1) }),
  z.object({ type: z.literal("dayStreak"), min: z.int().min(2) }),
  z.object({ type: z.literal("bestStreak"), min: z.int().min(3) }),
  z.object({ type: z.literal("perfect"), min: z.int().min(5) }),
  z.object({ type: z.literal("stickers"), min: z.int().min(5) }),
  z.object({ type: z.literal("topicsCompleted"), min: z.int().min(1) }),
  /** Collect `min` stickers of one topic (counts words tagged with the topic too). */
  z.object({ type: z.literal("topicStickers"), topic: z.string(), min: z.int().min(4) }),
]);

export const badgeSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  icon: z.string().min(1),
  rule: badgeRuleSchema,
  names: z.record(localeEnum, z.string().min(1)),
  descs: z.record(localeEnum, z.string().min(1)),
  /** Date the badge was added (YYYY-MM-DD); required for routine-added badges. */
  addedAt: z.iso.date().optional(),
  origin: z.enum(["seed", "ai"]).optional(),
});

/** Seasonal events and holidays the content routine plans themes around. */
export const calendarSchema = z.object({
  events: z.array(
    z.object({
      id: z.string().regex(/^[a-z0-9-]+$/),
      name: z.string(),
      /** Fixed yearly dates as MM-DD, or exact dates per year for lunar holidays. */
      window: z.union([
        z.object({ from: z.string().regex(/^\d{2}-\d{2}$/), to: z.string().regex(/^\d{2}-\d{2}$/) }),
        z.object({ dates: z.record(z.string().regex(/^\d{4}$/), z.object({ from: z.iso.date(), to: z.iso.date() })) }),
      ]),
      themes: z.array(z.string()),
    }),
  ),
  coreTopics: z.array(z.object({ id: z.string(), description: z.string() })),
});

export type Term = z.infer<typeof termSchema>;
export type Concept = z.infer<typeof conceptSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type TopicColor = Topic["color"];
export type Badge = z.infer<typeof badgeSchema>;
export type BadgeRule = z.infer<typeof badgeRuleSchema>;
