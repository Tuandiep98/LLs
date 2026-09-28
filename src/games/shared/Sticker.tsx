/* eslint-disable @next/next/no-img-element -- static local PNGs, no optimization needed */
import { useLocale } from "next-intl";
import { termOf } from "@/content";
import type { Concept } from "@/content/schema";
import type { Locale } from "@/i18n/config";
import { asset } from "@/lib/basePath";

type Props = { concept: Concept; className?: string; tilt?: number; locked?: boolean };

export function Sticker({ concept, className = "", tilt = 0, locked = false }: Props) {
  // Alt text in the kid's own (UI) language, never the learned word, so it can't give answers away.
  const native = useLocale() as Locale;
  const image = concept.images[0];
  return (
    <img
      src={asset(image.src)}
      alt={locked ? "" : termOf(concept, native).text}
      draggable={false}
      className={`${locked ? "opacity-20 brightness-0 dark:invert" : "sticker"} select-none ${className}`}
      style={{ rotate: `${tilt}deg` }}
    />
  );
}
