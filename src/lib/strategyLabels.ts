import { strategies } from "@/data/club";

/** Map on-chain strategy index (registry id as string) to product label. */
export function labelForStrategyId(strategyId: string): string {
  const i = Number.parseInt(strategyId, 10);
  if (!Number.isFinite(i) || strategies.length === 0) return `Strategy ${strategyId}`;
  const idx = Math.min(Math.max(0, i), strategies.length - 1);
  return strategies[idx]?.name ?? `Strategy ${strategyId}`;
}
