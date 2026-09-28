"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Mascot, type MascotMood } from "@/components/Mascot";
import { getConcept, termOf } from "@/content";
import { localeMeta } from "@/i18n/config";
import { CountdownRing } from "../shared/CountdownRing";
import { trueFalseChoice } from "../shared/quiz/deck";
import { NextButton, QuitModal, QuizTopBar, screenShell, useFeedbackText } from "../shared/quiz/QuizChrome";
import type { QuizScreenProps } from "../shared/quiz/QuizFlow";
import { useQuizSession } from "../shared/quiz/useQuizSession";
import { useReadOnQuestion, useSpokenPrompt } from "../shared/quiz/useSpokenPrompt";
import { Reading } from "../shared/Reading";
import { Sticker } from "../shared/Sticker";

/**
 * True or False: a picture and a word (read aloud). Is it the right word?
 * Two big buttons, so even kids who can't read can play. The countdown starts
 * after the word has been read.
 */
export function TrueFalseScreen({ mode, rounds, timeLimit, learn, native, onFinish, onQuit }: QuizScreenProps) {
  const t = useTranslations();
  const prompt = useSpokenPrompt(localeMeta[learn].speechLang);
  const { speaking, read } = prompt;
  const session = useQuizSession({ mode, rounds, timeLimit, learn, onFinish, isTimerReady: prompt.isTimerReady });
  const { state, round, concept, learnTerm, lastResult, remaining } = session;
  const feedback = useFeedbackText(session);
  const shownConcept = round ? getConcept(round.shown ?? round.conceptId) : undefined;
  const shownTerm = shownConcept ? termOf(shownConcept, learn) : undefined;

  useReadOnQuestion(prompt, state.phase === "question", state.index, shownTerm);

  if (!round || !concept || !learnTerm || !shownTerm) return null;
  const revealed = state.phase === "reveal";
  const shownWasRight = (round.shown ?? round.conceptId) === round.conceptId;
  const pickedYes = revealed && lastResult?.choiceId === trueFalseChoice(round, true) && lastResult.choiceId !== null;
  const pickedNo = revealed && lastResult?.choiceId === trueFalseChoice(round, false) && lastResult.choiceId !== null;
  const mood: MascotMood = !revealed ? (speaking ? "cheer" : "think") : lastResult?.correct ? "cheer" : "oops";
  const nativeTerm = termOf(concept, native);

  const choiceButton = (yes: boolean) => {
    const picked = yes ? pickedYes : pickedNo;
    const isRight = yes === shownWasRight;
    const tone = !revealed
      ? yes
        ? "bg-green"
        : "bg-red"
      : isRight
        ? "bg-correct"
        : picked
          ? "bg-wrong"
          : "bg-surface text-ink opacity-40";
    return (
      <motion.button
        key={`${state.index}-${yes}`}
        type="button"
        disabled={revealed}
        onClick={(e) => session.answer(trueFalseChoice(round, yes), e.timeStamp)}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={
          revealed && isRight
            ? { scale: [1, 1.08, 1], opacity: 1 }
            : revealed && picked
              ? { x: [0, -8, 8, -5, 5, 0], opacity: 1, scale: 1 }
              : { scale: 1, opacity: 1 }
        }
        className={`btn-chunky relative min-h-28 flex-1 flex-col gap-0 py-3 disabled:opacity-100 sm:min-h-32 ${tone}`}
      >
        <span className="text-6xl leading-none" aria-hidden>
          {yes ? "✓" : "✗"}
        </span>
        <span className="text-xl">{yes ? t("tf.yes") : t("tf.no")}</span>
      </motion.button>
    );
  };

  return (
    <div className={screenShell}>
      <QuizTopBar session={session} />

      <div className="grid flex-1 content-center gap-4 md:landscape:grid-cols-2 md:landscape:items-center">
        {/* Picture */}
        <motion.div animate={session.cardControls} className="relative">
          <div className="card-chunky flex h-[32dvh] min-h-44 w-full items-center justify-center p-4 md:landscape:h-[60dvh]">
            <motion.div
              key={state.index}
              initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: state.index % 2 ? 4 : -4, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 16 }}
              className="h-full"
            >
              <Sticker concept={concept} className="h-full w-auto object-contain" />
            </motion.div>
          </div>
          {timeLimit > 0 && !revealed && prompt.isTimerReady(state.index) && (
            <div className="absolute -top-3 right-1">
              <CountdownRing remainingMs={remaining} totalMs={timeLimit * 1000} />
            </div>
          )}
        </motion.div>

        <div className="flex flex-col gap-4">
          {/* Word being asked about */}
          <div className="flex items-center gap-3">
            <Mascot mood={mood} className="w-20 shrink-0 sm:w-24" />
            <div className="card-chunky flex min-h-24 flex-1 items-center gap-3 px-4 py-2" aria-live="polite">
              <div className="min-w-0 flex-1">
                {!revealed ? (
                  <>
                    <p className="text-sm font-bold text-ink-soft">{t("tf.prompt")}</p>
                    <p className="font-display text-3xl leading-tight font-extrabold break-words sm:text-4xl">
                      {shownTerm.text}
                    </p>
                    <Reading term={shownTerm} className="block text-lg font-bold text-ink-soft" />
                  </>
                ) : (
                  <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    {feedback && (
                      <p className={`text-sm font-bold ${lastResult?.correct ? "text-correct" : "text-wrong"}`}>{feedback}</p>
                    )}
                    {!shownWasRight && (
                      <p className="text-ink-soft line-through decoration-2">{shownTerm.text}</p>
                    )}
                    <p className="font-display text-3xl leading-tight font-extrabold break-words">
                      {!shownWasRight && <span className="text-base font-bold">{t("play.answerIs")} </span>}
                      {learnTerm.text}
                    </p>
                    <p className="text-ink-soft">
                      <Reading term={learnTerm} className="mr-2" />
                      {localeMeta[native].flag} {nativeTerm.text}
                    </p>
                  </motion.div>
                )}
              </div>
              <motion.button
                type="button"
                onClick={() => read(state.index, revealed ? learnTerm : shownTerm)}
                className="btn-chunky btn-icon shrink-0 bg-sky"
                animate={speaking ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                transition={speaking ? { repeat: Infinity, duration: 0.8 } : undefined}
                aria-label={t("common.listen")}
              >
                🔊
              </motion.button>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4">
            {choiceButton(true)}
            {choiceButton(false)}
          </div>

          <NextButton session={session} />
        </div>
      </div>

      <QuitModal open={session.quitOpen} onClose={() => session.setQuitOpen(false)} onQuit={onQuit} />
    </div>
  );
}
