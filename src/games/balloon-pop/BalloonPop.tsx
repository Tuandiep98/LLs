"use client";

import { QuizFlow } from "../shared/quiz/QuizFlow";
import { BalloonScreen } from "./BalloonScreen";
import { balloonPop } from "./manifest";

export function BalloonPop() {
  return <QuizFlow game={balloonPop} Screen={BalloonScreen} />;
}
