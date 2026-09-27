"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useMemo, type CSSProperties } from "react";
import { Mascot, type MascotMood } from "@/components/Mascot";
import { getConcept, termOf } from "@/content";
import { localeMeta } from "@/i18n/config";
import { CountdownRing } from "../shared/CountdownRing";
import { NextButton, QuitModal, QuizTopBar, screenShell, useFeedbackText } from "../shared/quiz/QuizChrome";
import type { QuizScreenProps } from "../shared/quiz/QuizFlow";
import { useQuizSession } from "../shared/quiz/useQuizSession";
import { useReadOnQuestion, useSpokenPrompt } from "../shared/quiz/useSpokenPrompt";
import { Balloon } from "./Balloon";

const COLORS = ["var(--orange)", "var(--sky)", "var(--yellow)", "var(--grape)", "var(--green)", "var(--red)"];
const RISE_SECONDS = 8;

/**
 * Balloon Pop: hear a word, pop the balloon carrying its picture. Balloons float up
 * in four lanes and loop until one is tapped. With reduced motion they stay still.
 */
export function BalloonScreen({ mode, rounds, timeLimit, learn, native, onFinish, onQuit }: QuizScreenProps) {
  const t = useTranslations();
  const prompt = useSpokenPrompt(() => localeMeta[learn].speechLang);
  const session = useQuizSession({ mode, rounds, timeLimit, learn, onFinish, isTimerReady: prompt.isTimerReady });
  const { state, round, concept, learnTerm, lastResult, remaining, halted } = session;
  const feedback = useFeedbackText(session);
  useReadOnQuestion(prompt, state.phase === "question", state.index, learnTerm?.text);

  // Per-round random speeds and starting heights, so balloons don't move in lockstep.
  const lanes = useMemo(
    () =>
      (round?.options ?? []).map((_, i) => {
        const rise = RISE_SECONDS + ((state.index * 7 + i * 3) % 5) * 0.4;
        const order = (i * 3 + state.index) % 4; // a different height for each lane
        return {
          rise,
          delay: -(order / 4) * rise - 0.3,
          staticTop: `${8 + order * 14}%`,
          color: COLORS[(i + state.index * 2) % COLORS.length],
        };
      }),
    [round, state.index],
  );

  if (!round || !concept || !learnTerm) return null;
  const nativeTerm = termOf(concept, native);
  const revealed = state.phase === "reveal";
  const mood: MascotMood = !revealed ? (prompt.speaking ? "cheer" : "think") : lastResult?.correct ? "cheer" : "oops";

  return (
    <div className={screenShell}>
      <QuizTopBar session={session} />

      {/* Word prompt */}
      <div className="card-chunky relative flex items-center gap-3 p-3 sm:p-4">
        <motion.button
          type="button"
          onClick={() => prompt.read(state.index, learnTerm.text)}
          className="btn-chunky h-16 w-16 shrink-0 rounded-full bg-sky p-0 text-3xl sm:h-20 sm:w-20 sm:text-4xl"
          animate={prompt.speaking ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={prompt.speaking ? { repeat: Infinity, duration: 0.8 } : undefined}
          aria-label={t("listen.replay")}
        >
          🔊
        </motion.button>
        <div className={`min-w-0 flex-1 ${timeLimit > 0 ? "pr-8 sm:pr-0" : ""}`} aria-live="polite">
          {!revealed ? (
            <>
              <p className="font-display text-lg leading-tight font-extrabold sm:text-2xl">{t("balloon.prompt")}</p>
              {!prompt.canHear && (
                <p className="font-display text-2xl font-extrabold break-words sm:text-3xl">{learnTerm.text}</p>
              )}
            </>
          ) : (
            <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              {feedback && (
                <p className={`text-sm font-bold ${lastResult?.correct ? "text-correct" : "text-wrong"}`}>{feedback}</p>
              )}
              <p className="font-display text-2xl leading-tight font-extrabold break-words sm:text-3xl">{learnTerm.text}</p>
              <p className="text-sm text-ink-soft">
                {learnTerm.reading && <span className="mr-2">{learnTerm.reading}</span>}
                {localeMeta[native].flag} {nativeTerm.text}
              </p>
            </motion.div>
          )}
        </div>
        <Mascot mood={mood} className="hidden w-20 shrink-0 sm:block" />
        {timeLimit > 0 && !revealed && prompt.isTimerReady(state.index) && (
          <div className="absolute -top-4 -right-2">
            <CountdownRing remainingMs={remaining} totalMs={timeLimit * 1000} size={60} />
          </div>
        )}
      </div>

      {/* Sky with rising balloons */}
      <motion.div
        animate={session.cardControls}
        className={`card-chunky relative min-h-[46dvh] flex-1 overflow-hidden ${revealed || halted ? "balloons-paused" : ""}`}
        style={{ background: "linear-gradient(to bottom, color-mix(in srgb, var(--sky) 35%, var(--surface)), var(--surface))" }}
      >
        <span className="absolute top-[12%] left-[8%] text-5xl opacity-60" aria-hidden>
          ☁️
        </span>
        <span className="absolute top-[40%] right-[6%] text-4xl opacity-50" aria-hidden>
          ☁️
        </span>
        {round.options.map((id, i) => {
          const option = getConcept(id);
          if (!option) return null;
          const lane = lanes[i];
          const isAnswer = id === round.conceptId;
          const chosen = lastResult?.choiceId === id;
          return (
            <div
              key={`${state.index}-${id}`}
              className="balloon-lane w-[23%] max-w-40"
              style={
                {
                  left: `${1 + i * 25}%`,
                  "--rise": `${lane.rise}s`,
                  "--delay": `${lane.delay}s`,
                  "--static-top": lane.staticTop,
                } as CSSProperties
              }
            >
              <div className="balloon-sway">
                <motion.button
                  type="button"
                  disabled={revealed}
                  onClick={(e) => session.answer(id, e.timeStamp)}
                  className="relative block w-full cursor-pointer touch-manipulation disabled:cursor-default"
                  animate={
                    revealed && isAnswer
                      ? { scale: 1.18, opacity: 1 }
                      : revealed && chosen
                        ? { scale: [1, 1.35, 0], opacity: [1, 1, 0] }
                        : revealed
                          ? { opacity: 0.25, scale: 1 }
                          : { scale: 1, opacity: 1 }
                  }
                  transition={{ duration: 0.35 }}
                  aria-label={revealed ? termOf(option, learn).text : `${i + 1}`}
                >
                  <Balloon concept={option} color={lane.color} />
                  {revealed && isAnswer && (
                    <span className="absolute -top-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-outline bg-correct text-lg" aria-hidden>
                      ✓
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          );
        })}
      </motion.div>

      <NextButton session={session} />
      <QuitModal open={session.quitOpen} onClose={() => session.setQuitOpen(false)} onQuit={onQuit} />
    </div>
  );
}
