"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  seconds: number;
  running: boolean;
  /** Changing this restarts the countdown. */
  resetKey: unknown;
  onDone: () => void;
  onSecond?: (secondsLeft: number) => void;
};

/** Pausable countdown. Returns the remaining milliseconds. */
export function useCountdown({ seconds, running, resetKey, onDone, onSecond }: Options) {
  const total = seconds * 1000;
  const [remaining, setRemaining] = useState(total);
  const remainingRef = useRef(total);
  const callbacks = useRef({ onDone, onSecond });
  useEffect(() => {
    callbacks.current = { onDone, onSecond };
  });

  // Restart on a new round.
  const [prevKey, setPrevKey] = useState(resetKey);
  if (prevKey !== resetKey) {
    setPrevKey(resetKey);
    setRemaining(total);
  }
  useEffect(() => {
    remainingRef.current = total;
  }, [resetKey, total]);

  useEffect(() => {
    if (!running || total <= 0) return;
    let last = performance.now();
    let lastWhole = Math.ceil(remainingRef.current / 1000);
    const id = window.setInterval(() => {
      const now = performance.now();
      remainingRef.current = Math.max(0, remainingRef.current - (now - last));
      last = now;
      setRemaining(remainingRef.current);
      const whole = Math.ceil(remainingRef.current / 1000);
      if (whole !== lastWhole) {
        lastWhole = whole;
        if (whole > 0) callbacks.current.onSecond?.(whole);
      }
      if (remainingRef.current <= 0) {
        window.clearInterval(id);
        callbacks.current.onDone();
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [running, total, resetKey]);

  return remaining;
}
