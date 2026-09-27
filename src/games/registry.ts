import { listenPick } from "./listen-pick/manifest";
import { pictureGuess } from "./picture-guess/manifest";
import type { GameManifest } from "./types";

export const games: GameManifest[] = [
  pictureGuess,
  listenPick,
  { id: "memory-match", icon: "🃏", color: "grape", href: "/games/memory-match", modes: ["play"], status: "soon" },
];
