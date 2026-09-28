"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useReducer, useState, type CSSProperties } from "react";
import { getConcept, spokenText, termOf } from "@/content";
import { localeMeta, type Locale } from "@/i18n/config";
import { useAudio, vibrate } from "@/lib/audio";
import { burst } from "../shared/confetti";
import { QuitModal, screenShell } from "../shared/quiz/QuizChrome";
import { Reading } from "../shared/Reading";
import { Sticker } from "../shared/Sticker";
import { createMemory, reduceMemory, type Card, type MemoryState, type Variant } from "./engine";

const HIDE_AFTER_MS = 1100;
const FINISH_AFTER_MS = 900;
const CARD_ASPECT = 0.85; // width / height

// Columns in portrait / landscape for each board size.
const LAYOUT: Record<number, { portrait: number; landscape: number }> = {
  3: { portrait: 2, landscape: 3 },
  4: { portrait: 2, landscape: 4 },
  6: { portrait: 3, landscape: 4 },
};

type Props = {
  conceptIds: string[];
  variant: Variant;
  learn: Locale;
  onFinish: (state: MemoryState) => void;
  onQuit: () => void;
};

export function MemoryBoard({ conceptIds, variant, learn, onFinish, onQuit }: Props) {
  const t = useTranslations();
  const { sfx, say } = useAudio();
  const [state, dispatch] = useReducer(reduceMemory, undefined, () => createMemory(conceptIds, variant));
  const [quitOpen, setQuitOpen] = useState(false);
  const pairs = conceptIds.length;
  const speechLang = localeMeta[learn].speechLang;

  // Found a pair.
  useEffect(() => {
    if (!state.matched.length) return;
    sfx("correct");
    vibrate(40);
    burst(0.5, 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per new pair
  }, [state.matched.length]);

  // Wrong pair: show both for a moment, then turn them back.
  useEffect(() => {
    if (state.phase !== "checking") return;
    sfx("wrong");
    const id = window.setTimeout(() => dispatch({ type: "hide" }), HIDE_AFTER_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per wrong pair
  }, [state.phase, state.moves]);

  useEffect(() => {
    if (state.phase !== "done") return;
    const id = window.setTimeout(() => onFinish(state), FINISH_AFTER_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once when done
  }, [state.phase]);

  const flip = (index: number) => {
    const card = state.cards[index];
    if (state.phase !== "playing" || state.open.includes(index) || state.matched.includes(card.conceptId)) return;
    sfx("tap");
    const concept = getConcept(card.conceptId);
    if (concept) say(spokenText(termOf(concept, learn)), speechLang);
    dispatch({ type: "flip", index });
  };

  const layout = LAYOUT[pairs] ?? LAYOUT[4];
  const rows = (cols: number) => Math.ceil((pairs * 2) / cols);
  const gridStyle = {
    "--cols-p": layout.portrait,
    "--cols-l": layout.landscape,
    "--ratio-p": (layout.portrait / rows(layout.portrait)) * CARD_ASPECT,
    "--ratio-l": (layout.landscape / rows(layout.landscape)) * CARD_ASPECT,
  } as CSSProperties;

  return (
    <div className={screenShell}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn-chunky btn-icon bg-surface text-ink"
          onClick={() => setQuitOpen(true)}
          aria-label={t("nav.close")}
        >
          ✕
        </button>
        <div className="flex flex-1 flex-wrap items-center justify-center gap-1.5" aria-label={t("memory.found")}>
          {conceptIds.map((id, i) => (
            <span
              key={id}
              className={`h-4 w-4 rounded-full border-2 border-outline transition-colors ${i < state.matched.length ? "bg-correct" : "bg-surface"}`}
            />
          ))}
        </div>
        <div className="card-chunky flex items-center gap-1 px-3 py-1.5 font-display text-lg font-extrabold">
          <span aria-hidden>👆</span>
          {t("memory.moves", { n: state.moves })}
        </div>
      </div>

      <div className="flex flex-1 items-center">
        <div className="memory-grid" style={gridStyle}>
          {state.cards.map((card, i) => (
            <MemoryCard
              key={card.key}
              card={card}
              index={i}
              learn={learn}
              faceUp={state.open.includes(i) || state.matched.includes(card.conceptId)}
              matched={state.matched.includes(card.conceptId)}
              wrong={state.phase === "checking" && state.open.includes(i)}
              onFlip={() => flip(i)}
              label={t("memory.cardBack", { n: i + 1 })}
            />
          ))}
        </div>
      </div>

      <QuitModal open={quitOpen} onClose={() => setQuitOpen(false)} onQuit={onQuit} />
    </div>
  );
}

function MemoryCard({
  card,
  index,
  learn,
  faceUp,
  matched,
  wrong,
  onFlip,
  label,
}: {
  card: Card;
  index: number;
  learn: Locale;
  faceUp: boolean;
  matched: boolean;
  wrong: boolean;
  onFlip: () => void;
  label: string;
}) {
  const concept = getConcept(card.conceptId);
  if (!concept) return null;
  const term = termOf(concept, learn);
  const long = term.text.length > 8;

  return (
    <motion.button
      type="button"
      onClick={onFlip}
      aria-label={faceUp ? term.text : label}
      aria-pressed={faceUp}
      className="relative w-full [perspective:900px]"
      style={{ aspectRatio: CARD_ASPECT }}
      initial={{ scale: 0, rotate: index % 2 ? 8 : -8 }}
      animate={
        wrong
          ? { x: [0, -8, 8, -5, 5, 0], scale: 1, rotate: 0 }
          : matched
            ? { scale: [1, 1.1, 1], rotate: 0 }
            : { scale: 1, rotate: 0 }
      }
      transition={{ delay: wrong || matched ? 0 : index * 0.03, duration: 0.4 }}
    >
      <motion.span
        className="absolute inset-0 block [transform-style:preserve-3d]"
        animate={{ rotateY: faceUp ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        {/* Back */}
        <span className="flip-face card-chunky absolute inset-0 flex items-center justify-center overflow-hidden bg-grape">
          <span
            className="absolute inset-2 rounded-2xl opacity-30"
            style={{ backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", backgroundSize: "14px 14px" }}
            aria-hidden
          />
          <span className="font-display relative text-5xl font-extrabold text-white drop-shadow sm:text-6xl" aria-hidden>
            ?
          </span>
        </span>
        {/* Front */}
        <span
          className={`flip-face card-chunky absolute inset-0 flex items-center justify-center p-2 [transform:rotateY(180deg)] ${
            matched ? "border-4 border-correct" : wrong ? "border-4 border-wrong" : ""
          }`}
        >
          {card.face === "picture" ? (
            <Sticker concept={concept} className="h-[80%] w-auto object-contain" />
          ) : (
            <span className="flex flex-col items-center gap-1 text-center">
              <span className={`font-display leading-tight font-extrabold break-words ${long ? "text-lg sm:text-2xl" : "text-2xl sm:text-4xl"}`}>
                {term.text}
              </span>
              <Reading term={term} className="text-xs text-ink-soft sm:text-sm" />
            </span>
          )}
          {matched && (
            <span
              className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-outline bg-correct text-base"
              aria-hidden
            >
              ✓
            </span>
          )}
        </span>
      </motion.span>
    </motion.button>
  );
}
