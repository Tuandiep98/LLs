"use client";

import confetti from "canvas-confetti";

const COLORS = ["#ff8a3d", "#4cc3f5", "#ffd23f", "#8c6cf0", "#3dbe6b", "#ff5a5f"];

function reducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function burst(x = 0.5, y = 0.45) {
  if (reducedMotion()) return;
  void confetti({ particleCount: 60, spread: 70, startVelocity: 35, origin: { x, y }, colors: COLORS, scalar: 1.1 });
}

export function celebrate() {
  if (reducedMotion()) return;
  const end = Date.now() + 900;
  const frame = () => {
    void confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLORS });
    void confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
