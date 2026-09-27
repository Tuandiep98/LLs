"use client";

import { motion, useAnimationControls } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useReducer, useRef, useState } from "react";
import { Mascot, type MascotMood } from "@/components/Mascot";
import { Modal } from "@/components/Modal";
import { getConcept, termOf } from "@/content";
import { localeMeta, type Locale } from "@/i18n/config";
import { useAudio, vibrate } from "@/lib/audio";
import { burst } from "../shared/confetti";
import { CountdownRing } from "../shared/CountdownRing";
import { Sticker } from "../shared/Sticker";
import { useCountdown } from "../shared/useCountdown";
import type { Round } from "./deck";
import {
  createGame,
  currentRound,
  reduce,
  type GameState,
  type Mode,
} from "./engine";

const REVEAL_MS = { watch: 2600, play: 3000 };

type Props = {
  mode: Mode;
  rounds: Round[];
  timeLimit: number;
  learn: Locale;
  native: Locale;
  onFinish: (state: GameState) => void;
  onQuit: () => void;
};

export function GameScreen({
  mode,
  rounds,
  timeLimit,
  learn,
  native,
  onFinish,
  onQuit,
}: Props) {
  const t = useTranslations();
  const { sfx, say } = useAudio();
  const [state, dispatch] = useReducer(reduce, undefined, () =>
    createGame(mode, rounds, timeLimit),
  );
  const [paused, setPaused] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const cardControls = useAnimationControls();
  const questionStartedAt = useRef(0);

  const round = currentRound(state);
  const concept = round ? getConcept(round.conceptId) : undefined;
  const learnTerm = concept ? termOf(concept, learn) : undefined;
  const nativeTerm = concept ? termOf(concept, native) : undefined;
  const lastResult =
    state.phase === "reveal" && mode === "play"
      ? state.results.at(-1)
      : undefined;
  const halted = paused || quitOpen;

  const remaining = useCountdown({
    seconds: timeLimit,
    running: state.phase === "question" && !halted,
    resetKey: state.index,
    onDone: () => dispatch({ type: "timeout" }),
    onSecond: (s) => s <= 3 && sfx("tick"),
  });

  // New question: remember when it started (for the speed bonus).
  useEffect(() => {
    if (state.phase === "question")
      questionStartedAt.current = performance.now();
  }, [state.phase, state.index]);

  // Reveal: say the word and give feedback.
  useEffect(() => {
    if (state.phase !== "reveal" || !learnTerm) return;
    const speakLater = window.setTimeout(
      () => say(learnTerm.text, localeMeta[learn].speechLang),
      250,
    );
    if (mode === "play") {
      const correct = state.results.at(-1)?.correct;
      if (correct) {
        sfx("correct");
        vibrate(40);
        burst(0.5, 0.35);
        void cardControls.start({
          scale: [1, 1.08, 1],
          transition: { duration: 0.45 },
        });
      } else {
        sfx("wrong");
        vibrate([30, 40, 30]);
        void cardControls.start({
          x: [0, -12, 12, -8, 8, 0],
          transition: { duration: 0.45 },
        });
      }
    } else {
      sfx("pop");
    }
    return () => window.clearTimeout(speakLater);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once per reveal
  }, [state.phase, state.index]);

  // Auto-advance after the answer has been shown.
  useEffect(() => {
    if (state.phase !== "reveal" || halted) return;
    const id = window.setTimeout(
      () => dispatch({ type: "next" }),
      REVEAL_MS[mode],
    );
    return () => window.clearTimeout(id);
  }, [state.phase, state.index, halted, mode]);

  useEffect(() => {
    if (state.phase === "done") onFinish(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once when done
  }, [state.phase]);

  if (!round || !concept || !learnTerm || !nativeTerm) return null;

  // `timeStamp` shares the performance.now() clock.
  const answer = (choiceId: string, timeStamp: number) => {
    if (state.phase !== "question") return;
    sfx("tap");
    dispatch({
      type: "answer",
      choiceId,
      ms: timeStamp - questionStartedAt.current,
    });
  };

  const mood: MascotMood =
    state.phase === "question"
      ? "think"
      : mode === "watch" || lastResult?.correct
        ? "cheer"
        : "oops";

  const feedback =
    mode === "play" && lastResult
      ? lastResult.correct
        ? t("play.correct")
        : lastResult.choiceId === null
          ? t("play.timeUp")
          : t("play.wrong")
      : null;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="btn-chunky btn-icon bg-surface text-ink"
          onClick={() => setQuitOpen(true)}
          aria-label={t("nav.close")}
        >
          ✕
        </button>
        <ProgressDots state={state} />
        {mode === "play" && (
          <div
            className="card-chunky flex items-center gap-1 px-3 py-1.5 font-display text-xl font-extrabold"
            aria-label={t("play.score")}
          >
            <span aria-hidden>⭐</span>
            {state.score}
            {state.streak >= 2 && (
              <span className="ml-1 text-base" aria-hidden>
                🔥{state.streak}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="grid flex-1 content-center gap-4 md:landscape:grid-cols-2 md:landscape:items-center">
        {/* Picture */}
        <motion.div animate={cardControls} className="relative">
          <button
            type="button"
            className="card-chunky flex h-[34dvh] min-h-44 w-full items-center justify-center overflow-visible p-4 md:landscape:h-[60dvh]"
            onClick={() =>
              mode === "watch" &&
              state.phase === "question" &&
              dispatch({ type: "timeout" })
            }
            aria-label={t("play.question")}
            tabIndex={mode === "watch" && state.phase === "question" ? 0 : -1}
          >
            <motion.div
              key={state.index}
              initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
              animate={{
                scale: 1,
                rotate: state.index % 2 ? 4 : -4,
                opacity: 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
              className="h-full"
            >
              <Sticker
                concept={concept}
                className="h-full w-auto object-contain"
              />
            </motion.div>
          </button>
          {timeLimit > 0 && state.phase === "question" && (
            <div className="absolute -top-3 right-1">
              <CountdownRing
                remainingMs={remaining}
                totalMs={timeLimit * 1000}
              />
            </div>
          )}
        </motion.div>

        <div className="flex flex-col gap-4">
          {/* Word / prompt */}
          <div className="flex min-h-24 items-center gap-3">
            <Mascot mood={mood} className="w-20 shrink-0 sm:w-24" />
            <div
              className="card-chunky relative flex min-h-20 flex-1 flex-col justify-center px-4 py-2"
              aria-live="polite"
            >
              {state.phase === "question" ? (
                <p className="font-display text-2xl font-extrabold sm:text-3xl">
                  {t("play.question")}
                </p>
              ) : (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-1">
                    {feedback && (
                      <p
                        className={`text-sm font-bold ${lastResult?.correct ? "text-correct" : "text-wrong"}`}
                      >
                        {feedback}
                      </p>
                    )}
                    <p className="font-display text-3xl leading-tight font-extrabold break-words sm:text-4xl">
                      {learnTerm.text}
                    </p>
                    <p className="text-ink-soft">
                      {learnTerm.reading && (
                        <span className="mr-2">{learnTerm.reading}</span>
                      )}
                      {localeMeta[native].flag} {nativeTerm.text}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-chunky btn-icon bg-sky"
                    onClick={() =>
                      say(learnTerm.text, localeMeta[learn].speechLang)
                    }
                    aria-label={t("common.listen")}
                  >
                    🔊
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          {mode === "play" ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {round.options.map((id) => {
                const option = getConcept(id);
                if (!option) return null;
                const text = termOf(option, learn).text;
                const isAnswer = id === round.conceptId;
                const chosen = lastResult?.choiceId === id;
                const revealed = state.phase === "reveal";
                const tone = !revealed
                  ? "bg-surface text-ink"
                  : isAnswer
                    ? "bg-correct"
                    : chosen
                      ? "bg-wrong"
                      : "bg-surface text-ink opacity-50";
                return (
                  <motion.div
                    key={`${state.index}-${id}`}
                    className="relative"
                    initial={{ y: 16, opacity: 0 }}
                    animate={
                      revealed && isAnswer
                        ? { y: 0, opacity: 1, scale: [1, 1.07, 1] }
                        : revealed && chosen
                          ? { y: 0, opacity: 1, x: [0, -8, 8, -5, 5, 0] }
                          : { y: 0, opacity: 1 }
                    }
                  >
                    <button
                      type="button"
                      disabled={revealed}
                      onClick={(e) => answer(id, e.timeStamp)}
                      className={`btn-chunky min-h-20 w-full pr-12 text-xl break-words sm:min-h-24 sm:text-2xl ${tone} disabled:opacity-100`}
                    >
                      {revealed && isAnswer && <span aria-hidden>✓</span>}
                      {revealed && chosen && !isAnswer && (
                        <span aria-hidden>✗</span>
                      )}
                      {text}
                    </button>
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/10 text-lg"
                      onClick={() => say(text, localeMeta[learn].speechLang)}
                      aria-label={`${t("common.listen")}: ${text}`}
                    >
                      🔊
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                className="btn-chunky btn-icon bg-surface text-ink"
                onClick={() => dispatch({ type: "prev" })}
                disabled={state.index === 0}
                aria-label={t("common.prev")}
              >
                ⏮
              </button>
              <button
                type="button"
                className="btn-chunky btn-icon h-20 w-20 bg-yellow text-3xl"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? t("common.play") : t("common.pause")}
              >
                {paused ? "▶" : "⏸"}
              </button>
              <button
                type="button"
                className="btn-chunky btn-icon bg-surface text-ink"
                onClick={() => dispatch({ type: "next" })}
                aria-label={t("common.next")}
              >
                ⏭
              </button>
            </div>
          )}

          {mode === "play" && state.phase === "reveal" && (
            <button
              type="button"
              className="btn-chunky relative w-full overflow-hidden bg-yellow"
              onClick={() => dispatch({ type: "next" })}
            >
              {!halted && (
                <span
                  key={state.index}
                  className="absolute inset-y-0 left-0 bg-black/10"
                  style={{
                    animation: `lls-fill ${REVEAL_MS.play}ms linear forwards`,
                  }}
                  aria-hidden
                />
              )}
              <span className="relative">{t("common.next")} ➜</span>
            </button>
          )}
        </div>
      </div>

      <Modal
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        title={t("play.quitTitle")}
      >
        <div className="flex flex-col items-center gap-4">
          <Mascot mood="oops" className="w-32" />
          <div className="grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              className="btn-chunky bg-surface text-ink"
              onClick={onQuit}
            >
              {t("play.quitYes")}
            </button>
            <button
              type="button"
              className="btn-chunky bg-green"
              onClick={() => setQuitOpen(false)}
            >
              {t("play.quitNo")}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ProgressDots({ state }: { state: GameState }) {
  const t = useTranslations("play");
  return (
    <div
      className="flex flex-1 flex-wrap items-center justify-center gap-1.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={state.rounds.length}
      aria-valuenow={state.index + 1}
      aria-label={t("progress", {
        current: state.index + 1,
        total: state.rounds.length,
      })}
    >
      {state.rounds.map((r, i) => {
        const result = state.mode === "play" ? state.results[i] : undefined;
        const color = result
          ? result.correct
            ? "bg-correct"
            : "bg-wrong"
          : i < state.index || (i === state.index && state.phase === "reveal")
            ? "bg-sky"
            : "bg-surface";
        return (
          <span
            key={r.conceptId + i}
            className={`h-3.5 rounded-full border-2 border-outline transition-all ${color} ${i === state.index ? "w-7" : "w-3.5"}`}
          />
        );
      })}
    </div>
  );
}
