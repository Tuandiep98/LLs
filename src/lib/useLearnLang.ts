"use client";

import { useLocale } from "next-intl";
import { defaultLearnLang, locales, type Locale } from "@/i18n/config";
import { useSettings } from "./settings";

/**
 * Language pair: native = UI locale, learn = chosen language.
 * If nothing is chosen, learn English; English speakers must pick one.
 */
export function useLanguagePair() {
  const native = useLocale() as Locale;
  const chosen = useSettings((s) => s.learnLang);
  const fallback = native === defaultLearnLang ? null : defaultLearnLang;
  const learn = chosen && chosen !== native ? chosen : fallback;
  const learnOptions = locales.filter((l) => l !== native);
  return { native, learn, learnOptions, needsChoice: learn === null };
}
