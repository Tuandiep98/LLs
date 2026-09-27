"use client";

let voicesCache: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  voicesCache = window.speechSynthesis.getVoices();
}

if (typeof window !== "undefined" && "speechSynthesis" in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);
}

export function canSpeak() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function pickVoice(lang: string) {
  const base = lang.split("-")[0];
  const matches = voicesCache.filter((v) => v.lang.replace("_", "-").startsWith(base));
  return (
    matches.find((v) => v.lang.replace("_", "-") === lang && v.localService) ??
    matches.find((v) => v.lang.replace("_", "-") === lang) ??
    matches[0]
  );
}

/** Reads a word aloud with the device's built-in voice (Web Speech API). */
export function speak(text: string, lang: string, rate = 0.85) {
  if (!canSpeak()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = rate;
  utter.pitch = 1.1;
  const voice = pickVoice(lang);
  if (voice) utter.voice = voice;
  synth.speak(utter);
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel();
}
