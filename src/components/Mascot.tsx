export type MascotMood = "happy" | "cheer" | "oops" | "think";

type Props = {
  mood?: MascotMood;
  /** CSS color for the body; the chameleon changes color like languages change. */
  color?: string;
  className?: string;
  title?: string;
};

/** "Lala" the chameleon, the LLs mascot. */
export function Mascot({ mood = "happy", color = "var(--green)", className, title }: Props) {
  const pupil = mood === "think" ? { cx: 152, cy: 57 } : mood === "oops" ? { cx: 146, cy: 66 } : { cx: 151, cy: 63 };
  const mouth =
    mood === "cheer"
      ? "M156 84 Q170 102 184 82 Z"
      : mood === "oops"
        ? "M160 90 Q170 84 180 90"
        : mood === "think"
          ? "M162 88 L178 86"
          : "M158 84 Q170 96 182 83";
  return (
    <svg viewBox="0 0 210 160" className={className} role="img" aria-label={title ?? "Lala"}>
      <g stroke="var(--outline)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        {/* curly tail */}
        <path d="M62 102 C30 108 14 80 30 64 C44 50 66 60 60 78 C56 90 40 88 42 76" fill="none" strokeWidth="18" />
        <path d="M62 102 C30 108 14 80 30 64 C44 50 66 60 60 78 C56 90 40 88 42 76" fill="none" stroke={color} strokeWidth="9" />
        {/* legs */}
        <rect x="78" y="112" width="16" height="26" rx="8" fill={color} />
        <rect x="118" y="112" width="16" height="26" rx="8" fill={color} />
        {/* body */}
        <ellipse cx="104" cy="96" rx="50" ry="32" fill={color} />
        {/* crest */}
        <path d="M70 70 q6 -12 12 -2 q6 -12 12 -2 q6 -12 12 -2 q6 -12 12 -2" fill={color} />
        {/* head + snout */}
        <circle cx="146" cy="74" r="30" fill={color} />
        <ellipse cx="166" cy="82" rx="22" ry="17" fill={color} />
      </g>
      {/* covers inner outline seams */}
      <ellipse cx="104" cy="96" rx="47.5" ry="29.5" fill={color} />
      <circle cx="146" cy="74" r="27.5" fill={color} />
      <ellipse cx="166" cy="82" rx="19.5" ry="14.5" fill={color} />
      {/* belly and spots */}
      <path d="M68 108 Q104 128 142 106" fill="none" stroke="var(--yellow)" strokeWidth="8" strokeLinecap="round" />
      <circle cx="96" cy="86" r="6" fill="#ffffff" opacity="0.35" />
      <circle cx="114" cy="80" r="4" fill="#ffffff" opacity="0.35" />
      <circle cx="84" cy="98" r="3.5" fill="#ffffff" opacity="0.35" />
      {/* cheek */}
      <circle cx="160" cy="94" r="5" fill="#ff8fa3" opacity="0.8" />
      {/* turret eye */}
      <circle cx="148" cy="62" r="17" fill={color} stroke="var(--outline)" strokeWidth="5" />
      <circle cx="149" cy="62" r="10.5" fill="#fff" stroke="var(--outline)" strokeWidth="3" />
      <circle cx={pupil.cx} cy={pupil.cy} r="5" fill="#2b2140" />
      <circle cx={pupil.cx + 1.8} cy={pupil.cy - 1.8} r="1.6" fill="#fff" />
      {/* mouth */}
      <path
        d={mouth}
        fill={mood === "cheer" ? "#ff8fa3" : "none"}
        stroke="var(--outline)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
