"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Mascot, type MascotMood } from "@/components/Mascot";
import { getConcept, termOf } from "@/content";
import { localeMeta } from "@/i18n/config";
import { useAudio, useCanHear } from "@/lib/audio";
import { CountdownRing } from "../shared/CountdownRing";
import { NextButton, QuitModal, QuizTopBar, screenShell, useFeedbackText } from "../shared/quiz/QuizChrome";
import type { QuizScreenProps } from "../shared/quiz/QuizFlow";
import { useQuizSession } from "../shared/quiz/useQuizSession";
import { Sticker } from "../shared/Sticker";

/**
 * Listen & Pick: hear a word, tap the matching picture. Made for kids who
 * can't read yet. The countdown starts only after the word has been read.
 * Without a voice (turned off / not supported) the word is shown instead.
 */
export function ListenScreen({ mode, rounds, timeLimit, learn, native, onFinish, onQuit }: QuizScreenProps) {
  const t = useTranslations();
  const { say } = useAudio();
  const canHear = useCanHear();
  const [readyIndex, setReadyIndex] = useState(-1);
  const [speaking, setSpeaking] = useState(false);

  const session = useQuizSession({
    mode,
    rounds,
    timeLimit,
    learn,
    onFinish,
    isTimerReady: (index) => !canHear || readyIndex === index,
  });
  const { state, round, concept, learnTerm, lastResult, speechLang, remaining } = session;
  const feedback = useFeedbackText(session);
  const ready = !canHear || readyIndex === state.index;

  const play = (index: number, text: string) => {
    setSpeaking(true);
    say(text, speechLang, () => {
      setSpeaking(false);
      setReadyIndex(index);
    });
  };

  // Read the word when a new question appears.
  const isQuestion = state.phase === "question";
  useEffect(() => {
    if (!isQuestion || !learnTerm || !canHear) return;
    const id = window.setTimeout(() => play(state.index, learnTerm.text), 450);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per question
  }, [state.index, isQuestion]);

  if (!round || !concept || !learnTerm) return null;
  const nativeTerm = termOf(concept, native);
  const revealed = state.phase === "reveal";
  const mood: MascotMood = !revealed ? (speaking ? "cheer" : "think") : lastResult?.correct ? "cheer" : "oops";

  return (
    <div className={screenShell}>
      <QuizTopBar session={session} />

      <div className="grid flex-1 content-center gap-4 md:landscape:grid-cols-[2fr_3fr] md:landscape:items-center">
        {/* Prompt: big speaker button */}
        <div className="flex flex-col gap-3">
          <div className="card-chunky relative flex items-center gap-4 p-4">
            <motion.button
              type="button"
              onClick={() => play(state.index, learnTerm.text)}
              className="btn-chunky h-24 w-24 shrink-0 rounded-full bg-sky p-0 text-5xl sm:h-28 sm:w-28"
              animate={speaking ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={speaking ? { repeat: Infinity, duration: 0.8 } : undefined}
              aria-label={t("listen.replay")}
            >
              🔊
            </motion.button>
            <div className="min-w-0 flex-1" aria-live="polite">
              {!revealed ? (
                <>
                  <p className="font-display text-xl leading-tight font-extrabold sm:text-2xl">{t("listen.prompt")}</p>
                  {!canHear && (
                    <p className="font-display mt-1 text-3xl font-extrabold break-words">{learnTerm.text}</p>
                  )}
                  {canHear && <p className="text-sm text-ink-soft">{t("listen.replay")}</p>}
                </>
              ) : (
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                  {feedback && (
                    <p className={`text-sm font-bold ${lastResult?.correct ? "text-correct" : "text-wrong"}`}>{feedback}</p>
                  )}
                  <p className="font-display text-3xl leading-tight font-extrabold break-words">{learnTerm.text}</p>
                  <p className="text-ink-soft">
                    {learnTerm.reading && <span className="mr-2">{learnTerm.reading}</span>}
                    {localeMeta[native].flag} {nativeTerm.text}
                  </p>
                </motion.div>
              )}
            </div>
            {timeLimit > 0 && !revealed && ready && (
              <div className="absolute -top-4 -right-2">
                <CountdownRing remainingMs={remaining} totalMs={timeLimit * 1000} size={60} />
              </div>
            )}
          </div>
          <Mascot mood={mood} className="mx-auto hidden w-32 md:landscape:block" />
        </div>

        {/* Picture choices */}
        <div className="flex flex-col gap-3">
          <motion.div animate={session.cardControls} className="grid grid-cols-2 gap-3 sm:gap-4">
            {round.options.map((id, i) => {
              const option = getConcept(id);
              if (!option) return null;
              const isAnswer = id === round.conceptId;
              const chosen = lastResult?.choiceId === id;
              const tone = !revealed
                ? "bg-surface"
                : isAnswer
                  ? "bg-correct"
                  : chosen
                    ? "bg-wrong"
                    : "bg-surface opacity-40";
              return (
                <motion.button
                  key={`${state.index}-${id}`}
                  type="button"
                  disabled={revealed}
                  onClick={(e) => session.answer(id, e.timeStamp)}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={
                    revealed && isAnswer
                      ? { scale: [1, 1.08, 1], opacity: 1 }
                      : revealed && chosen
                        ? { x: [0, -8, 8, -5, 5, 0], opacity: 1, scale: 1 }
                        : { scale: 1, opacity: 1 }
                  }
                  transition={{ delay: revealed ? 0 : i * 0.06 }}
                  className={`btn-chunky relative h-[19dvh] min-h-32 flex-col gap-1 p-2 disabled:opacity-100 md:landscape:h-[32dvh] ${tone}`}
                  aria-label={revealed ? termOf(option, learn).text : `${i + 1}`}
                >
                  <Sticker concept={option} tilt={i % 2 ? 4 : -4} className="h-full max-h-full min-h-0 w-auto flex-1 object-contain" />
                  {revealed && (
                    <span className="text-base leading-tight break-words sm:text-lg">{termOf(option, learn).text}</span>
                  )}
                  {revealed && (isAnswer || chosen) && (
                    <span className="absolute -top-3 -right-3 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-outline bg-surface text-xl text-ink" aria-hidden>
                      {isAnswer ? "✓" : "✗"}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
          <NextButton session={session} />
        </div>
      </div>

      <QuitModal open={session.quitOpen} onClose={() => session.setQuitOpen(false)} onQuit={onQuit} />
    </div>
  );
}
