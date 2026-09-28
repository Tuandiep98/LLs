"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Mascot, type MascotMood } from "@/components/Mascot";
import { getConcept, spokenText, termOf } from "@/content";
import { localeMeta } from "@/i18n/config";
import { useAudio } from "@/lib/audio";
import { CountdownRing } from "../shared/CountdownRing";
import {
  NextButton,
  QuitModal,
  QuizTopBar,
  screenShell,
  useFeedbackText,
} from "../shared/quiz/QuizChrome";
import type { QuizScreenProps } from "../shared/quiz/QuizFlow";
import { useQuizSession } from "../shared/quiz/useQuizSession";
import { Reading } from "../shared/Reading";
import { Sticker } from "../shared/Sticker";

/** Picture Guess: see a picture, find the word (or just watch in watch mode). */
export function GameScreen({
  mode,
  rounds,
  timeLimit,
  learn,
  native,
  onFinish,
  onQuit,
}: QuizScreenProps) {
  const t = useTranslations();
  const { say } = useAudio();
  const session = useQuizSession({ mode, rounds, timeLimit, learn, onFinish });
  const {
    state,
    dispatch,
    round,
    concept,
    learnTerm,
    lastResult,
    speechLang,
    remaining,
    paused,
    setPaused,
  } = session;
  const feedback = useFeedbackText(session);

  if (!round || !concept || !learnTerm) return null;
  const nativeTerm = termOf(concept, native);

  const mood: MascotMood =
    state.phase === "question"
      ? "think"
      : mode === "watch" || lastResult?.correct
        ? "cheer"
        : "oops";

  return (
    <div className={screenShell}>
      <QuizTopBar session={session} />

      <div className="grid flex-1 content-center gap-4 md:landscape:grid-cols-2 md:landscape:items-center">
        {/* Picture */}
        <motion.div animate={session.cardControls} className="relative">
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
                      <Reading term={learnTerm} className="mr-2" />
                      {localeMeta[native].flag} {nativeTerm.text}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-chunky btn-icon bg-sky"
                    onClick={() => say(spokenText(learnTerm), speechLang)}
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
                const term = termOf(option, learn);
                const text = term.text;
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
                      onClick={(e) => session.answer(id, e.timeStamp)}
                      className={`btn-chunky min-h-20 w-full pr-12 text-xl break-words sm:min-h-24 sm:text-2xl ${tone} disabled:opacity-100`}
                    >
                      {revealed && isAnswer && <span aria-hidden>✓</span>}
                      {revealed && chosen && !isAnswer && (
                        <span aria-hidden>✗</span>
                      )}
                      <span className="flex flex-col items-center leading-tight">
                        {text}
                        <Reading term={term} className="text-sm font-bold opacity-75 sm:text-base" />
                      </span>
                    </button>
                    <button
                      type="button"
                      className="absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/10 text-lg"
                      onClick={() => say(spokenText(term), speechLang)}
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

          <NextButton session={session} />
        </div>
      </div>

      <QuitModal open={session.quitOpen} onClose={() => session.setQuitOpen(false)} onQuit={onQuit} />
    </div>
  );
}
