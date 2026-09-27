"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/i18n/config";

export type ThemePref = "auto" | "light" | "dark";

export type Settings = {
  /** Language the kid is learning. null = not chosen yet (use default). */
  learnLang: Locale | null;
  sound: boolean;
  voice: boolean;
  /** Countdown seconds per word, 0 = no limit. */
  timer: number;
  roundSize: number;
};

type SettingsStore = Settings & {
  set: (patch: Partial<Settings>) => void;
  reset: () => void;
};

const defaults: Settings = {
  learnLang: null,
  sound: true,
  voice: true,
  timer: 5,
  roundSize: 10,
};

// Stored only in this browser (localStorage). Nothing is sent to a server.
export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaults,
      set: (patch) => set(patch),
      reset: () => set(defaults),
    }),
    { name: "lls-settings", version: 1 },
  ),
);

export const TIMER_OPTIONS = [3, 5, 8, 0] as const;
export const ROUND_SIZE_OPTIONS = [5, 10, 15] as const;

// ---------- Theme ----------
export const THEME_KEY = "lls-theme";

/** Runs in <head> before paint to avoid a light/dark flash. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export function readThemePref(): ThemePref {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "light" || t === "dark" ? t : "auto";
  } catch {
    return "auto";
  }
}

export function applyThemePref(pref: ThemePref) {
  try {
    if (pref === "auto") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    // Storage blocked: theme still applies for this page view.
  }
  if (pref === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", pref);
}
