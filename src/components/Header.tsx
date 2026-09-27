"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { localeMeta } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";
import { LangPickerModal } from "./LangPicker";
import { Mascot } from "./Mascot";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const t = useTranslations();
  const mounted = useMounted();
  const { learn } = useLanguagePair();
  const [picking, setPicking] = useState(false);

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center gap-2 px-4 pt-3 pb-2">
      <Link href="/" className="flex items-center gap-1 rounded-2xl pr-2" aria-label={t("nav.home")}>
        <Mascot className="h-10 w-auto sm:h-12" />
        <span className="font-display text-3xl font-extrabold tracking-tight text-ink">LLs</span>
      </Link>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {mounted && learn && (
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="btn-chunky btn-icon btn-header bg-surface text-ink"
            aria-label={`${t("common.learning")}: ${localeMeta[learn].nativeName}. ${t("langPicker.change")}`}
          >
            <span aria-hidden>
              {localeMeta[learn].flag}
            </span>
          </button>
        )}
        <Link href="/progress" className="btn-chunky btn-icon btn-header bg-surface" aria-label={t("nav.progress")}>
          <span aria-hidden>📒</span>
        </Link>
        <ThemeToggle />
        <Link href="/parents" className="btn-chunky btn-icon btn-header bg-surface" aria-label={t("nav.parents")}>
          <span aria-hidden>🔒</span>
        </Link>
      </div>
      <LangPickerModal open={picking} onClose={() => setPicking(false)} />
    </header>
  );
}
