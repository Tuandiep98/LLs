import { useId } from "react";
import type { Locale } from "@/i18n/config";

/** Points of a 5-point star (for <polygon>), first point straight up. */
export function starPoints(cx: number, cy: number, outer: number, inner = outer * 0.4) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 ? inner : outer;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

type Props = { locale: Locale; className?: string };

/**
 * Country flag as SVG. Emoji flags show up as two letters ("GB") on Windows,
 * which kids can't recognize. `slice` lets the flag fill round or square boxes.
 */
export function Flag({ locale, className = "inline-block h-[0.95em] w-[1.35em] rounded-[3px] align-[-0.12em]" }: Props) {
  const clip = useId();
  const common = { className, "aria-hidden": true, preserveAspectRatio: "xMidYMid slice" } as const;
  switch (locale) {
    case "en":
      return (
        <svg viewBox="0 0 60 30" {...common}>
          <clipPath id={clip}>
            <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
          </clipPath>
          <rect width="60" height="30" fill="#012169" />
          <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
          <path d="M0 0l60 30M60 0L0 30" stroke="#c8102e" strokeWidth="4" clipPath={`url(#${clip})`} />
          <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
          <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
        </svg>
      );
    case "vi":
      return (
        <svg viewBox="0 0 30 20" {...common}>
          <rect width="30" height="20" fill="#da251d" />
          <polygon points={starPoints(15, 10.4, 6)} fill="#ffcd00" />
        </svg>
      );
    case "zh-Hans":
      return (
        <svg viewBox="0 0 30 20" {...common}>
          <rect width="30" height="20" fill="#ee1c25" />
          <polygon points={starPoints(5, 5, 3)} fill="#ffde00" />
          <polygon points={starPoints(10, 2, 1)} fill="#ffde00" />
          <polygon points={starPoints(12, 4, 1)} fill="#ffde00" />
          <polygon points={starPoints(12, 7, 1)} fill="#ffde00" />
          <polygon points={starPoints(10, 9, 1)} fill="#ffde00" />
        </svg>
      );
    case "ja":
      return (
        <svg viewBox="0 0 30 20" {...common}>
          <rect width="30" height="20" fill="#fff" />
          <circle cx="15" cy="10" r="6" fill="#bc002d" />
        </svg>
      );
  }
}
