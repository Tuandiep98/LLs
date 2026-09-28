"use client";

let voicesCache: SpeechSynthesisVoice[] = [];
const voiceListeners = new Set<() => void>();

function loadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  voicesCache = window.speechSynthesis.getVoices();
  voiceListeners.forEach((l) => l());
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** For useSyncExternalStore: voices load asynchronously in most browsers. */
export function subscribeVoices(onChange: () => void) {
  voiceListeners.add(onChange);
  return () => {
    voiceListeners.delete(onChange);
  };
}

export function getVoices() {
  return voicesCache;
}

function pickVoice(lang: string, voices = voicesCache) {
  const base = lang.split("-")[0];
  const matches = voices.filter((v) => v.lang.replace("_", "-").startsWith(base));
  return (
    matches.find((v) => v.lang.replace("_", "-") === lang && v.localService) ??
    matches.find((v) => v.lang.replace("_", "-") === lang) ??
    matches[0]
  );
}

/**
 * Whether the device can read `lang` aloud. An empty voice list means "not known yet"
 * (still loading, or a browser that never lists voices), so we give it a try.
 */
export function hasVoiceFor(lang: string, voices = voicesCache) {
  if (!canSpeak()) return false;
  return voices.length === 0 || pickVoice(lang, voices) !== undefined;
}

/**
 * Reads a word aloud with the device's built-in voice (Web Speech API).
 * `onEnd` fires when reading finishes, fails, or speech is unavailable.
 * Returns false when nothing will be spoken.
 */
export function speak(text: string, lang: string, { rate = 0.85, onEnd }: { rate?: number; onEnd?: () => void } = {}) {
  // Without a voice for the language the browser would read the word with a wrong-language voice.
  if (!hasVoiceFor(lang)) {
    onEnd?.();
    return false;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = rate;
  utter.pitch = 1.1;
  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;
  let ended = false;
  const finish = () => {
    if (ended) return;
    ended = true;
    onEnd?.();
  };
  utter.onend = finish;
  utter.onerror = finish;
  // Some browsers never fire onend; don't leave the game waiting.
  window.setTimeout(finish, 1500 + text.length * 120);
  synth.speak(utter);
  return true;
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
