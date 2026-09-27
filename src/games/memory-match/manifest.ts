import type { GameManifest } from "../types";

export const memoryMatch = {
  id: "memory-match",
  icon: "🃏",
  color: "grape",
  href: "/games/memory-match",
  modes: ["pictures", "words"],
  status: "ready",
} as const satisfies GameManifest;
