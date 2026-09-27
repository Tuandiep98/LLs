"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { LangPickerModal } from "@/components/LangPicker";
import { Mascot } from "@/components/Mascot";
import { localeMeta } from "@/i18n/config";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";

export function HomeHero() {
  const t = useTranslations();
  const mounted = useMounted();
  const { learn, needsChoice } = useLanguagePair();

  return (
    <section className="flex items-center gap-3 sm:gap-6">
      <motion.div
        initial={{ scale: 0.6, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        className="w-32 shrink-0 sm:w-44"
      >
        <Mascot mood="cheer" className="animate-wiggle w-full" />
      </motion.div>
      <div className="card-chunky relative flex-1 p-4 sm:p-5">
        <h1 className="text-2xl leading-tight font-extrabold sm:text-4xl">{t("home.hello")}</h1>
        <p className="text-ink-soft sm:text-lg">
          {t("home.subtitle")}
          {mounted && learn && (
            <>
              {" · "}
              {t("common.learning")}: {localeMeta[learn].flag} {localeMeta[learn].nativeName}
            </>
          )}
        </p>
      </div>
      <LangPickerModal open={mounted && needsChoice} />
    </section>
  );
}
