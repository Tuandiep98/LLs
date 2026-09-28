"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useReducer, useState } from "react";
import { Mascot } from "@/components/Mascot";
import { getConcept, spokenText, termOf } from "@/content";
import { localeMeta, type Locale } from "@/i18n/config";
import { useAudio, useCanHear, vibrate } from "@/lib/audio";
import { burst } from "../shared/confetti";
import { QuitModal, screenShell } from "../shared/quiz/QuizChrome";
import { Reading } from "../shared/Reading";
import { Sticker } from "../shared/Sticker";
import { createBuild, HINT_AFTER, nextTile, reduceBuild, wordLayout, type BuildRound, type BuildState } from "./engine";

const HIDE_AFTER_MS = 700;
const NEXT_AFTER_MS = 1600;

type Props = {
  rounds: BuildRound[];
  learn: Locale;
  native: Locale;
  onFinish: (state: BuildState) => void;
  onQuit: () => void;
};

/** See the picture, hear the word, tap the pieces in order to build it. */
export function BuildBoard({ rounds, learn, native, onFinish, onQuit }: Props) {
  const t = useTranslations();
  const { sfx, say } = useAudio();
  const speechLang = localeMeta[learn].speechLang;
  const canHear = useCanHear(speechLang);
  const [state, dispatch] = useReducer(reduceBuild, undefined, () => createBuild(rounds));
  const [quitOpen, setQuitOpen] = useState(false);

  const round = state.rounds[state.index];
  const concept = round ? getConcept(round.conceptId) : undefined;
  const term = concept ? termOf(concept, learn) : undefined;
  const hint = state.phase === "playing" && state.mistakes >= HINT_AFTER ? nextTile(state) : -1;

  // Read the word when it appears.
  useEffect(() => {
    if (!term) return;
    const id = window.setTimeout(() => say(spokenText(term), speechLang), 400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per word
  }, [state.index]);

  useEffect(() => {
    if (state.phase !== "wrong") return;
    sfx("wrong");
    vibrate([30, 40, 30]);
    const id = window.setTimeout(() => dispatch({ type: "hide" }), HIDE_AFTER_MS);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per wrong tap
  }, [state.phase, state.mistakes]);

  useEffect(() => {
    if (state.phase !== "solved" || quitOpen) return;
    const id = window.setTimeout(() => dispatch({ type: "next" }), NEXT_AFTER_MS);
    return () => window.clearTimeout(id);
  }, [state.phase, state.index, quitOpen]);

  useEffect(() => {
    if (state.phase !== "solved" || !term) return;
    sfx("correct");
    vibrate(40);
    burst(0.5, 0.4);
    say(spokenText(term), speechLang);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per solved word
  }, [state.phase, state.index]);

  useEffect(() => {
    if (state.phase === "done") onFinish(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once when done
  }, [state.phase]);

  if (!round || !concept || !term) return null;
  const solved = state.phase === "solved";
  const rows = wordLayout(term.text, learn);
  // Index of each row's first piece in the whole word.
  const rowStart = rows.map((_, r) => rows.slice(0, r).reduce((n, row) => n + row.length, 0));

  const tap = (index: number) => {
    if (state.phase !== "playing" || round.tiles[index].used) return;
    sfx("tap");
    dispatch({ type: "tap", tile: index });
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
        <div className="flex flex-1 flex-wrap items-center justify-center gap-1.5">
          {state.rounds.map((r, i) => (
            <span
              key={r.conceptId}
              className={`h-4 w-4 rounded-full border-2 border-outline transition-colors ${
                i < state.results.length
                  ? state.results[i].mistakes === 0
                    ? "bg-correct"
                    : "bg-yellow"
                  : i === state.index
                    ? "bg-sky"
                    : "bg-surface"
              }`}
            />
          ))}
        </div>
        <div
          className="card-chunky flex items-center gap-1 px-3 py-1.5 font-display text-xl font-extrabold"
          aria-label={t("play.score")}
        >
          <span aria-hidden>⭐</span>
          {state.score}
        </div>
      </div>

      <div className="grid flex-1 content-center gap-4 md:landscape:grid-cols-2 md:landscape:items-center">
        {/* Picture + word prompt */}
        <div className="flex flex-col gap-3">
          <div className="card-chunky relative flex h-[26dvh] min-h-36 items-center justify-center p-3 md:landscape:h-[46dvh]">
            <motion.div
              key={state.index}
              initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
              animate={{ scale: solved ? 1.08 : 1, rotate: state.index % 2 ? 4 : -4, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
              className="h-full"
            >
              <Sticker concept={concept} className="h-full w-auto object-contain" />
            </motion.div>
            <button
              type="button"
              className="btn-chunky btn-icon absolute right-2 bottom-2 bg-sky"
              onClick={() => say(spokenText(term), speechLang)}
              aria-label={t("common.listen")}
            >
              🔊
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-ink-soft">
            <Mascot mood={solved ? "cheer" : state.phase === "wrong" ? "oops" : "think"} className="w-12 shrink-0" />
            <p className="text-center font-bold">
              {solved ? (
                <span className="text-correct">{t("build.great")}</span>
              ) : (
                <>
                  {t("build.prompt")}{" "}
                  <span className="whitespace-nowrap">
                    <Reading term={term} className="mr-1 text-ink" />
                    {localeMeta[native].flag} {termOf(concept, native).text}
                  </span>
                </>
              )}
            </p>
          </div>
          {!canHear && <p className="text-center text-sm text-ink-soft">{t("listen.noVoice")}</p>}
        </div>

        <div className="flex flex-col gap-5">
          {/* Slots */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-live="polite">
            {rows.map((row, r) => (
              <div key={r} className="flex gap-1.5">
                {row.map((piece, p) => {
                  const i = rowStart[r] + p;
                  const done = i < state.filled;
                  return (
                    <motion.span
                      key={i}
                      animate={done ? { scale: [1.25, 1] } : { scale: 1 }}
                      className={`flex h-14 min-w-12 items-center justify-center rounded-2xl border-[3px] px-1.5 font-display text-3xl font-extrabold sm:h-16 sm:min-w-14 ${
                        done
                          ? solved
                            ? "border-outline bg-correct"
                            : "border-outline bg-surface"
                          : i === state.filled
                            ? "border-dashed border-sky bg-surface"
                            : "border-dashed border-ink-soft/40"
                      }`}
                    >
                      {done ? piece : ""}
                    </motion.span>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Tiles */}
          <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 sm:gap-3">
            {round.tiles.map((tile, i) => (
              <motion.button
                key={`${state.index}-${tile.key}`}
                type="button"
                disabled={tile.used || state.phase !== "playing"}
                onClick={() => tap(i)}
                initial={{ y: 16, opacity: 0 }}
                animate={
                  state.wrongTile === i
                    ? { x: [0, -8, 8, -5, 5, 0], opacity: 1, y: 0 }
                    : i === hint
                      ? { scale: [1, 1.12, 1], opacity: 1, y: 0 }
                      : { opacity: tile.used ? 0 : 1, y: 0, scale: 1 }
                }
                transition={i === hint ? { repeat: Infinity, duration: 0.9 } : undefined}
                className={`btn-chunky min-h-16 font-display text-3xl sm:min-h-20 ${
                  state.wrongTile === i ? "bg-wrong" : i === hint ? "bg-yellow" : "bg-surface text-ink"
                } disabled:opacity-100`}
                aria-hidden={tile.used}
              >
                {tile.text}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <QuitModal open={quitOpen} onClose={() => setQuitOpen(false)} onQuit={onQuit} />
    </div>
  );
}
