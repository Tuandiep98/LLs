import { z } from "zod";
import { locales } from "@/i18n/config";

const localeEnum = z.enum(locales);

export const termSchema = z.object({
  text: z.string().min(1),
  // Pronunciation helper: pinyin, kana reading, IPA...
  reading: z.string().optional(),
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
