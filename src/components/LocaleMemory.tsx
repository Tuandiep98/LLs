"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";
import { LOCALE_STORAGE_KEY } from "@/i18n/detect";

/** Remembers the last UI language so "/" opens it next time on static hosting. */
export function LocaleMemory() {
  const locale = useLocale();
  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Storage blocked: detection falls back to browser languages.
    }
  }, [locale]);
  return null;
}
