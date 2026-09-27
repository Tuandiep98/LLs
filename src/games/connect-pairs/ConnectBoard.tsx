"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useReducer, useState } from "react";
import { getConcept, termOf } from "@/content";
import { localeMeta, type Locale } from "@/i18n/config";
import { useAudio, vibrate } from "@/lib/audio";
import { burst } from "../shared/confetti";
import { QuitModal, screenShell } from "../shared/quiz/QuizChrome";
import { Sticker } from "../shared/Sticker";
import { createConnect, reduceConnect, type ConnectState } from "./engine";

const HIDE_AFTER_MS = 900;
const FINISH_AFTER_MS = 900;

type Props = {
  conceptIds: string[];
  learn: Locale;
  onFinish: (state: ConnectState) => void;
  onQuit: () => void;
};

/** Tap a picture on the left, then its matching word on the right. */
export function ConnectBoard({ conceptIds, learn, onFinish, onQuit }: Props) {
  const t = useTranslations();
  const { sfx, say } = useAudio();
  const [state, dispatch] = useReducer(reduceConnect, undefined, () => createConnect(conceptIds));
  const [quitOpen, setQuitOpen] = useState(false);
  const speechLang = localeMeta[learn].speechLang;

  // Found a pair.
  useEffect(() => {
    if (!state.matched.length) return;
    sfx("correct");
    vibrate(40);
    burst(0.5, 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per new pair
  }, [state.matched.length]);

  // Wrong pair: flash both cards, then clear the pick.
  useEffect(() => {
    if (state.phase !== "wrong") return;
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

  const tapLeft = (index: number) => {
    const id = state.leftIds[index];
    if (state.phase !== "playing" || state.matched.includes(id)) return;
    sfx("tap");
    const concept = getConcept(id);
    if (concept) say(termOf(concept, learn).text, speechLang);
    dispatch({ type: "tapLeft", index });
  };

  const tapRight = (index: number) => {
    if (state.phase !== "playing" || state.selectedLeft === null) return;
    const id = state.rightIds[index];
    if (state.matched.includes(id)) return;
    sfx("tap");
    dispatch({ type: "tapRight", index });
  };

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
          {conceptIds.map((id) => (
            <span
              key={id}
              className={`h-4 w-4 rounded-full border-2 border-outline transition-colors ${state.matched.includes(id) ? "bg-correct" : "bg-surface"}`}
            />
          ))}
        </div>
        <div className="card-chunky flex items-center gap-1 px-3 py-1.5 font-display text-lg font-extrabold">
          <span aria-hidden>👆</span>
          {t("memory.moves", { n: state.moves })}
        </div>
      </div>

      <div className="grid flex-1 grid-cols-2 items-center gap-3 py-2 sm:gap-4">
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {state.leftIds.map((id, i) => {
            const concept = getConcept(id);
            if (!concept) return null;
            const matched = state.matched.includes(id);
            const selected = state.selectedLeft === i;
            const wrong = state.wrong?.left === i;
            const tone = matched ? "bg-correct" : wrong ? "bg-wrong" : selected ? "bg-sky" : "bg-surface";
            return (
              <div key={id} className="relative">
                <motion.button
                  type="button"
                  disabled={matched}
                  onClick={() => tapLeft(i)}
                  aria-label={matched ? termOf(concept, learn).text : t("connect.pickPicture", { n: i + 1 })}
                  animate={
                    wrong
                      ? { x: [0, -8, 8, -5, 5, 0] }
                      : selected
                        ? { scale: [1, 1.08, 1] }
                        : matched
                          ? { scale: [1, 1.05, 1] }
                          : { scale: 1 }
                  }
                  className={`btn-chunky flex h-16 w-full items-center justify-center p-1.5 disabled:opacity-70 sm:h-20 ${tone}`}
                >
                  <Sticker concept={concept} className="h-full w-auto object-contain" />
                </motion.button>
                {matched && (
                  <span
                    className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-outline bg-correct text-sm"
                    aria-hidden
                  >
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-2.5 sm:gap-3">
          {state.rightIds.map((id, i) => {
            const concept = getConcept(id);
            if (!concept) return null;
            const matched = state.matched.includes(id);
            const wrong = state.wrong?.right === i;
            const tone = matched ? "bg-correct" : wrong ? "bg-wrong" : "bg-surface text-ink";
            return (
              <div key={id} className="relative">
                <motion.button
                  type="button"
                  disabled={matched}
                  onClick={() => tapRight(i)}
                  animate={wrong ? { x: [0, -8, 8, -5, 5, 0] } : matched ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                  className={`btn-chunky h-16 w-full px-2 text-base leading-tight break-words disabled:opacity-70 sm:h-20 sm:text-lg ${tone}`}
                >
                  {termOf(concept, learn).text}
                </motion.button>
                {matched && (
                  <span
                    className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-outline bg-correct text-sm"
                    aria-hidden
                  >
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <QuitModal open={quitOpen} onClose={() => setQuitOpen(false)} onQuit={onQuit} />
    </div>
  );
}
