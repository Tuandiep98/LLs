import { listenPick } from "./listen-pick/manifest";
import { memoryMatch } from "./memory-match/manifest";
import { pictureGuess } from "./picture-guess/manifest";
import type { GameManifest } from "./types";

export const games: GameManifest[] = [pictureGuess, listenPick, memoryMatch];
