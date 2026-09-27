"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "@/i18n/config";
import { useAudio } from "@/lib/audio";
import { ROUND_SIZE_OPTIONS, TIMER_OPTIONS, useSettings } from "@/lib/settings";
import { Chips, ModeCards, StartButton, Step, TopicPicker, type ModeOption } from "../SetupParts";
import type { Mode } from "./engine";

export type SetupChoice = { topic: string | null; mode: Mode };

type Props = {
  learn: Locale;
  native: Locale;
  /** Modes this game offers; the mode step is hidden when there is only one. */
  modes: readonly Mode[];
  choice: SetupChoice;
  onChange: (choice: SetupChoice) => void;
  onStart: () => void;
};

export function Setup({ learn, native, modes, choice, onChange, onStart }: Props) {
  const t = useTranslations("setup");
  const { sfx } = useAudio();
  const { timer, roundSize, set } = useSettings();

  const pick = (patch: Partial<SetupChoice>) => {
    sfx("tap");
    onChange({ ...choice, ...patch });
  };

  const modeOptions: ModeOption<Mode>[] = [
    { value: "watch" as const, icon: "👀", name: t("modeWatch"), desc: t("modeWatchDesc"), color: "bg-sky" },
    { value: "play" as const, icon: "🎮", name: t("modePlay"), desc: t("modePlayDesc"), color: "bg-orange" },
  ].filter((m) => modes.includes(m.value));

  return (
    <div className="flex flex-col gap-7 pb-6">
      <Step title={t("topic")}>
        <TopicPicker learn={learn} native={native} value={choice.topic} onPick={(topic) => pick({ topic })} />
      </Step>

      {modes.length > 1 && (
        <Step title={t("mode")}>
          <ModeCards options={modeOptions} value={choice.mode} onPick={(mode) => pick({ mode })} />
        </Step>
      )}

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Step title={t("timer")}>
          <Chips
            options={TIMER_OPTIONS.map((n) => ({
              value: n,
              label: n ? t("timerSec", { n }) : "∞",
              title: n ? undefined : t("timerNone"),
            }))}
            value={timer}
            onPick={(n) => {
              sfx("tap");
              set({ timer: n });
            }}
          />
        </Step>
        <Step title={t("count")}>
          <Chips
            options={ROUND_SIZE_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
            value={roundSize}
            onPick={(n) => {
              sfx("tap");
              set({ roundSize: n });
            }}
          />
        </Step>
      </div>

      <StartButton onClick={onStart} />
    </div>
  );
}
