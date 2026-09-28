"use client";

import { useAnimationControls } from "motion/react";
import { useEffect, useReducer, useRef, useState } from "react";
import { getConcept, spokenText, termOf } from "@/content";
import { localeMeta, type Locale } from "@/i18n/config";
import { useAudio, vibrate } from "@/lib/audio";
import { burst } from "../confetti";
import { useCountdown } from "../useCountdown";
import type { Round } from "./deck";
import { createGame, currentRound, reduce, type GameState, type Mode } from "./engine";

export const REVEAL_MS = { watch: 2600, play: 3000 };

type Options = {
  mode: Mode;
  rounds: Round[];
  timeLimit: number;
  learn: Locale;
  onFinish: (state: GameState) => void;
  /** Return false to keep the countdown waiting (e.g. until the word has been read aloud). */
  isTimerReady?: (index: number) => boolean;
};

/**
 * Everything a quiz screen shares: the engine, countdown, pause/quit,
 * answer timing, reveal feedback (sound, voice, confetti, card shake),
 * auto-advance and finishing. Screens only decide how to draw it.
 */
export function useQuizSession({ mode, rounds, timeLimit, learn, onFinish, isTimerReady }: Options) {
  const { sfx, say } = useAudio();
  const [state, dispatch] = useReducer(reduce, undefined, () => createGame(mode, rounds, timeLimit));
  const [paused, setPaused] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const cardControls = useAnimationControls();
  const questionStartedAt = useRef(0);

  const round = currentRound(state);
  const concept = round ? getConcept(round.conceptId) : undefined;
  const learnTerm = concept ? termOf(concept, learn) : undefined;
  const lastResult = state.phase === "reveal" && mode === "play" ? state.results.at(-1) : undefined;
  const halted = paused || quitOpen;
  const timerReady = isTimerReady ? isTimerReady(state.index) : true;
  const speechLang = localeMeta[learn].speechLang;

  const remaining = useCountdown({
    seconds: timeLimit,
    running: state.phase === "question" && !halted && timerReady,
    resetKey: state.index,
    onDone: () => dispatch({ type: "timeout" }),
    onSecond: (s) => s <= 3 && sfx("tick"),
  });

  // The speed bonus counts from when the question is ready to answer.
  useEffect(() => {
    if (state.phase === "question" && timerReady) questionStartedAt.current = performance.now();
  }, [state.phase, state.index, timerReady]);

  // Reveal: say the word and give feedback.
  useEffect(() => {
    if (state.phase !== "reveal" || !learnTerm) return;
    const speakLater = window.setTimeout(() => say(spokenText(learnTerm), speechLang), 250);
    if (mode === "play") {
      if (state.results.at(-1)?.correct) {
        sfx("correct");
        vibrate(40);
        burst(0.5, 0.35);
        void cardControls.start({ scale: [1, 1.08, 1], transition: { duration: 0.45 } });
      } else {
        sfx("wrong");
        vibrate([30, 40, 30]);
        void cardControls.start({ x: [0, -12, 12, -8, 8, 0], transition: { duration: 0.45 } });
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
    const id = window.setTimeout(() => dispatch({ type: "next" }), REVEAL_MS[mode]);
    return () => window.clearTimeout(id);
  }, [state.phase, state.index, halted, mode]);

  useEffect(() => {
    if (state.phase === "done") onFinish(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once when done
  }, [state.phase]);

  // `timeStamp` (from the click event) shares the performance.now() clock.
  const answer = (choiceId: string, timeStamp: number) => {
    if (state.phase !== "question") return;
    sfx("tap");
    dispatch({ type: "answer", choiceId, ms: Math.max(0, timeStamp - questionStartedAt.current) });
  };

  return {
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
    quitOpen,
    setQuitOpen,
    halted,
    cardControls,
    answer,
  };
}

export type QuizSession = ReturnType<typeof useQuizSession>;
