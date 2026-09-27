"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/Mascot";
import { getConcept, termOf } from "@/content";
import { localeMeta, type Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { achievements } from "@/lib/achievements";
import { useAudio } from "@/lib/audio";
import { recordSession, type SessionOutcome } from "@/lib/storage/record";
import { celebrate } from "../shared/confetti";
import { Sticker } from "../shared/Sticker";
import { summary, type GameState } from "./engine";
import { pictureGuess } from "./manifest";

type Props = {
  state: GameState;
  learn: Locale;
  native: Locale;
  topic: string | null;
  startedAt: number;
  onPlayAgain: () => void;
};

export function Summary({ state, learn, native, topic, startedAt, onPlayAgain }: Props) {
  const t = useTranslations();
  const { sfx, say } = useAudio();
  const result = summary(state);
  const [outcome, setOutcome] = useState<SessionOutcome | null>(null);
  const saved = useRef(false);

  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    sfx("win");
    celebrate();
    recordSession(
      {
        gameId: pictureGuess.id,
        mode: state.mode,
        learn,
        native,
        topic,
        startedAt,
        endedAt: Date.now(),
        total: result.total,
        correct: result.correct,
        score: result.score,
        stars: result.stars,
        bestStreak: result.bestStreak,
        wrongIds: result.wrongIds,
      },
      state.mode === "play" ? state.results.map((r) => ({ conceptId: r.conceptId, correct: r.correct })) : [],
    )
      .then(setOutcome)
      .catch(() => setOutcome({ newStickers: [], newAchievements: [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- save exactly once
  }, []);

  const speakWord = (id: string) => {
    const c = getConcept(id);
    if (c) say(termOf(c, learn).text, localeMeta[learn].speechLang);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-5 px-4 py-6 text-center">
      <Mascot mood="cheer" className="animate-wiggle w-40" />
      <h1 className="text-4xl font-extrabold">{state.mode === "play" ? t("summary.title") : t("summary.watchTitle")}</h1>

      {state.mode === "play" && (
        <>
          <div className="flex gap-2" aria-label={`${result.stars}/3`}>
            {[1, 2, 3].map((n) => (
              <motion.span
                key={n}
                className="text-6xl"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + n * 0.25, type: "spring", stiffness: 300, damping: 12 }}
                style={{ filter: n <= result.stars ? "none" : "grayscale(1) opacity(0.35)" }}
                aria-hidden
              >
                ⭐
              </motion.span>
            ))}
          </div>
          <div className="card-chunky flex w-full flex-col gap-1 p-4 text-lg font-bold">
            <p className="font-display text-2xl">{t("summary.correct", { correct: result.correct, total: result.total })}</p>
            <p>{t("summary.score", { score: result.score })}</p>
            {result.bestStreak >= 2 && <p>🔥 {t("summary.bestStreak", { n: result.bestStreak })}</p>}
          </div>
        </>
      )}

      {outcome && outcome.newStickers.length > 0 && (
        <section className="w-full">
          <h2 className="mb-2 text-2xl font-extrabold">{t("summary.newStickers")}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {outcome.newStickers.map((id, i) => {
              const c = getConcept(id);
              return (
                c && (
                  <motion.button
                    key={id}
                    type="button"
                    onClick={() => speakWord(id)}
                    initial={{ scale: 0, rotate: 30 }}
                    animate={{ scale: 1, rotate: i % 2 ? 5 : -5 }}
                    transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
                    className="flex w-20 flex-col items-center"
                  >
                    <Sticker concept={c} className="h-16 w-16" />
                    <span className="text-sm font-bold">{termOf(c, learn).text}</span>
                  </motion.button>
                )
              );
            })}
          </div>
        </section>
      )}

      {outcome && outcome.newAchievements.length > 0 && (
        <section className="w-full">
          <h2 className="mb-2 text-2xl font-extrabold">{t("summary.newBadges")}</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {outcome.newAchievements.map((id) => (
              <div key={id} className="card-chunky flex items-center gap-2 bg-yellow px-4 py-2 text-on-color">
                <span className="text-3xl" aria-hidden>
                  {achievements.find((a) => a.id === id)?.icon}
                </span>
                <span className="font-display text-lg font-bold">{t(`badges.${id}.name`)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.wrongIds.length > 0 && (
        <section className="w-full">
          <h2 className="mb-2 text-xl font-extrabold">{t("summary.practice")}</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {[...new Set(result.wrongIds)].map((id) => {
              const c = getConcept(id);
              return (
                c && (
                  <button
                    key={id}
                    type="button"
                    onClick={() => speakWord(id)}
                    className="card-chunky flex items-center gap-2 px-3 py-2"
                  >
                    <Sticker concept={c} className="h-10 w-10" />
                    <span className="font-bold">{termOf(c, learn).text}</span>
                    <span aria-hidden>🔊</span>
                  </button>
                )
              );
            })}
          </div>
        </section>
      )}

      <div className="grid w-full grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
        <button type="button" onClick={onPlayAgain} className="btn-chunky bg-green">
          🔁 {t("summary.playAgain")}
        </button>
        <Link href="/" className="btn-chunky bg-surface text-ink">
          🏠 {t("summary.home")}
        </Link>
      </div>
    </div>
  );
}
