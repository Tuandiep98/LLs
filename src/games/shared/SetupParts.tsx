"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { conceptsFor, featuredTopics, topics } from "@/content";
import type { Topic } from "@/content/schema";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/storage/db";
import { Sticker } from "./Sticker";
import { groupTopics } from "./topicGroups";

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

/**
 * Topic cards, each with a sticker from the topic: "Mix" and seasonal topics first,
 * then recently played topics, then all the others.
 */
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
  const recentIds = useLiveQuery(
    async () => (await db.sessions.orderBy("startedAt").reverse().limit(40).toArray()).map((s) => s.topic),
    [],
    [],
  );
  const words = new Map(topics.map((topic) => [topic.id, conceptsFor(learn, native, topic.id)]));
  const { season, recent, rest } = groupTopics(topics, {
    featuredIds: featuredTopics().map((topic) => topic.id),
    recentIds,
    wordCount: (id) => words.get(id)?.length ?? 0,
  });

  const card = (topic: Topic | null, badge?: string) => {
    const id = topic?.id ?? null;
    const active = value === id;
    const cover = topic ? words.get(topic.id)?.[0] : undefined;
    const color = topic?.color ?? "yellow";
    return (
      <button
        key={id ?? "mix"}
        type="button"
        onClick={() => onPick(id)}
        aria-pressed={active}
        className={`btn-chunky relative flex-col gap-1 px-2 py-3 ${active ? `bg-topic-${color}` : "bg-surface text-ink"}`}
      >
        {badge && (
          <span className="absolute -top-2 -right-1 text-xl" aria-hidden>
            {badge}
          </span>
        )}
        <span className="flex h-14 items-center justify-center text-5xl" aria-hidden>
          {cover ? <Sticker concept={cover} className="h-14 w-14" tilt={-6} /> : (topic?.icon ?? "🎲")}
        </span>
        <span className="text-base leading-tight">{topic ? topic.names[native] : t("allTopics")}</span>
      </button>
    );
  };
  const grid = "grid grid-cols-3 gap-3 sm:grid-cols-6";
  const grouped = season.length > 0 || recent.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className={grid}>
        {card(null)}
        {season.map((topic) => card(topic, "✨"))}
      </div>
      {recent.length > 0 && (
        <>
          <h3 className="text-base font-bold text-ink-soft">🕘 {t("topicsRecent")}</h3>
          <div className={grid}>{recent.map((topic) => card(topic))}</div>
        </>
      )}
      {grouped && <h3 className="text-base font-bold text-ink-soft">📚 {t("topicsAll")}</h3>}
      <div className={grid}>{rest.map((topic) => card(topic))}</div>
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
