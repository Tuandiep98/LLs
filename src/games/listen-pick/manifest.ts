import type { Mode } from "../shared/quiz/engine";
import type { GameManifest } from "../types";

export const listenPick = {
  id: "listen-pick",
  icon: "👂",
  color: "sky",
  href: "/games/listen-pick",
  modes: ["play"] as readonly Mode[],
  status: "ready",
} as const satisfies GameManifest;
