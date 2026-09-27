"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState, type ComponentType } from "react";
import { LangChoices } from "@/components/LangPicker";
import { conceptsFor, getTopic } from "@/content";
import type { Locale } from "@/i18n/config";
import { needsReview } from "@/lib/core/leitner";
import { useSettings } from "@/lib/settings";
import { db } from "@/lib/storage/db";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";
import type { GameManifest } from "../../types";
import { GameShell } from "../SetupParts";
import { buildDeck, buildRounds, type Round } from "./deck";
import { summary, type GameState, type Mode } from "./engine";
import { Setup, type SetupChoice } from "./Setup";
import { Summary } from "../Summary";

/** Props every quiz screen receives from the flow. */
export type QuizScreenProps = {
  mode: Mode;
  rounds: Round[];
  timeLimit: number;
  learn: Locale;
  native: Locale;
  onFinish: (state: GameState) => void;
  onQuit: () => void;
};

type Stage =
  | { name: "setup" }
  | { name: "playing"; id: number; rounds: Round[]; startedAt: number }
  | { name: "summary"; state: GameState; startedAt: number };

type Props = {
  game: GameManifest & { modes: readonly Mode[] };
  Screen: ComponentType<QuizScreenProps>;
};

/**
 * Shared flow for word quiz games: pick language → setup → play → summary.
 * A game only supplies its manifest and its play screen.
 */
export function QuizFlow({ game, Screen }: Props) {
  const t = useTranslations();
  const mounted = useMounted();
  const params = useSearchParams();
  const reviewOnly = params.get("review") === "1";
  const topicParam = params.get("topic");
  const { native, learn } = useLanguagePair();
  const { timer, roundSize } = useSettings();
  const [choice, setChoice] = useState<SetupChoice>({
    topic: topicParam && getTopic(topicParam) ? topicParam : null,
    mode: reviewOnly && game.modes.includes("play") ? "play" : game.modes[0],
  });
  const [stage, setStage] = useState<Stage>({ name: "setup" });
  const title = `${game.icon} ${t(`games.${game.id}.name`)}`;

  if (!mounted) return null;

  if (!learn) {
    return (
      <GameShell title={title}>
        <h2 className="mb-4 text-2xl font-extrabold">{t("langPicker.title")}</h2>
        <LangChoices />
      </GameShell>
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
      <Screen
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
        gameId={game.id}
        mode={stage.state.mode}
        result={summary(stage.state)}
        scored={stage.state.mode === "play"}
        answers={
          stage.state.mode === "play"
            ? stage.state.results.map((r) => ({ conceptId: r.conceptId, correct: r.correct }))
            : []
        }
        learn={learn}
        native={native}
        topic={choice.topic}
        startedAt={stage.startedAt}
        onPlayAgain={() => void start()}
      />
    );
  }

  return (
    <GameShell title={title}>
      <Setup
        learn={learn}
        native={native}
        modes={game.modes}
        choice={choice}
        onChange={setChoice}
        onStart={() => void start()}
      />
    </GameShell>
  );
}
