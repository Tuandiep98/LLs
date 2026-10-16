"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { localeMeta } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";
import { Flag } from "./Flag";
import { Icon } from "./Icon";
import { LangPickerModal } from "./LangPicker";
import { LogoMark } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const t = useTranslations();
  const mounted = useMounted();
  const { learn } = useLanguagePair();
  const [picking, setPicking] = useState(false);

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 pt-3 pb-2">
      <Link href="/" className="flex items-center gap-2 rounded-2xl pr-2" aria-label={t("nav.home")}>
        <LogoMark className="h-11 w-11 sm:h-12 sm:w-12" />
        <span className="font-display text-3xl font-extrabold tracking-tight text-ink">LLs</span>
      </Link>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {mounted && learn && (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="btn-chunky btn-icon btn-header bg-surface text-ink"
            aria-label={`${t("common.learning")}: ${localeMeta[learn].nativeName}. ${t("langPicker.change")}`}
            title={`${t("common.learning")}: ${localeMeta[learn].nativeName}`}
          >
            <Flag locale={learn} className="h-8 w-8 rounded-full border-2 border-outline sm:h-9 sm:w-9" />
          </button>
        )}
        <Link
          href="/progress"
          className="btn-chunky btn-icon btn-header bg-surface text-ink"
          aria-label={t("nav.progress")}
          title={t("nav.progress")}
        >
          <Icon name="book" className="h-7 w-7 sm:h-8 sm:w-8" />
        </Link>
        <ThemeToggle />
        <Link
          href="/parents"
          className="btn-chunky btn-icon btn-header bg-surface text-ink"
          aria-label={t("nav.parents")}
          title={t("nav.parents")}
        >
          <Icon name="settings" className="h-7 w-7 sm:h-8 sm:w-8" />
        </Link>
      </div>
      <LangPickerModal open={picking} onClose={() => setPicking(false)} />
    </header>
  );
}
