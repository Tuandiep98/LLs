import type { Mode } from "../shared/quiz/engine";
import type { GameManifest } from "../types";

export const pictureGuess = {
  id: "picture-guess",
  icon: "🖼️",
  color: "orange",
  href: "/games/picture-guess",
  modes: ["watch", "play"] as readonly Mode[],
  status: "ready",
} as const satisfies GameManifest;
