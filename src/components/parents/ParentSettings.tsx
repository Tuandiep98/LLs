"use client";

import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { LangChoices } from "@/components/LangPicker";
import { Modal } from "@/components/Modal";
import { ThemeSegment } from "@/components/ThemeToggle";
import { localeMeta, locales, type Locale } from "@/i18n/config";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useHasVoice } from "@/lib/audio";
import { speak } from "@/lib/audio/speech";
import { useSettings } from "@/lib/settings";
import { clearAllData } from "@/lib/storage/db";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";

export function ParentSettings() {
  const t = useTranslations("parents");
  const tTheme = useTranslations("theme");
  const mounted = useMounted();
  const router = useRouter();
  const pathname = usePathname();
  const { native, learn } = useLanguagePair();
  const { sound, voice, showReading, set } = useSettings();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cleared, setCleared] = useState(false);
  const hasVoice = useHasVoice(learn ? localeMeta[learn].speechLang : "");

  if (!mounted) return null;

  const switchUi = (l: Locale) => router.replace(pathname, { locale: l });

  const testVoice = () => {
    if (learn) speak(localeMeta[learn].nativeName, localeMeta[learn].speechLang);
  };

  return (
    <div className="flex flex-col gap-6 pt-2 pb-4">
      <h1 className="text-3xl font-extrabold sm:text-4xl">⚙️ {t("title")}</h1>

      <Section title={t("uiLanguage")}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => switchUi(l)}
              aria-pressed={native === l}
              className={`btn-chunky min-h-14 px-2 text-base ${native === l ? "bg-sky" : "bg-surface text-ink"}`}
            >
              {localeMeta[l].flag} {localeMeta[l].nativeName}
            </button>
          ))}
        </div>
      </Section>

      <Section title={t("learnLanguage")}>
        <LangChoices />
      </Section>

      <Section title={tTheme("label")}>
        <ThemeSegment />
      </Section>

      <Section title={t("settings")}>
        <Toggle label={t("sound")} on={sound} onChange={(v) => set({ sound: v })} onText={t("on")} offText={t("off")} />
        <Toggle label={t("voice")} on={voice} onChange={(v) => set({ voice: v })} onText={t("on")} offText={t("off")} />
        <button type="button" className="btn-chunky min-h-14 w-fit bg-surface text-base text-ink" onClick={testVoice}>
          🔊 {t("voiceTest")}
        </button>
        {learn && !hasVoice && <p className="text-sm text-ink-soft">{t("voiceMissing")}</p>}
        <Toggle
          label={t("showReading")}
          on={showReading}
          onChange={(v) => set({ showReading: v })}
          onText={t("on")}
          offText={t("off")}
        />
        <p className="-mt-2 text-sm text-ink-soft">{t("showReadingDesc")}</p>
      </Section>

      <Section title={t("data")}>
        <p className="text-ink-soft">{t("dataDesc")}</p>
        <button type="button" className="btn-chunky min-h-14 w-fit bg-red text-base" onClick={() => setConfirmOpen(true)}>
          🗑️ {t("clearData")}
        </button>
        {cleared && <p className="font-bold text-correct">✓ {t("cleared")}</p>}
      </Section>

      <Section title={t("support")}>
        <p className="text-ink-soft">{t("supportDesc")}</p>
      </Section>

      <Section title={t("legal")}>
        <div className="flex flex-wrap gap-2">
          <Link href="/privacy" className="btn-chunky min-h-12 bg-surface text-base text-ink">
            {t("privacy")}
          </Link>
          <Link href="/terms" className="btn-chunky min-h-12 bg-surface text-base text-ink">
            {t("terms")}
          </Link>
          <Link href="/credits" className="btn-chunky min-h-12 bg-surface text-base text-ink">
            {t("credits")}
          </Link>
        </div>
      </Section>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t("clearData")}>
        <p className="mb-5 text-center">{t("clearConfirm")}</p>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn-chunky bg-surface text-base text-ink" onClick={() => setConfirmOpen(false)}>
            ✕
          </button>
          <button
            type="button"
            className="btn-chunky bg-red text-base"
            onClick={async () => {
              await clearAllData();
              setConfirmOpen(false);
              setCleared(true);
            }}
          >
            🗑️ {t("clearData")}
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card-chunky flex flex-col gap-3 p-4 sm:p-5">
      <h2 className="text-xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({
  label,
  on,
  onChange,
  onText,
  offText,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
  onText: string;
  offText: string;
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-lg font-bold">
      {label}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`btn-chunky min-h-12 min-w-24 px-3 text-base ${on ? "bg-green" : "bg-surface text-ink"}`}
      >
        {on ? onText : offText}
      </button>
    </label>
  );
}
