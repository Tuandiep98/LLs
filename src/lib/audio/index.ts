"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useSettings } from "../settings";
import { playSfx, type Sfx } from "./sfx";
import { getVoices, hasVoiceFor, speak, subscribeVoices } from "./speech";

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

const NO_VOICES: SpeechSynthesisVoice[] = [];

/** Whether this device has a voice for `lang` (re-checks when voices finish loading). */
export function useHasVoice(lang: string) {
  const voices = useSyncExternalStore(subscribeVoices, getVoices, () => NO_VOICES);
  return hasVoiceFor(lang, voices);
}

/** True when words in `lang` can actually be heard (voice on and a voice for the language). */
export function useCanHear(lang: string) {
  const voice = useSettings((s) => s.voice);
  const hasVoice = useHasVoice(lang);
  return voice && hasVoice;
}
