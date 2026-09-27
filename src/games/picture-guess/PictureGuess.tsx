"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { LangChoices } from "@/components/LangPicker";
import { conceptsFor } from "@/content";
import { Link } from "@/i18n/navigation";
import { needsReview } from "@/lib/core/leitner";
import { useSettings } from "@/lib/settings";
import { db } from "@/lib/storage/db";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";
import { buildDeck, buildRounds, type Round } from "./deck";
import type { GameState } from "./engine";
import { GameScreen } from "./GameScreen";
import { Setup, type SetupChoice } from "./Setup";
import { Summary } from "./Summary";

type Stage =
  | { name: "setup" }
  | { name: "playing"; id: number; rounds: Round[]; startedAt: number }
  | { name: "summary"; state: GameState; startedAt: number };

export function PictureGuess() {
  const t = useTranslations();
  const mounted = useMounted();
  const reviewOnly = useSearchParams().get("review") === "1";
  const { native, learn } = useLanguagePair();
  const { timer, roundSize } = useSettings();
  const [choice, setChoice] = useState<SetupChoice>({ topic: null, mode: reviewOnly ? "play" : "watch" });
  const [stage, setStage] = useState<Stage>({ name: "setup" });

  if (!mounted) return null;

  if (!learn) {
    return (
      <Shell title={t("games.picture-guess.name")}>
        <h2 className="mb-4 text-2xl font-extrabold">{t("langPicker.title")}</h2>
        <LangChoices />
      </Shell>
    );
  }

  const start = async () => {
    const all = conceptsFor(learn, native);
    const now = Date.now();
    const progress = await db.progress.where("learn").equals(learn).toArray();
    const reviewIds = progress.filter((p) => needsReview(p, now)).map((p) => p.conceptId);
    const pool = reviewOnly
      ? all.filter((c) => reviewIds.includes(c.id))
      : conceptsFor(learn, native, choice.topic ?? undefined);
    const deck = buildDeck(pool.length ? pool : all, roundSize, reviewIds);
    const rounds = buildRounds(deck, all, learn, choice.mode === "play");
    setStage({ name: "playing", id: now, rounds, startedAt: now });
  };

  if (stage.name === "playing") {
    return (
      <GameScreen
        key={stage.id}
        mode={choice.mode}
        rounds={stage.rounds}
        timeLimit={timer}
        learn={learn}
        native={native}
        onQuit={() => setStage({ name: "setup" })}
        onFinish={(state) => setStage({ name: "summary", state, startedAt: stage.startedAt })}
      />
    );
  }

  if (stage.name === "summary") {
    return (
      <Summary
        state={stage.state}
        learn={learn}
        native={native}
        topic={choice.topic}
        startedAt={stage.startedAt}
        onPlayAgain={() => void start()}
      />
    );
  }

  return (
    <Shell title={t("games.picture-guess.name")}>
      <Setup learn={learn} native={native} choice={choice} onChange={setChoice} onStart={() => void start()} />
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTranslations("nav");
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="mb-5 flex items-center gap-3">
        <Link href="/" className="btn-chunky btn-icon bg-surface text-ink" aria-label={t("back")}>
          ←
        </Link>
        <h1 className="text-3xl font-extrabold sm:text-4xl">🖼️ {title}</h1>
      </div>
      {children}
    </div>
  );
}
