"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { conceptsFor, topics } from "@/content";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { Sticker } from "./Sticker";

/** Page frame for a game's setup screen: back button + title. */
export function GameShell({ title, children }: { title: string; children: ReactNode }) {
  const t = useTranslations("nav");
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/" className="btn-chunky btn-icon bg-surface text-ink" aria-label={t("back")}>
          ←
        </Link>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-extrabold sm:text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export function StartButton({ onClick }: { onClick: () => void }) {
  const t = useTranslations("common");
  return (
    <button type="button" onClick={onClick} className="btn-chunky mx-auto min-h-20 w-full max-w-sm bg-green text-3xl">
      ▶ {t("start")}
    </button>
  );
}

/** Topic cards ("Mix" + every topic), each with a sticker from the topic. */
export function TopicPicker({
  learn,
  native,
  value,
  onPick,
}: {
  learn: Locale;
  native: Locale;
  value: string | null;
  onPick: (topic: string | null) => void;
}) {
  const t = useTranslations("setup");
  const cards = [
    { id: null, name: t("allTopics"), color: "yellow" as const, cover: null, icon: "🎲" },
    ...topics.map((topic) => ({
      id: topic.id,
      name: topic.names[native],
      color: topic.color,
      cover: conceptsFor(learn, native, topic.id)[0] ?? null,
      icon: topic.icon,
    })),
  ];
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {cards.map((card) => {
        const active = value === card.id;
        return (
          <button
            key={card.id ?? "mix"}
            type="button"
            onClick={() => onPick(card.id)}
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
  );
}

export type ModeOption<T extends string> = { value: T; icon: string; name: string; desc: string; color: string };

/** Big cards for choosing how to play. */
export function ModeCards<T extends string>({
  options,
  value,
  onPick,
}: {
  options: ModeOption<T>[];
  value: T;
  onPick: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((m) => {
        const active = value === m.value;
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onPick(m.value)}
            aria-pressed={active}
            className={`btn-chunky justify-start gap-4 py-4 text-left ${active ? m.color : "bg-surface text-ink"}`}
          >
            <span className="text-5xl whitespace-nowrap" aria-hidden>
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
  );
}

export function Chips<T extends number>({
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
