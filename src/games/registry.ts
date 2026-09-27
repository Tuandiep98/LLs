import { balloonPop } from "./balloon-pop/manifest";
import { listenPick } from "./listen-pick/manifest";
import { memoryMatch } from "./memory-match/manifest";
import { pictureGuess } from "./picture-guess/manifest";
import { trueFalse } from "./true-false/manifest";
import type { GameManifest } from "./types";

export const games: GameManifest[] = [pictureGuess, listenPick, trueFalse, balloonPop, memoryMatch];
