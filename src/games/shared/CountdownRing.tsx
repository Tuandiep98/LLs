type Props = { remainingMs: number; totalMs: number; size?: number };

/** Big friendly countdown: a ring that drains plus the seconds left. */
export function CountdownRing({ remainingMs, totalMs, size = 72 }: Props) {
  const r = 26;
  const circumference = 2 * Math.PI * r;
  const fraction = totalMs > 0 ? remainingMs / totalMs : 0;
  const seconds = Math.ceil(remainingMs / 1000);
  const color = fraction > 0.5 ? "var(--green)" : fraction > 0.25 ? "var(--yellow)" : "var(--red)";
  return (
    <div className="relative" style={{ width: size, height: size }} role="timer" aria-live="off">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r="29" fill="var(--surface)" stroke="var(--outline)" strokeWidth="3" />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - fraction)}
        />
      </svg>
      <span className="font-display absolute inset-0 flex items-center justify-center text-3xl font-extrabold">
        {seconds}
      </span>
    </div>
  );
}
