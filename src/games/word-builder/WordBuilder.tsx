"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { LangChoices } from "@/components/LangPicker";
import { concepts, conceptsFor } from "@/content";
import { useAudio } from "@/lib/audio";
import { useSettings } from "@/lib/settings";
import { learningState } from "@/lib/storage/record";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";
import { pickDistinct } from "../shared/quiz/deck";
import { Chips, GameShell, StartButton, Step, TopicPicker } from "../shared/SetupParts";
import { Summary } from "../shared/Summary";
import { BuildBoard } from "./BuildBoard";
import { buildRound, buildSummary, canBuild, WORD_OPTIONS, type BuildRound, type BuildState } from "./engine";
import { wordBuilder } from "./manifest";

const MIN_TOPIC_WORDS = 3;

type Stage =
  | { name: "setup" }
  | { name: "playing"; id: number; rounds: BuildRound[]; startedAt: number }
  | { name: "summary"; state: BuildState; startedAt: number };

export function WordBuilder() {
  const t = useTranslations();
  const mounted = useMounted();
  const { sfx } = useAudio();
  const { native, learn } = useLanguagePair();
  const words = useSettings((s) => s.buildWords);
  const set = useSettings((s) => s.set);
  const [topic, setTopic] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>({ name: "setup" });
  const title = `${wordBuilder.icon} ${t("games.word-builder.name")}`;

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
    const size = (WORD_OPTIONS as readonly number[]).includes(words) ? words : WORD_OPTIONS[0];
    const buildable = (list: typeof concepts) => list.filter((c) => canBuild(c, learn));
    const pool = buildable(conceptsFor(learn, native, topic ?? undefined));
    const { knownIds } = await learningState(learn);
    // A small topic gives a shorter game; one with almost no buildable words
    // (e.g. Chinese numbers are single characters) falls back to all words.
    const source = pool.length >= MIN_TOPIC_WORDS ? pool : buildable(conceptsFor(learn, native));
    const picked = pickDistinct(source, size, learn, knownIds);
    if (!picked.length) return;
    const now = Date.now();
    setStage({ name: "playing", id: now, rounds: picked.map((c) => buildRound(c, concepts, learn)), startedAt: now });
  };

  if (stage.name === "playing") {
    return (
      <BuildBoard
        key={stage.id}
        rounds={stage.rounds}
        learn={learn}
        native={native}
        onQuit={() => setStage({ name: "setup" })}
        onFinish={(state) => setStage({ name: "summary", state, startedAt: stage.startedAt })}
      />
    );
  }

  if (stage.name === "summary") {
    const result = buildSummary(stage.state);
    return (
      <Summary
        gameId={wordBuilder.id}
        mode="build"
        result={result}
        scored
        answers={stage.state.results.map((r) => ({ conceptId: r.conceptId, correct: r.mistakes === 0 }))}
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
          <TopicPicker learn={learn} native={native} value={topic} onPick={pick(setTopic)} />
        </Step>
        <Step title={t("setup.count")}>
          <Chips
            options={WORD_OPTIONS.map((n) => ({ value: n, label: String(n) }))}
            value={words}
            onPick={pick((n: number) => set({ buildWords: n }))}
          />
        </Step>
        <StartButton onClick={start} />
      </div>
    </GameShell>
  );
}
