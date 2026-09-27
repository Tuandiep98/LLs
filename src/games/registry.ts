import { pictureGuess } from "./picture-guess/manifest";
import type { GameManifest } from "./types";

export const games: GameManifest[] = [
  pictureGuess,
  { id: "listen-pick", icon: "👂", color: "sky", href: "/games/listen-pick", modes: ["play"], status: "soon" },
  { id: "memory-match", icon: "🃏", color: "grape", href: "/games/memory-match", modes: ["play"], status: "soon" },
];
