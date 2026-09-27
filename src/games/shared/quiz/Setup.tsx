"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { conceptsFor, topics } from "@/content";
import type { Locale } from "@/i18n/config";
import { useAudio } from "@/lib/audio";
import { ROUND_SIZE_OPTIONS, TIMER_OPTIONS, useSettings } from "@/lib/settings";
import { Sticker } from "../Sticker";
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
  const t = useTranslations();
  const { sfx } = useAudio();
  const { timer, roundSize, set } = useSettings();

  const pick = (patch: Partial<SetupChoice>) => {
    sfx("tap");
    onChange({ ...choice, ...patch });
  };

  const topicCards = [
    { id: null, name: t("setup.allTopics"), color: "yellow" as const, cover: null, icon: "🎲" },
    ...topics.map((topic) => ({
      id: topic.id,
      name: topic.names[native],
      color: topic.color,
      cover: conceptsFor(learn, native, topic.id)[0] ?? null,
      icon: topic.icon,
    })),
  ];

  return (
    <div className="flex flex-col gap-7 pb-6">
      <Step title={t("setup.topic")}>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {topicCards.map((card) => {
            const active = choice.topic === card.id;
            return (
              <button
                key={card.id ?? "mix"}
                type="button"
                onClick={() => pick({ topic: card.id })}
                aria-pressed={active}
                className={`btn-chunky flex-col gap-1 px-2 py-3 ${active ? `bg-topic-${card.color}` : "bg-surface text-ink"}`}
              >
                <span className="flex h-14 items-center justify-center text-5xl" aria-hidden>
                  {card.cover ? <Sticker concept={card.cover} className="h-14 w-14" tilt={-6} /> : card.icon}
                </span>
                <span className="text-base leading-tight">{card.name}</span>
              </button>
            );
          })}
        </div>
      </Step>

      {modes.length > 1 && (
      <Step title={t("setup.mode")}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(
            [
              { mode: "watch", icon: "👀", name: t("setup.modeWatch"), desc: t("setup.modeWatchDesc"), color: "bg-sky" },
              { mode: "play", icon: "🎮", name: t("setup.modePlay"), desc: t("setup.modePlayDesc"), color: "bg-orange" },
            ] as const
          ).filter((m) => modes.includes(m.mode)).map((m) => {
            const active = choice.mode === m.mode;
            return (
              <button
                key={m.mode}
                type="button"
                onClick={() => pick({ mode: m.mode })}
                aria-pressed={active}
                className={`btn-chunky justify-start gap-4 py-4 text-left ${active ? m.color : "bg-surface text-ink"}`}
              >
                <span className="text-5xl" aria-hidden>
                  {m.icon}
                </span>
                <span className="flex flex-col">
                  <span className="text-2xl">{m.name}</span>
                  <span className="font-sans text-sm font-semibold opacity-80">{m.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </Step>
      )}

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Step title={t("setup.timer")}>
          <Chips
            options={TIMER_OPTIONS.map((n) => ({ value: n, label: n ? t("setup.timerSec", { n }) : "∞", title: n ? undefined : t("setup.timerNone") }))}
            value={timer}
            onPick={(n) => {
              sfx("tap");
              set({ timer: n });
            }}
          />
        </Step>
        <Step title={t("setup.count")}>
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

      <button type="button" onClick={onStart} className="btn-chunky mx-auto min-h-20 w-full max-w-sm bg-green text-3xl">
        ▶ {t("common.start")}
      </button>
    </div>
  );
}

function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function Chips<T extends number>({
  options,
  value,
  onPick,
}: {
  options: { value: T; label: string; title?: string }[];
  value: number;
  onPick: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onPick(o.value)}
          aria-pressed={value === o.value}
          aria-label={o.title}
          title={o.title}
          className={`btn-chunky min-h-14 flex-1 px-3 text-lg whitespace-nowrap ${value === o.value ? "bg-grape" : "bg-surface text-ink"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
