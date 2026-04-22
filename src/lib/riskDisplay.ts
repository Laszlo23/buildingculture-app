/** Map static 1–5 model score to a 0–10 display (one decimal) for the dashboard. */
export function riskScoreToOutOf10(modelScore: number): number {
  return Math.min(10, Math.round((1.1 + (modelScore / 5) * 8.7) * 10) / 10);
}

/** Derive a simple radar (0–100) for the four DeFi risk dimensions from model score. */
export function riskRadarFromScore(modelScore: number) {
  const t = (modelScore - 1) / 4;
  return {
    "Smart contract": 28 + 52 * t,
    "Market vol.": 22 + 58 * t,
    "Liquidity": 18 + 50 * t,
    "Complexity": 30 + 45 * t,
  };
}
