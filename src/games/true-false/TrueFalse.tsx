"use client";

import { buildTrueFalseRounds } from "../shared/quiz/deck";
import { QuizFlow } from "../shared/quiz/QuizFlow";
import { trueFalse } from "./manifest";
import { TrueFalseScreen } from "./TrueFalseScreen";

export function TrueFalse() {
  return (
    <QuizFlow
      game={trueFalse}
      Screen={TrueFalseScreen}
      makeRounds={(deck, all, learn) => buildTrueFalseRounds(deck, all, learn)}
    />
  );
}
