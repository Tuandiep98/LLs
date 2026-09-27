"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { applyThemePref, readThemePref, type ThemePref } from "@/lib/settings";
import { useMounted } from "@/lib/useMounted";

const ORDER: ThemePref[] = ["auto", "light", "dark"];
const ICON: Record<ThemePref, string> = { auto: "🌓", light: "☀️", dark: "🌙" };

export function useThemePref() {
  const mounted = useMounted();
  const [pref, setPref] = useState<ThemePref | null>(null);
  const current = pref ?? (mounted ? readThemePref() : "auto");
  const change = (next: ThemePref) => {
    applyThemePref(next);
    setPref(next);
  };
  return [current, change] as const;
}

export function ThemeToggle() {
  const t = useTranslations("theme");
  const [pref, setPref] = useThemePref();
  const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
  return (
    <button
      type="button"
      className="btn-chunky btn-icon btn-header bg-surface"
      onClick={() => setPref(next)}
      aria-label={`${t("label")}: ${t(pref)}`}
      title={`${t("label")}: ${t(pref)}`}
    >
      <span aria-hidden>{ICON[pref]}</span>
    </button>
  );
}

export function ThemeSegment() {
  const t = useTranslations("theme");
  const [pref, setPref] = useThemePref();
  return (
    <div className="grid grid-cols-3 gap-2">
      {ORDER.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => setPref(p)}
          aria-pressed={pref === p}
          className={`btn-chunky min-h-14 px-2 text-base ${pref === p ? "bg-sky" : "bg-surface text-ink"}`}
        >
          {ICON[p]} {t(p)}
        </button>
      ))}
    </div>
  );
}
