"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { LangChoices } from "@/components/LangPicker";
import { conceptsFor } from "@/content";
import { useAudio } from "@/lib/audio";
import { useSettings } from "@/lib/settings";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";
import {
  Chips,
  GameShell,
  StartButton,
  Step,
  TopicPicker,
} from "../shared/SetupParts";
import { Summary } from "../shared/Summary";
import { ConnectBoard } from "./ConnectBoard";
import {
  connectSummary,
  PAIR_OPTIONS,
  type ConnectState,
} from "./engine";
import { pickDistinct } from "../shared/quiz/deck";
import { learningState } from "@/lib/storage/record";
import { connectPairs } from "./manifest";

type Stage =
  | { name: "setup" }
  | { name: "playing"; id: number; conceptIds: string[]; startedAt: number }
  | { name: "summary"; state: ConnectState; startedAt: number };

export function ConnectPairs() {
  const t = useTranslations();
  const mounted = useMounted();
  const { sfx } = useAudio();
  const { native, learn } = useLanguagePair();
  const pairs = useSettings((s) => s.connectPairs);
  const set = useSettings((s) => s.set);
  const [topic, setTopic] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>({ name: "setup" });
  const title = `${connectPairs.icon} ${t("games.connect-pairs.name")}`;

  if (!mounted) return null;

  if (!learn) {
    return (
      <GameShell title={title}>
        <h2 className="mb-4 text-2xl font-extrabold">
          {t("langPicker.title")}
        </h2>
        <LangChoices />
      </GameShell>
    );
  }

  const start = async () => {
    const pool = conceptsFor(learn, native, topic ?? undefined);
    const size = (PAIR_OPTIONS as readonly number[]).includes(pairs)
      ? pairs
      : 4;
    const { knownIds } = await learningState(learn);
    const picked = pickDistinct(
      pool.length >= size ? pool : conceptsFor(learn, native),
      size,
      learn,
      knownIds,
    );
    // Empty board would never reach "done"; guarded by the topic picker always having 4+ words.
    if (!picked.length) return;
    const now = Date.now();
    setStage({
      name: "playing",
      id: now,
      conceptIds: picked.map((c) => c.id),
      startedAt: now,
    });
  };

  if (stage.name === "playing") {
    return (
      <ConnectBoard
        key={stage.id}
        conceptIds={stage.conceptIds}
        learn={learn}
        onQuit={() => setStage({ name: "setup" })}
        onFinish={(state) =>
          setStage({ name: "summary", state, startedAt: stage.startedAt })
        }
      />
    );
  }

  if (stage.name === "summary") {
    const result = connectSummary(stage.state);
    return (
      <Summary
        gameId={connectPairs.id}
        mode="connect"
        result={result}
        scored
        headline={t("memory.result", {
          pairs: result.total,
          moves: result.moves,
        })}
        // Every word ends up matched; ones missed along the way get marked wrong first,
        // then right, so the review box reflects the trouble the child actually had.
        answers={[
          ...result.wrongIds.map((conceptId) => ({
            conceptId,
            correct: false,
          })),
          ...stage.state.matched.map((conceptId) => ({
            conceptId,
            correct: true,
          })),
        ]}
        learn={learn}
        native={native}
        topic={topic}
        startedAt={stage.startedAt}
        onPlayAgain={start}
      />
    );
  }

  const pick =
    <T,>(fn: (v: T) => void) =>
    (v: T) => {
      sfx("tap");
      fn(v);
    };

  return (
    <GameShell title={title}>
      <div className="flex flex-col gap-7 pb-6">
        <Step title={t("setup.topic")}>
          <TopicPicker
            learn={learn}
            native={native}
            value={topic}
            onPick={pick(setTopic)}
          />
        </Step>
        <Step title={t("memory.pairs")}>
          <Chips
            options={PAIR_OPTIONS.map((n) => ({
              value: n,
              label: t("memory.pairsN", { n }),
            }))}
            value={pairs}
            onPick={pick((n: number) => set({ connectPairs: n }))}
          />
        </Step>
        <StartButton onClick={start} />
      </div>
    </GameShell>
  );
}
