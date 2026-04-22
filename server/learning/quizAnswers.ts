import type { RouteId } from "../services/learningStore.js";

/** Correct zero-based option indices per route (must match question order in UI). */
export const quizAnswerKey: Record<RouteId, number[]> = {
  rwa: [1, 2, 0, 2],
  authenticity: [0, 3, 1, 2],
  truth: [2, 1, 0, 3],
};

export function answersMatch(routeId: RouteId, submitted: number[]): boolean {
  const key = quizAnswerKey[routeId];
  if (!key || submitted.length !== key.length) return false;
  return key.every((v, i) => submitted[i] === v);
}
