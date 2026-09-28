import type { GameManifest } from "../types";

export const wordBuilder = {
  id: "word-builder",
  icon: "🧩",
  color: "orange",
  href: "/games/word-builder",
  modes: ["build"],
  status: "ready",
} as const satisfies GameManifest;
