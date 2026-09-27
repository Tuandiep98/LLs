"use client";

import { QuizFlow } from "../shared/quiz/QuizFlow";
import { ListenScreen } from "./ListenScreen";
import { listenPick } from "./manifest";

export function ListenPick() {
  return <QuizFlow game={listenPick} Screen={ListenScreen} />;
}
