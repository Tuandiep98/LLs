"use client";

import type { Term } from "@/content/schema";
import { useSettings } from "@/lib/settings";

/**
 * Latin-letter pronunciation (pinyin, romaji) for a word, so kids who can't read
 * Chinese characters or kana yet can still sound it out. Parents can turn it off.
 */
export function Reading({ term, className = "" }: { term: Term; className?: string }) {
  const show = useSettings((s) => s.showReading);
  if (!show || !term.reading) return null;
  return <span className={className}>{term.reading}</span>;
}
