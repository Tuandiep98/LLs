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
});

export const topicColors = ["orange", "red", "sky", "green", "grape", "yellow"] as const;

export const topicSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  icon: z.string(),
  color: z.enum(topicColors),
  names: z.record(localeEnum, z.string()),
});

export type Term = z.infer<typeof termSchema>;
export type Concept = z.infer<typeof conceptSchema>;
export type Topic = z.infer<typeof topicSchema>;
export type TopicColor = Topic["color"];
