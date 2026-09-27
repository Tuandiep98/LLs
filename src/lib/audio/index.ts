"use client";

import { useCallback } from "react";
import { useSettings } from "../settings";
import { playSfx, type Sfx } from "./sfx";
import { speak } from "./speech";

/** Sound helpers that respect the sound/voice settings. */
export function useAudio() {
  const sound = useSettings((s) => s.sound);
  const voice = useSettings((s) => s.voice);
  const sfx = useCallback((name: Sfx) => sound && playSfx(name), [sound]);
  const say = useCallback((text: string, lang: string) => voice && speak(text, lang), [voice]);
  return { sfx, say, soundOn: sound, voiceOn: voice };
}

export { vibrate } from "./sfx";
export { canSpeak, stopSpeaking } from "./speech";
