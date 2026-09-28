"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useFormatter, useTranslations } from "next-intl";
import { conceptsFor, spokenText, termOf, topics } from "@/content";
import { localeMeta } from "@/i18n/config";
import { achievements, dayStreak } from "@/lib/achievements";
import { useAudio } from "@/lib/audio";
import { isUnlocked } from "@/lib/core/leitner";
import { db } from "@/lib/storage/db";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";
import { Sticker } from "@/games/shared/Sticker";

export function StickerBook() {
  const t = useTranslations();
  const format = useFormatter();
  const mounted = useMounted();
  const { native, learn } = useLanguagePair();
  const { say } = useAudio();

  const data = useLiveQuery(async () => {
    const [progress, sessions, owned] = await Promise.all([
      learn ? db.progress.where("learn").equals(learn).toArray() : [],
      db.sessions.orderBy("startedAt").reverse().toArray(),
      db.achievements.toArray(),
    ]);
    const streak = dayStreak(
      sessions.map((s) => s.startedAt),
      Date.now(),
    );
    return { progress, sessions, owned, streak };
  }, [learn]);

  if (!mounted || !data || !learn) return null;

  const unlocked = new Set(data.progress.filter(isUnlocked).map((p) => p.conceptId));
  const all = conceptsFor(learn, native);
  const ownedIds = new Set(data.owned.map((a) => a.id));
  const totalScore = data.sessions.reduce((sum, s) => sum + s.score, 0);
  const { streak } = data;

  return (
    <div className="flex flex-col gap-8 pt-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-extrabold sm:text-4xl">📒 {t("progress.title")}</h1>
        <p className="font-display text-xl font-bold">
          {localeMeta[learn].flag} {t("progress.stickers", { n: unlocked.size, total: all.length })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat icon="🎮" label={t("progress.gamesPlayed")} value={data.sessions.length} />
        <Stat icon="⭐" label={t("progress.totalScore")} value={totalScore} />
        <Stat icon="📅" label={t("progress.dayStreak", { n: streak })} value={streak} />
      </div>

      {topics.map((topic) => {
        const items = all.filter((c) => c.topic === topic.id);
        if (!items.length) return null;
        const got = items.filter((c) => unlocked.has(c.id)).length;
        return (
          <section key={topic.id} className="card-chunky overflow-hidden">
            <h2 className={`bg-topic-${topic.color} flex items-center justify-between border-b-[3px] border-outline px-4 py-2 text-xl font-extrabold text-on-color`}>
              <span>
                {topic.icon} {topic.names[native]}
              </span>
              <span className="text-base">
                {got}/{items.length}
              </span>
            </h2>
            <div className="grid grid-cols-4 gap-2 p-3 sm:grid-cols-6 lg:grid-cols-8">
              {items.map((c, i) => {
                const open = unlocked.has(c.id);
                const text = termOf(c, learn).text;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!open}
                    onClick={() => say(spokenText(termOf(c, learn)), localeMeta[learn].speechLang)}
                    className="flex flex-col items-center gap-1 rounded-2xl p-1 disabled:cursor-default"
                    aria-label={open ? text : t("progress.locked")}
                  >
                    <Sticker concept={c} locked={!open} tilt={open ? (i % 3) * 3 - 3 : 0} className="h-14 w-14 sm:h-16 sm:w-16" />
                    <span className="min-h-5 text-center text-xs leading-tight font-bold sm:text-sm">{open ? text : "?"}</span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      <section>
        <h2 className="mb-3 text-2xl font-extrabold">🏅 {t("progress.badges")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {achievements.map((a) => {
            const has = ownedIds.has(a.id);
            return (
              <div key={a.id} className={`card-chunky flex flex-col items-center gap-1 p-3 text-center ${has ? "bg-yellow text-on-color" : "opacity-60"}`}>
                <span className="text-4xl" style={has ? undefined : { filter: "grayscale(1)" }} aria-hidden>
                  {a.icon}
                </span>
                <span className="font-display text-lg leading-tight font-bold">{t(`badges.${a.id}.name`)}</span>
                <span className="text-xs">{t(`badges.${a.id}.desc`)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-2xl font-extrabold">🕑 {t("progress.history")}</h2>
        {data.sessions.length === 0 ? (
          <p className="card-chunky p-4 text-center font-bold">{t("progress.noHistory")}</p>
        ) : (
          <ul className="card-chunky divide-y-2 divide-surface-2">
            {data.sessions.slice(0, 15).map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-2xl" aria-hidden>
                  {s.mode === "play" ? "🎮" : "👀"}
                </span>
                <span className="flex-1">
                  <span className="block font-bold">
                    {t(`games.${s.gameId}.name`)} · {t(`modes.${s.mode}`)}
                  </span>
                  <span className="text-sm text-ink-soft">
                    {format.dateTime(s.startedAt, { dateStyle: "medium", timeStyle: "short" })} ·{" "}
                    {localeMeta[s.learn as keyof typeof localeMeta]?.flag}
                  </span>
                </span>
                {s.mode === "play" && (
                  <span className="text-right font-bold">
                    {"⭐".repeat(s.stars)}
                    <span className="block text-sm text-ink-soft">
                      {s.correct}/{s.total}
                    </span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div className="card-chunky flex flex-col items-center p-3 text-center">
      <span className="text-3xl" aria-hidden>
        {icon}
      </span>
      <span className="font-display text-2xl font-extrabold">{value}</span>
      <span className="text-xs leading-tight text-ink-soft sm:text-sm">{label}</span>
    </div>
  );
}
