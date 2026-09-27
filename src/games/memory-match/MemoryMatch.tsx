"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { LangChoices } from "@/components/LangPicker";
import { conceptsFor } from "@/content";
import { useAudio } from "@/lib/audio";
import { useSettings } from "@/lib/settings";
import { useLanguagePair } from "@/lib/useLearnLang";
import { useMounted } from "@/lib/useMounted";
import { Chips, GameShell, ModeCards, StartButton, Step, TopicPicker } from "../shared/SetupParts";
import { Summary } from "../shared/Summary";
import { memorySummary, PAIR_OPTIONS, pickPairs, type MemoryState, type Variant } from "./engine";
import { memoryMatch } from "./manifest";
import { MemoryBoard } from "./MemoryBoard";

type Stage =
  | { name: "setup" }
  | { name: "playing"; id: number; conceptIds: string[]; startedAt: number }
  | { name: "summary"; state: MemoryState; startedAt: number };

export function MemoryMatch() {
  const t = useTranslations();
  const mounted = useMounted();
  const { sfx } = useAudio();
  const { native, learn } = useLanguagePair();
  const pairs = useSettings((s) => s.memoryPairs);
  const set = useSettings((s) => s.set);
  const [topic, setTopic] = useState<string | null>(null);
  const [variant, setVariant] = useState<Variant>("pictures");
  const [stage, setStage] = useState<Stage>({ name: "setup" });
  const title = `${memoryMatch.icon} ${t("games.memory-match.name")}`;

  if (!mounted) return null;

  if (!learn) {
    return (
      <GameShell title={title}>
        <h2 className="mb-4 text-2xl font-extrabold">{t("langPicker.title")}</h2>
        <LangChoices />
      </GameShell>
    );
  }

  const start = () => {
    const pool = conceptsFor(learn, native, topic ?? undefined);
    const size = (PAIR_OPTIONS as readonly number[]).includes(pairs) ? pairs : 4;
    const picked = pickPairs(pool.length >= size ? pool : conceptsFor(learn, native), size, learn);
    const now = Date.now();
    setStage({ name: "playing", id: now, conceptIds: picked.map((c) => c.id), startedAt: now });
  };

  if (stage.name === "playing") {
    return (
      <MemoryBoard
        key={stage.id}
        conceptIds={stage.conceptIds}
        variant={variant}
        learn={learn}
        onQuit={() => setStage({ name: "setup" })}
        onFinish={(state) => setStage({ name: "summary", state, startedAt: stage.startedAt })}
      />
    );
  }

  if (stage.name === "summary") {
    const result = memorySummary(stage.state);
    return (
      <Summary
        gameId={memoryMatch.id}
        mode={variant}
        // Mistakes in a memory game are about memory, not the words: no review list.
        result={{ ...result, wrongIds: [] }}
        scored
        headline={t("memory.result", { pairs: result.total, moves: result.moves })}
        // Matching a picture with its written word shows the word is known.
        answers={variant === "words" ? stage.state.matched.map((conceptId) => ({ conceptId, correct: true })) : []}
        learn={learn}
        native={native}
        topic={topic}
        startedAt={stage.startedAt}
        onPlayAgain={start}
      />
    );
  }

  const pick = <T,>(fn: (v: T) => void) => (v: T) => {
    sfx("tap");
    fn(v);
  };

  return (
    <GameShell title={title}>
      <div className="flex flex-col gap-7 pb-6">
        <Step title={t("setup.topic")}>
          <TopicPicker learn={learn} native={native} value={topic} onPick={pick(setTopic)} />
        </Step>
        <Step title={t("setup.mode")}>
          <ModeCards
            options={[
              {
                value: "pictures" as const,
                icon: "🐱🐱",
                name: t("memory.modePictures"),
                desc: t("memory.modePicturesDesc"),
                color: "bg-sky",
              },
              {
                value: "words" as const,
                icon: "🐱🔤",
                name: t("memory.modeWords"),
                desc: t("memory.modeWordsDesc"),
                color: "bg-orange",
              },
            ]}
            value={variant}
            onPick={pick(setVariant)}
          />
        </Step>
        <Step title={t("memory.pairs")}>
          <Chips
            options={PAIR_OPTIONS.map((n) => ({ value: n, label: t("memory.pairsN", { n }) }))}
            value={pairs}
            onPick={pick((n: number) => set({ memoryPairs: n }))}
          />
        </Step>
        <StartButton onClick={start} />
      </div>
    </GameShell>
  );
}
