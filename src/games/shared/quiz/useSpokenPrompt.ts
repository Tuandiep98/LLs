"use client";

import { useEffect, useState } from "react";
import { useAudio, useCanHear } from "@/lib/audio";

/**
 * For games where the question is a word read aloud (Listen & Pick, True or False,
 * Balloon Pop): reads the word when a question appears and tells the quiz session
 * when the countdown may start (after reading, or at once when there is no voice).
 */
export function useSpokenPrompt(speechLang: () => string) {
  const { say } = useAudio();
  const canHear = useCanHear();
  const [readyIndex, setReadyIndex] = useState(-1);
  const [speaking, setSpeaking] = useState(false);

  const read = (index: number, text: string) => {
    setSpeaking(true);
    say(text, speechLang(), () => {
      setSpeaking(false);
      setReadyIndex(index);
    });
  };

  return {
    canHear,
    speaking,
    read,
    isTimerReady: (index: number) => !canHear || readyIndex === index,
  };
}

/** Reads `text` shortly after question `index` appears. */
export function useReadOnQuestion(
  prompt: ReturnType<typeof useSpokenPrompt>,
  isQuestion: boolean,
  index: number,
  text: string | undefined,
) {
  useEffect(() => {
    if (!isQuestion || !text || !prompt.canHear) return;
    const id = window.setTimeout(() => prompt.read(index, text), 450);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per question
  }, [index, isQuestion]);
}
