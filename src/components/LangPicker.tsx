"use client";

import { useTranslations } from "next-intl";
import { localeMeta, type Locale } from "@/i18n/config";
import { useAudio } from "@/lib/audio";
import { useSettings } from "@/lib/settings";
import { useLanguagePair } from "@/lib/useLearnLang";
import { Modal } from "./Modal";

export function LangChoices({ onPicked }: { onPicked?: () => void }) {
  const { learn, learnOptions } = useLanguagePair();
  const setSettings = useSettings((s) => s.set);
  const { sfx, say } = useAudio();
  const pick = (l: Locale) => {
    setSettings({ learnLang: l });
    sfx("pop");
    say(localeMeta[l].nativeName, localeMeta[l].speechLang);
    onPicked?.();
  };
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {learnOptions.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => pick(l)}
          aria-pressed={learn === l}
          className={`btn-chunky flex-col py-4 ${learn === l ? "bg-sky" : "bg-surface text-ink"}`}
        >
          <span className="text-5xl" aria-hidden>
            {localeMeta[l].flag}
          </span>
          <span className="text-lg">{localeMeta[l].nativeName}</span>
        </button>
      ))}
    </div>
  );
}

export function LangPickerModal({ open, onClose }: { open: boolean; onClose?: () => void }) {
  const t = useTranslations("langPicker");
  return (
    <Modal open={open} onClose={onClose} title={t("title")}>
      <LangChoices onPicked={onClose} />
    </Modal>
  );
}
