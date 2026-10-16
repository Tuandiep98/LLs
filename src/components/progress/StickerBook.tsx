"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useFormatter, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import { badges, conceptsFor, inTopic, spokenText, termOf, topics } from "@/content";
import { games } from "@/games/registry";
import { isLocale, localeMeta } from "@/i18n/config";
import { dayStreak } from "@/lib/achievements";
import { useAudio } from "@/lib/audio";
import { isUnlocked } from "@/lib/core/leitner";
import { db } from "@/lib/storage/db";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";
import { Sticker } from "@/games/shared/Sticker";
import { Flag } from "@/components/Flag";
import { Icon } from "@/components/Icon";
import { Modal } from "@/components/Modal";

const RECENT_PREVIEW = 3;
const RECENT_MAX = 15;

/**
 * The kid's collection: stats, badges, recent games, then stickers per topic.
 * Long lists show a row or two (sized to the screen) until "See all" is tapped;
 * a topic opens its full sticker page in a dialog.
 */
export function StickerBook() {
  const t = useTranslations();
  const format = useFormatter();
  const mounted = useMounted();
  const { native, learn } = useLanguagePair();
  const { say } = useAudio();
  const [openTopic, setOpenTopic] = useState<string | null>(null);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

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

  // Earned badges first, then the next ones to aim for.
  const sortedBadges = [...badges].sort((a, b) => Number(ownedIds.has(b.id)) - Number(ownedIds.has(a.id)));
  // Topics where the kid already has stickers come first.
  const topicRows = topics
    .map((topic) => {
      const items = all.filter((c) => inTopic(c, topic.id));
      const got = items.filter((c) => unlocked.has(c.id)).length;
      return { topic, items, got };
    })
    .filter((r) => r.items.length > 0)
    .sort((a, b) => Number(b.got > 0) - Number(a.got > 0));

  const openRow = topicRows.find((r) => r.topic.id === openTopic);

  return (
    <div className="flex flex-col gap-7 pt-2 pb-4">
      <h1 className="flex items-center gap-2 text-3xl font-extrabold sm:text-4xl">
        <Icon name="book" className="h-10 w-10 sm:h-12 sm:w-12" /> {t("progress.title")}
      </h1>

      {/* Overall collection */}
      <div className="card-chunky flex items-center gap-4 p-4">
        <Flag locale={learn} className="h-14 w-14 shrink-0 rounded-full border-[3px] border-outline sm:h-16 sm:w-16" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-base font-bold text-ink-soft sm:text-lg">{t("progress.collected")}</span>
            <span className="font-display text-3xl font-extrabold sm:text-4xl">
              {unlocked.size}
              <span className="text-xl text-ink-soft sm:text-2xl">/{all.length}</span>
            </span>
          </div>
          <Bar value={unlocked.size} max={all.length} color="bg-green" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <Stat icon="🎮" color="bg-yellow" label={t("progress.gamesPlayed")} value={data.sessions.length} />
        <Stat icon="⭐" color="bg-orange" label={t("progress.totalScore")} value={totalScore} />
        <Stat icon="📅" color="bg-sky" label={t("progress.dayStreak", { n: streak })} value={streak} />
      </div>

      <Section
        title={t("progress.badges")}
        icon="🏅"
        count={`${ownedIds.size}/${badges.length}`}
        footer={
          sortedBadges.length > 2 && (
            <ShowMore open={badgesOpen} total={sortedBadges.length} onToggle={() => setBadgesOpen((o) => !o)} />
          )
        }
      >
        <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${badgesOpen ? "" : "peek-2-4"}`}>
          {sortedBadges.map((b) => {
            const has = ownedIds.has(b.id);
            return (
              <div key={b.id}>
                <div
                  className={`flex h-full flex-col items-center gap-1 rounded-3xl border-[3px] border-outline p-3 text-center ${has ? "bg-yellow text-on-color shadow-[0_4px_0_var(--outline)]" : "border-dashed bg-surface-2"}`}
                >
                  <span className={`text-5xl ${has ? "" : "opacity-40 grayscale"}`} aria-hidden>
                    {b.icon}
                  </span>
                  <span className="font-display text-lg leading-tight font-extrabold">{b.names[native]}</span>
                  <span className={`text-sm leading-snug ${has ? "" : "text-ink-soft"}`}>{b.descs[native]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        title={t("progress.history")}
        icon="🕑"
        footer={
          data.sessions.length > RECENT_PREVIEW && (
            <ShowMore
              open={historyOpen}
              total={Math.min(data.sessions.length, RECENT_MAX)}
              onToggle={() => setHistoryOpen((o) => !o)}
            />
          )
        }
      >
        {data.sessions.length === 0 ? (
          <p className="card-chunky p-5 text-center text-lg font-bold">{t("progress.noHistory")}</p>
        ) : (
          <ul className="card-chunky divide-y-[3px] divide-surface-2 overflow-hidden">
            {data.sessions.slice(0, historyOpen ? RECENT_MAX : RECENT_PREVIEW).map((s) => {
              const game = games.find((g) => g.id === s.gameId);
              return (
                <li key={s.id} className="flex items-center gap-3 px-3 py-3 sm:px-4">
                  <span
                    className={`bg-topic-${game?.color ?? "sky"} flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[3px] border-outline text-2xl sm:h-14 sm:w-14 sm:text-3xl`}
                    aria-hidden
                  >
                    {game?.icon ?? "🎮"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg leading-tight font-extrabold sm:text-xl">
                      {t(`games.${s.gameId}.name`)}
                    </span>
                    <span className="flex flex-wrap items-center gap-x-2 text-sm text-ink-soft sm:text-base">
                      <span className="font-bold">{t(`modes.${s.mode}`)}</span>
                      {isLocale(s.learn) && <Flag locale={s.learn} />}
                      <span>{format.dateTime(s.startedAt, { dateStyle: "short", timeStyle: "short" })}</span>
                    </span>
                  </span>
                  {s.mode === "play" && (
                    <span className="shrink-0 text-right">
                      <span className="block text-xl tracking-tighter sm:text-2xl" aria-hidden>
                        {"⭐".repeat(s.stars)}
                      </span>
                      <span className="font-display text-lg font-extrabold">
                        {s.correct}/{s.total}
                      </span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>

      <Section
        title={t("progress.collected")}
        icon="🧩"
        footer={
          topicRows.length > 4 && (
            <ShowMore open={topicsOpen} total={topicRows.length} onToggle={() => setTopicsOpen((o) => !o)} />
          )
        }
      >
        <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 ${topicsOpen ? "" : "peek-2-3-4x2"}`}>
          {topicRows.map(({ topic, items, got }) => {
            const preview = items.filter((c) => unlocked.has(c.id)).slice(0, 3);
            return (
              <div key={topic.id}>
                <button
                  type="button"
                  onClick={() => setOpenTopic(topic.id)}
                  className="card-chunky card-press flex h-full w-full flex-col overflow-hidden text-left"
                >
                  <span
                    className={`bg-topic-${topic.color} flex items-center gap-2 border-b-[3px] border-outline px-3 py-2 text-on-color`}
                  >
                    <span className="text-2xl sm:text-3xl" aria-hidden>
                      {topic.icon}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-display text-lg leading-tight font-extrabold sm:text-xl">
                      {topic.names[native]}
                    </span>
                  </span>
                  <span className="flex flex-1 flex-col gap-2 p-3">
                    <span className="flex h-12 items-center -space-x-2 sm:h-14" aria-hidden>
                      {preview.length > 0 ? (
                        preview.map((c, i) => (
                          <Sticker key={c.id} concept={c} tilt={(i - 1) * 8} className="h-12 w-12 sm:h-14 sm:w-14" />
                        ))
                      ) : (
                        <Sticker concept={items[0]} locked className="h-12 w-12 sm:h-14 sm:w-14" />
                      )}
                    </span>
                    <span className="flex items-center gap-2">
                      <Bar value={got} max={items.length} color={got ? "bg-green" : "bg-surface-2"} small />
                      <span className="shrink-0 font-display text-lg font-extrabold">
                        {got}
                        <span className="text-base text-ink-soft">/{items.length}</span>
                      </span>
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </Section>

      {openRow && (
        <Modal open onClose={() => setOpenTopic(null)} title={`${openRow.topic.icon} ${openRow.topic.names[native]}`} wide>
          <p className="mb-3 text-center font-display text-xl font-extrabold">
            {openRow.got}
            <span className="text-ink-soft">/{openRow.items.length}</span>
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {[...openRow.items]
              // Collected stickers first.
              .sort((a, b) => Number(unlocked.has(b.id)) - Number(unlocked.has(a.id)))
              .map((c, i) => {
                const has = unlocked.has(c.id);
                const text = termOf(c, learn).text;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={!has}
                    onClick={() => say(spokenText(termOf(c, learn)), localeMeta[learn].speechLang)}
                    className="flex flex-col items-center gap-1 rounded-2xl p-1 disabled:cursor-default"
                    aria-label={has ? text : t("progress.locked")}
                  >
                    <Sticker concept={c} locked={!has} tilt={has ? (i % 3) * 3 - 3 : 0} className="h-16 w-16 sm:h-20 sm:w-20" />
                    <span
                      className={`min-h-6 text-center leading-tight font-bold ${has ? "text-sm sm:text-base" : "font-display text-xl text-ink-soft"}`}
                    >
                      {has ? text : "?"}
                    </span>
                  </button>
                );
              })}
          </div>
        </Modal>
      )}
    </div>
  );
}

function Section({
  title,
  icon,
  count,
  footer,
  children,
}: {
  title: string;
  icon: string;
  count?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-2xl font-extrabold sm:text-3xl">
        <span aria-hidden>{icon}</span>
        {title}
        {count && (
          <span className="ml-auto rounded-full border-[3px] border-outline bg-yellow px-3 py-0.5 text-lg text-on-color">
            {count}
          </span>
        )}
      </h2>
      {children}
      {footer}
    </section>
  );
}

function ShowMore({ open, total, onToggle }: { open: boolean; total: number; onToggle: () => void }) {
  const t = useTranslations("progress");
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="btn-chunky min-h-12 w-full bg-surface-2 text-lg text-ink"
    >
      {open ? t("showLess") : t("showAll", { n: total })}
      <Icon name="chevron" className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

function Bar({ value, max, color, small = false }: { value: number; max: number; color: string; small?: boolean }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <span
      className={`block w-full overflow-hidden rounded-full border-2 border-outline ${small ? "mt-1 h-3 bg-black/15" : "h-5 bg-surface-2"}`}
      aria-hidden
    >
      <span className={`block h-full rounded-full ${color}`} style={{ width: `${Math.max(pct, value ? 4 : 0)}%` }} />
    </span>
  );
}

function Stat({ icon, color, label, value }: { icon: string; color: string; label: string; value: number }) {
  return (
    <div className={`card-chunky ${color} flex flex-col items-center gap-0.5 px-2 py-3 text-center text-on-color sm:py-4`}>
      <span className="text-4xl sm:text-5xl" aria-hidden>
        {icon}
      </span>
      <span className="font-display text-3xl leading-tight font-extrabold sm:text-5xl">{value}</span>
      <span className="text-sm leading-tight font-bold sm:text-base">{label}</span>
    </div>
  );
}
