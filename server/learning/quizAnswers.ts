import { learningRoutes } from "../../src/data/learningRoutes.ts";
import type { RouteId } from "../services/learningStore.js";

/** Correct zero-based option indices per route (derived from `src/data/learningRoutes.ts` so UI and API never drift). */
export const quizAnswerKey: Record<RouteId, number[]> = {
  rwa: learningRoutes.rwa.quiz.map((q) => q.correctIndex),
  authenticity: learningRoutes.authenticity.quiz.map((q) => q.correctIndex),
  truth: learningRoutes.truth.quiz.map((q) => q.correctIndex),
};

export function answersMatch(routeId: RouteId, submitted: number[]): boolean {
  const key = quizAnswerKey[routeId];
  if (!key || submitted.length !== key.length) return false;
  return key.every((v, i) => submitted[i] === v);
}
