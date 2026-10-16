"use client";

import { useTranslations } from "next-intl";
import { localeMeta, type Locale } from "@/i18n/config";
import { useAudio } from "@/lib/audio";
import { useSettings } from "@/lib/settings";
import { useLanguagePair } from "@/lib/useLearnLang";
import { Flag } from "./Flag";
import { Icon } from "./Icon";
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
      {learnOptions.map((l) => {
        const active = learn === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => pick(l)}
            aria-pressed={active}
            className={`btn-chunky relative justify-start gap-4 px-4 py-3 sm:flex-col sm:justify-center sm:gap-2 sm:py-4 ${active ? "bg-sky" : "bg-surface text-ink"}`}
          >
            <Flag
              locale={l}
              className="h-12 w-[4.5rem] shrink-0 rounded-xl border-[3px] border-outline shadow-[0_3px_0_var(--outline)] sm:h-14 sm:w-20"
            />
            <span className="text-xl">{localeMeta[l].nativeName}</span>
            {active && (
              <span className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-outline bg-green text-lg">
                <Icon name="check" />
              </span>
            )}
          </button>
        );
      })}
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
