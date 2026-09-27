import type { GameManifest } from "../types";

export const pictureGuess = {
  id: "picture-guess",
  icon: "🖼️",
  color: "orange",
  href: "/games/picture-guess",
  modes: ["watch", "play"],
  status: "ready",
} as const satisfies GameManifest;
