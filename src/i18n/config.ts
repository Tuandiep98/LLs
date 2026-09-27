// Supported languages. Adding a language = add it here, add messages/<code>.json,
// and add translations to the content data. No other code changes needed.
export const locales = ["en", "vi", "zh-Hans", "ja"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// Language the kid learns when nothing has been chosen yet.
export const defaultLearnLang: Locale = "en";

export const localeMeta: Record<
  Locale,
  { nativeName: string; flag: string; speechLang: string }
> = {
  en: { nativeName: "English", flag: "🇬🇧", speechLang: "en-US" },
  vi: { nativeName: "Tiếng Việt", flag: "🇻🇳", speechLang: "vi-VN" },
  "zh-Hans": { nativeName: "简体中文", flag: "🇨🇳", speechLang: "zh-CN" },
  ja: { nativeName: "日本語", flag: "🇯🇵", speechLang: "ja-JP" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
