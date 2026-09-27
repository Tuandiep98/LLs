import type { Concept } from "@/content/schema";
import { Sticker } from "../shared/Sticker";

/** A chunky cartoon balloon carrying a sticker. */
export function Balloon({ concept, color }: { concept: Concept; color: string }) {
  return (
    <span className="relative block w-full" style={{ aspectRatio: "100 / 130" }}>
      <svg viewBox="0 0 100 130" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path d="M50 112 C44 118 56 124 50 130" fill="none" stroke="var(--outline)" strokeWidth="2.5" strokeLinecap="round" />
        <path
          d="M50 4 C22 4 6 26 6 50 C6 78 30 98 50 104 C70 98 94 78 94 50 C94 26 78 4 50 4 Z"
          fill={color}
          stroke="var(--outline)"
          strokeWidth="3.5"
        />
        <path d="M44 103 L56 103 L50 112 Z" fill={color} stroke="var(--outline)" strokeWidth="3" strokeLinejoin="round" />
        <ellipse cx="30" cy="30" rx="7" ry="13" fill="#fff" opacity="0.45" transform="rotate(-25 30 30)" />
      </svg>
      <span className="absolute inset-x-[18%] top-[16%] flex aspect-square items-center justify-center rounded-full bg-white/70">
        <Sticker concept={concept} className="h-[82%] w-[82%] object-contain" />
      </span>
    </span>
  );
}
