"use client";

import { useCallback } from "react";
import { useSettings } from "../settings";
import { playSfx, type Sfx } from "./sfx";
import { canSpeak, speak } from "./speech";

/** Sound helpers that respect the sound/voice settings. */
export function useAudio() {
  const sound = useSettings((s) => s.sound);
  const voice = useSettings((s) => s.voice);
  const sfx = useCallback((name: Sfx) => sound && playSfx(name), [sound]);
  const say = useCallback(
    (text: string, lang: string, onEnd?: () => void) => {
      if (voice) return speak(text, lang, { onEnd });
      onEnd?.();
      return false;
    },
    [voice],
  );
  return { sfx, say, soundOn: sound, voiceOn: voice };
}

export { vibrate } from "./sfx";
export { canSpeak, stopSpeaking } from "./speech";

/** True when words can actually be heard (voice on and supported). */
export function useCanHear() {
  const voice = useSettings((s) => s.voice);
  return voice && canSpeak();
}
