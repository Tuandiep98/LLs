"use client";

// Tiny synthesized sound effects (Web Audio), so no audio files are needed.
export type Sfx = "tap" | "tick" | "correct" | "wrong" | "win" | "pop";

let ctx: AudioContext | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType = "sine", volume = 0.18) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + start;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

export function playSfx(name: Sfx) {
  switch (name) {
    case "tap":
      tone(660, 0, 0.08, "triangle", 0.12);
      break;
    case "tick":
      tone(1200, 0, 0.05, "square", 0.05);
      break;
    case "pop":
      tone(520, 0, 0.06, "sine");
      tone(880, 0.05, 0.08, "sine");
      break;
    case "correct":
      tone(784, 0, 0.12, "triangle");
      tone(1047, 0.1, 0.12, "triangle");
      tone(1319, 0.2, 0.22, "triangle");
      break;
    case "wrong":
      // Soft and friendly: no harsh buzzer for kids.
      tone(392, 0, 0.16, "sine", 0.14);
      tone(330, 0.14, 0.24, "sine", 0.14);
      break;
    case "win":
      [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.18, "triangle"));
      break;
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Not supported (iOS): ignore.
  }
}
