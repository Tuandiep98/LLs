"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type ReactNode } from "react";
import { Mascot } from "@/components/Mascot";

const HOLD_MS = 3000;

/** Keeps little kids out of settings/links: press and hold for 3 seconds. */
export function ParentalGate({ children }: { children: ReactNode }) {
  const t = useTranslations("parents");
  const [open, setOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  if (open) return <>{children}</>;

  const start = () => {
    setHolding(true);
    timer.current = window.setTimeout(() => setOpen(true), HOLD_MS);
  };
  const cancel = () => {
    setHolding(false);
    window.clearTimeout(timer.current);
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 py-8 text-center">
      <Mascot mood="think" className="w-40" />
      <h1 className="text-3xl font-extrabold">🔒 {t("gateTitle")}</h1>
      <p className="text-lg text-ink-soft">{t("gateHint")}</p>
      <button
        type="button"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onContextMenu={(e) => e.preventDefault()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && !e.repeat && start()}
        onKeyUp={cancel}
        className="btn-chunky relative h-28 w-28 overflow-hidden rounded-full bg-grape text-2xl select-none"
      >
        {holding && (
          <span
            className="absolute inset-x-0 bottom-0 bg-black/20"
            style={{ animation: `lls-grow ${HOLD_MS}ms linear forwards` }}
            aria-hidden
          />
        )}
        <span className="relative">{t("gateHold")}</span>
      </button>
    </div>
  );
}
