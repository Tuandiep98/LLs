"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Flag } from "@/components/Flag";
import { Icon } from "@/components/Icon";
import { LangPickerModal } from "@/components/LangPicker";
import { Mascot } from "@/components/Mascot";
import { localeMeta } from "@/i18n/config";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";

/** Greeting card with Lala popping out of it, plus a "learning: 🇬🇧 English ▾" chip. */
export function HomeHero() {
  const t = useTranslations();
  const mounted = useMounted();
  const { learn, needsChoice } = useLanguagePair();
  const [picking, setPicking] = useState(false);

  return (
    <section className="relative mt-14 sm:mt-10">
      <div className="card-chunky hero-card relative flex items-center px-4 pt-12 pb-4 sm:min-h-40 sm:py-5 sm:pr-6 sm:pl-[19.5rem]">
        {/* Lala peeks over the card (phones) or stands on the green hill and pops out of it */}
        <motion.div
          initial={{ scale: 0.6, rotate: -10, y: 20 }}
          animate={{ scale: 1, rotate: 0, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
          className="absolute -top-14 left-3 w-32 sm:top-auto sm:bottom-3 sm:left-4 sm:w-72"
          aria-hidden
        >
          <Mascot mood="cheer" className="animate-wiggle w-full drop-shadow-[0_6px_0_rgb(0_0_0/0.15)]" />
        </motion.div>
        <Sparkle className="absolute -top-8 left-[8.5rem] h-7 w-7 text-yellow sm:-top-9 sm:left-[18rem] sm:h-9 sm:w-9" />
        <Sparkle className="animate-float absolute -top-4 right-8 h-6 w-6 text-orange [animation-delay:-1.2s] sm:h-7 sm:w-7" />

        <div className="flex min-w-0 flex-col items-start gap-2">
          <h1 className="text-2xl leading-tight font-extrabold sm:text-4xl">{t("home.hello")}</h1>
          <p className="text-ink-soft sm:text-lg">{t("home.subtitle")}</p>
          {mounted && learn && (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="flex min-h-11 items-center gap-2 rounded-full border-[3px] border-outline bg-surface-2 py-1 pr-3 pl-1.5 font-display text-base font-bold shadow-[0_3px_0_var(--outline)] transition-transform active:translate-y-0.5 active:shadow-none sm:text-lg"
              aria-label={`${t("common.learning")}: ${localeMeta[learn].nativeName}. ${t("langPicker.change")}`}
            >
              <Flag locale={learn} className="h-7 w-7 rounded-full border-2 border-outline" />
              <span className="font-normal whitespace-nowrap text-ink-soft">{t("common.learning")}:</span>
              <span className="whitespace-nowrap">{localeMeta[learn].nativeName}</span>
              <Icon name="chevron" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <LangPickerModal open={(mounted && needsChoice) || picking} onClose={picking ? () => setPicking(false) : undefined} />
    </section>
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.5c.8 4.6 2.9 6.7 9.5 9.5-6.6 2.8-8.7 4.9-9.5 9.5-.8-4.6-2.9-6.7-9.5-9.5 6.6-2.8 8.7-4.9 9.5-9.5Z"
        fill="currentColor"
        stroke="var(--outline)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
