import type { Mode } from "../shared/quiz/engine";
import type { GameManifest } from "../types";

export const trueFalse = {
  id: "true-false",
  icon: "✅",
  color: "green",
  href: "/games/true-false",
  modes: ["play"] as readonly Mode[],
  status: "ready",
} as const satisfies GameManifest;
