/* eslint-disable @next/next/no-img-element -- static local PNGs, no optimization needed */
import type { Concept } from "@/content/schema";
import { asset } from "@/lib/basePath";

type Props = { concept: Concept; className?: string; tilt?: number; locked?: boolean };

export function Sticker({ concept, className = "", tilt = 0, locked = false }: Props) {
  const image = concept.images[0];
  return (
    <img
      src={asset(image.src)}
      alt={locked ? "" : concept.terms.en?.text ?? concept.id}
      draggable={false}
      className={`${locked ? "opacity-20 brightness-0 dark:invert" : "sticker"} select-none ${className}`}
      style={{ rotate: `${tilt}deg` }}
    />
  );
}
