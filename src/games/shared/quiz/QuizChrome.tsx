"use client";

import { useTranslations } from "next-intl";
import { Mascot } from "@/components/Mascot";
import { Modal } from "@/components/Modal";
import type { GameState } from "./engine";
import { REVEAL_MS, type QuizSession } from "./useQuizSession";

/** Close button, progress dots and score. */
export function QuizTopBar({ session }: { session: QuizSession }) {
  const t = useTranslations();
  const { state } = session;
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="btn-chunky btn-icon bg-surface text-ink"
        onClick={() => session.setQuitOpen(true)}
        aria-label={t("nav.close")}
      >
        ✕
      </button>
      <ProgressDots state={state} />
      {state.mode === "play" && (
        <div
          className="card-chunky flex items-center gap-1 px-3 py-1.5 font-display text-xl font-extrabold"
          aria-label={t("play.score")}
        >
          <span aria-hidden>⭐</span>
          {state.score}
          {state.streak >= 2 && (
            <span className="ml-1 text-base" aria-hidden>
              🔥{state.streak}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function QuitModal({ session, onQuit }: { session: QuizSession; onQuit: () => void }) {
  const t = useTranslations("play");
  return (
    <Modal open={session.quitOpen} onClose={() => session.setQuitOpen(false)} title={t("quitTitle")}>
      <div className="flex flex-col items-center gap-4">
        <Mascot mood="oops" className="w-32" />
        <div className="grid w-full grid-cols-2 gap-3">
          <button type="button" className="btn-chunky bg-surface text-ink" onClick={onQuit}>
            {t("quitYes")}
          </button>
          <button type="button" className="btn-chunky bg-green" onClick={() => session.setQuitOpen(false)}>
            {t("quitNo")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/** "Next" with a bar that fills until the automatic advance. */
export function NextButton({ session }: { session: QuizSession }) {
  const t = useTranslations("common");
  const { state, halted } = session;
  if (state.mode !== "play" || state.phase !== "reveal") return null;
  return (
    <button
      type="button"
      className="btn-chunky relative w-full overflow-hidden bg-yellow"
      onClick={() => session.dispatch({ type: "next" })}
    >
      {!halted && (
        <span
          key={state.index}
          className="absolute inset-y-0 left-0 bg-black/10"
          style={{ animation: `lls-fill ${REVEAL_MS.play}ms linear forwards` }}
          aria-hidden
        />
      )}
      <span className="relative">{t("next")} ➜</span>
    </button>
  );
}

/** Short feedback line after answering ("Great job!", "Time's up!"). */
export function useFeedbackText(session: QuizSession) {
  const t = useTranslations("play");
  const r = session.lastResult;
  if (!r) return null;
  return r.correct ? t("correct") : r.choiceId === null ? t("timeUp") : t("wrong");
}

function ProgressDots({ state }: { state: GameState }) {
  const t = useTranslations("play");
  return (
    <div
      className="flex flex-1 flex-wrap items-center justify-center gap-1.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={state.rounds.length}
      aria-valuenow={state.index + 1}
      aria-label={t("progress", { current: state.index + 1, total: state.rounds.length })}
    >
      {state.rounds.map((r, i) => {
        const result = state.mode === "play" ? state.results[i] : undefined;
        const color = result
          ? result.correct
            ? "bg-correct"
            : "bg-wrong"
          : i < state.index || (i === state.index && state.phase === "reveal")
            ? "bg-sky"
            : "bg-surface";
        return (
          <span
            key={r.conceptId + i}
            className={`h-3.5 rounded-full border-2 border-outline transition-all ${color} ${i === state.index ? "w-7" : "w-3.5"}`}
          />
        );
      })}
    </div>
  );
}

export const screenShell =
  "mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]";
