"use client";

import { QuizFlow } from "../shared/quiz/QuizFlow";
import { GameScreen } from "./GameScreen";
import { pictureGuess } from "./manifest";

export function PictureGuess() {
  return <QuizFlow game={pictureGuess} Screen={GameScreen} />;
}
