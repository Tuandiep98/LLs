/**
 * App mark: Lala's face close-up on a yellow tile (same as the app icon).
 * Kept different from the full-body mascot in the hero so the two don't look duplicated.
 */
export function LogoMark({ className }: { className?: string }) {
  const color = "var(--green)";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-outline bg-yellow shadow-[0_4px_0_var(--outline)] ${className ?? ""}`}
      aria-hidden
    >
      <svg viewBox="112 34 82 82" className="h-full w-full">
        <g stroke="var(--outline)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="146" cy="78" r="30" fill={color} />
          <ellipse cx="168" cy="86" rx="22" ry="17" fill={color} />
        </g>
        <circle cx="146" cy="78" r="27.5" fill={color} />
        <ellipse cx="168" cy="86" rx="19.5" ry="14.5" fill={color} />
        <circle cx="132" cy="94" r="4" fill="#ffffff" opacity="0.35" />
        <circle cx="160" cy="98" r="5" fill="#ff8fa3" opacity="0.85" />
        <circle cx="148" cy="64" r="17" fill={color} stroke="var(--outline)" strokeWidth="5" />
        <circle cx="149" cy="64" r="10.5" fill="#fff" stroke="var(--outline)" strokeWidth="3" />
        <circle cx="151" cy="65" r="5" fill="#2b2140" />
        <circle cx="152.8" cy="63.2" r="1.6" fill="#fff" />
        <path
          d="M158 88 Q171 104 184 86 Z"
          fill="#ff8fa3"
          stroke="var(--outline)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
