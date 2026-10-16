import { starPoints } from "./Flag";

/**
 * Chunky UI icons drawn to match the toy buttons: thick round strokes in the text color
 * (`currentColor`), with playful fills from the theme palette. Sized 1em by default,
 * so they follow the button's font size like the emoji they replace.
 */
export type IconName =
  | "back"
  | "arrow"
  | "close"
  | "check"
  | "cross"
  | "play"
  | "pause"
  | "prev"
  | "next"
  | "speaker"
  | "home"
  | "replay"
  | "trash"
  | "settings"
  | "book"
  | "sun"
  | "moon"
  | "auto"
  | "chevron";

function gearPath(cx: number, cy: number, outer: number, root: number, teeth: number) {
  const pts: string[] = [];
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    for (const [r, da] of [
      [root, -0.34],
      [outer, -0.2],
      [outer, 0.2],
      [root, 0.34],
    ] as const) {
      pts.push(`${(cx + r * Math.cos(a + da)).toFixed(2)} ${(cy + r * Math.sin(a + da)).toFixed(2)}`);
    }
  }
  return `M${pts.join("L")}Z`;
}

const GEAR = gearPath(12, 12, 10, 7.6, 8);

const SKIP = "M18.5 5.6v12.8a1 1 0 0 1-1.56.83l-8.6-6.4a1.05 1.05 0 0 1 0-1.66l8.6-6.4a1 1 0 0 1 1.56.83Z";

function shapes(name: IconName) {
  switch (name) {
    case "back":
      return <path d="M19 12H5.5M11 5.5 4.5 12l6.5 6.5" />;
    case "arrow":
      return <path d="M5 12h13.5M13 5.5l6.5 6.5-6.5 6.5" />;
    case "close":
    case "cross":
      return <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" strokeWidth="3.2" />;
    case "check":
      return <path d="M4.8 12.6l4.6 4.6L19.3 7.2" strokeWidth="3.2" />;
    case "play":
      return (
        <path
          d="M8 5.4v13.2a1 1 0 0 0 1.53.85l10.4-6.6a1 1 0 0 0 0-1.7L9.53 4.55A1 1 0 0 0 8 5.4Z"
          fill="currentColor"
        />
      );
    case "pause":
      return (
        <g fill="currentColor">
          <rect x="6" y="5" width="4" height="14" rx="1.2" />
          <rect x="14" y="5" width="4" height="14" rx="1.2" />
        </g>
      );
    case "prev":
      return (
        <g fill="currentColor">
          <rect x="4.5" y="5" width="2.5" height="14" rx="1" />
          <path d={SKIP} />
        </g>
      );
    case "next":
      return (
        <g fill="currentColor" transform="matrix(-1 0 0 1 24 0)">
          <rect x="4.5" y="5" width="2.5" height="14" rx="1" />
          <path d={SKIP} />
        </g>
      );
    case "speaker":
      return (
        <>
          <path d="M3.8 9.3h3.4l4.8-4v13.4l-4.8-4H3.8Z" fill="currentColor" />
          <path d="M15.6 9a4.2 4.2 0 0 1 0 6M18.6 6.2a8.2 8.2 0 0 1 0 11.6" />
        </>
      );
    case "home":
      return (
        <>
          <path d="M5.5 10.5V20h13v-9.5" fill="var(--orange)" />
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M10 20v-5h4v5" fill="var(--yellow)" />
        </>
      );
    case "replay":
      return <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.6 4.2v4.6H15" />;
    case "trash":
      return (
        <>
          <path d="M6 7.5l1 12.5h10l1-12.5" fill="currentColor" fillOpacity="0.18" />
          <path d="M4 7.5h16M9.5 7.5V4.5h5v3M10 11v5.5M14 11v5.5" />
        </>
      );
    case "settings":
      return (
        <>
          <path d={GEAR} fill="var(--sky)" />
          <circle cx="12" cy="12" r="3" fill="var(--surface)" />
        </>
      );
    case "book":
      return (
        <>
          <path d="M5 4.5a1.5 1.5 0 0 1 1.5-1.5H19v16H6.5A1.5 1.5 0 0 0 5 20.5Z" fill="var(--orange)" />
          <path d="M5 20.5A1.5 1.5 0 0 1 6.5 19H19v2H6.5A1.5 1.5 0 0 1 5 20.5Z" fill="var(--surface)" />
          <polygon points={starPoints(12.3, 10.4, 5.4, 2.5)} fill="var(--yellow)" strokeWidth="1.5" />
        </>
      );
    case "sun":
      return (
        <>
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.5 1.5M17.2 17.2l1.5 1.5M5.3 18.7l1.5-1.5M17.2 6.8l1.5-1.5" />
          <circle cx="12" cy="12" r="4.6" fill="var(--yellow)" />
        </>
      );
    case "moon":
      return (
        <>
          <path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.3 6.3 0 0 0 10.1 10.1Z" fill="var(--yellow)" />
          <polygon points={starPoints(17.5, 5.8, 2.4, 1)} fill="currentColor" strokeWidth="1" />
        </>
      );
    case "auto":
      return (
        <>
          <path d="M12 3.5a8.5 8.5 0 0 0 0 17Z" fill="var(--yellow)" />
          <path d="M12 3.5a8.5 8.5 0 0 1 0 17Z" fill="var(--grape)" />
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 3.5v17" />
          <circle cx="15.6" cy="9.4" r="1.1" fill="#fff" stroke="none" />
        </>
      );
    case "chevron":
      return <path d="M6.5 9.5 12 15l5.5-5.5" strokeWidth="3" />;
  }
}

export function Icon({ name, className = "h-[1em] w-[1em]" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {shapes(name)}
    </svg>
  );
}
