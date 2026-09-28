"use client";

import { useEffect, useState } from "react";
import { spokenText } from "@/content";
import type { Term } from "@/content/schema";
import { useAudio, useCanHear } from "@/lib/audio";

/**
 * For games where the question is a word read aloud (Listen & Pick, True or False,
 * Balloon Pop): reads the word when a question appears and tells the quiz session
 * when the countdown may start (after reading, or at once when there is no voice
 * for the language — then the screens show the word instead).
 */
export function useSpokenPrompt(speechLang: string) {
  const { say } = useAudio();
  const canHear = useCanHear(speechLang);
  const [readyIndex, setReadyIndex] = useState(-1);
  const [speaking, setSpeaking] = useState(false);

  const read = (index: number, term: Term) => {
    setSpeaking(true);
    say(spokenText(term), speechLang, () => {
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

/** Reads `term` shortly after question `index` appears. */
export function useReadOnQuestion(
  prompt: ReturnType<typeof useSpokenPrompt>,
  isQuestion: boolean,
  index: number,
  term: Term | undefined,
) {
  useEffect(() => {
    if (!isQuestion || !term || !prompt.canHear) return;
    const id = window.setTimeout(() => prompt.read(index, term), 450);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per question
  }, [index, isQuestion]);
}
