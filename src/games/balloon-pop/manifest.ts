import type { Mode } from "../shared/quiz/engine";
import type { GameManifest } from "../types";

export const balloonPop = {
  id: "balloon-pop",
  icon: "🎈",
  color: "red",
  href: "/games/balloon-pop",
  modes: ["play"] as readonly Mode[],
  status: "ready",
} as const satisfies GameManifest;
