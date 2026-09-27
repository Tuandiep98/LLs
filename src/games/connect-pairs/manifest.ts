import type { GameManifest } from "../types";

export const connectPairs = {
  id: "connect-pairs",
  icon: "🔗",
  color: "yellow",
  href: "/games/connect-pairs",
  modes: ["connect"],
  status: "ready",
} as const satisfies GameManifest;
