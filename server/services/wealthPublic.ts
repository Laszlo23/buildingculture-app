import type { MemberProfile } from "./profileStore.ts";
import { putProfile } from "./profileStore.ts";
import type { WealthPoint } from "./wealthHistoryStore.ts";
import { appendWealthSnapshot } from "./wealthHistoryStore.ts";
import type { fetchPortfolioForAddress } from "./portfolio.ts";

export type PortfolioLike = Awaited<ReturnType<typeof fetchPortfolioForAddress>>;

export type WealthRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

const RANGE_MS: Record<WealthRange, number> = {
  "1M": 30 * 24 * 60 * 60 * 1000,
  "3M": 90 * 24 * 60 * 60 * 1000,
  "6M": 180 * 24 * 60 * 60 * 1000,
  "1Y": 365 * 24 * 60 * 60 * 1000,
  ALL: 20 * 365 * 24 * 60 * 60 * 1000,
};

function hash01(addr: string, salt: number) {
  let h = 0;
  const s = `${addr}:${salt}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 1000) / 1000;
}

/** Deterministic backfill when we have few history points (until a full indexer lands). */
export function buildWealthSeries(
  address: `0x${string}`,
  history: WealthPoint[],
  currentVault: number,
  currentYield: number,
  range: WealthRange,
): { t: string; vaultUsd: number; cumulativeYieldUsd: number }[] {
  const now = Date.now();
  const from = now - RANGE_MS[range];
  const raw = history.filter((p) => new Date(p.at).getTime() >= from);
  if (raw.length >= 8) {
    return raw.map((p) => ({
      t: p.at,
      vaultUsd: p.vaultUsd,
      cumulativeYieldUsd: p.cumulativeYieldUsd,
    }));
  }
  const months = range === "1M" ? 1 : range === "3M" ? 3 : range === "6M" ? 6 : range === "1Y" ? 12 : 24;
  const out: { t: string; vaultUsd: number; cumulativeYieldUsd: number }[] = [];
  for (let i = 0; i <= months; i++) {
    const t = new Date(now - (months - i) * 30 * 24 * 60 * 60 * 1000).toISOString();
    const u = i / Math.max(1, months);
    const ease = 1 - (1 - u) ** 1.35;
    const noise = 0.92 + 0.08 * hash01(address.toLowerCase(), i);
    out.push({
      t,
      vaultUsd: Math.max(0, currentVault * ease * noise),
      cumulativeYieldUsd: Math.max(0, currentYield * ease * (0.85 + 0.15 * hash01(address.toLowerCase(), i + 99))),
    });
  }
  if (raw.length) {
    out[out.length - 1] = {
      t: raw[raw.length - 1].at,
      vaultUsd: currentVault,
      cumulativeYieldUsd: currentYield,
    };
  }
  return out;
}

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  tier?: "bronze" | "silver" | "gold" | "legend";
};

export function computeAchievements(p: PortfolioLike): AchievementDef[] {
  const v = p.totalSavings;
  const y = p.yieldEarned;
  const gv = p.governanceWeight;
  const used = p.strategies.filter((s) => s.allocationBps > 0).length;
  return [
    {
      id: "first-deposit",
      title: "First deposit",
      description: "Opened a vault position on OSC.",
      unlocked: v > 0 || y > 0,
      tier: "bronze",
    },
    {
      id: "investor-1k",
      title: "$1k vault balance",
      description: "Investor path — serious capital in the club vault.",
      unlocked: v >= 1000,
      tier: "silver",
    },
    {
      id: "strategist-10k",
      title: "$10k vault balance",
      description: "Strategist tier — scaled conviction.",
      unlocked: v >= 10_000,
      tier: "gold",
    },
    {
      id: "architect-100k",
      title: "$100k vault balance",
      description: "Architect tier — protocol-scale position.",
      unlocked: v >= 100_000,
      tier: "legend",
    },
    {
      id: "dao-voter",
      title: "DAO voter",
      description: "Voting power detected on-chain.",
      unlocked: gv >= 0.5,
      tier: "silver",
    },
    {
      id: "dao-governor",
      title: "DAO governor",
      description: "Meaningful voting weight across proposals.",
      unlocked: gv >= 25,
      tier: "gold",
    },
    {
      id: "multi-strategy",
      title: "Cross-strategy allocator",
      description: "Active weights across more than one strategy.",
      unlocked: used >= 2,
      tier: "bronze",
    },
  ];
}

export type LevelId = "explorer" | "investor" | "strategist" | "governor" | "architect";

export function computeLevel(p: PortfolioLike): { id: LevelId; label: string; xp: number; xpToNext: number } {
  const v = p.totalSavings;
  const y = p.yieldEarned;
  const gv = p.governanceWeight;
  const xp = Math.floor(v * 2 + y * 8 + gv * 120 + p.strategies.filter((s) => s.allocationBps > 0).length * 400);
  let id: LevelId = "explorer";
  let label = "Explorer";
  if (v >= 100_000) {
    id = "architect";
    label = "Architect";
  } else if (v >= 10_000 || gv >= 40) {
    id = "governor";
    label = "Governor";
  } else if (v >= 1000 || gv >= 10) {
    id = "strategist";
    label = "Strategist";
  } else if (v >= 100 || y >= 50) {
    id = "investor";
    label = "Investor";
  }
  const tierXp = id === "explorer" ? 2500 : id === "investor" ? 8000 : id === "strategist" ? 25_000 : id === "governor" ? 80_000 : 200_000;
  const xpToNext = Math.max(100, tierXp - (xp % tierXp));
  return { id, label, xp, xpToNext };
}

export function buildStrategyBreakdown(p: PortfolioLike): {
  strategyId: string;
  depositedUsd: number;
  yieldUsd: number;
  roiPct: number;
}[] {
  const rows = p.strategies.filter((s) => s.allocationBps > 0);
  const sumBps = rows.reduce((a, s) => a + s.allocationBps, 0) || 1;
  const v = p.totalSavings;
  const y = p.yieldEarned;
  return rows.map((s) => {
    const w = s.allocationBps / sumBps;
    const depositedUsd = v * w;
    const yieldUsd = y * w;
    const roiPct = depositedUsd > 1e-6 ? (yieldUsd / depositedUsd) * 100 : 0;
    return {
      strategyId: s.id,
      depositedUsd,
      yieldUsd,
      roiPct,
    };
  });
}

export function touchFirstVaultInteraction(address: `0x${string}`, profile: MemberProfile) {
  if (profile.firstVaultInteractionAt) return;
  putProfile(address, { firstVaultInteractionAt: new Date().toISOString() });
}

export function recordWealthForAddress(address: `0x${string}`, portfolio: PortfolioLike) {
  const pts = appendWealthSnapshot(
    address,
    portfolio.totalSavings,
    portfolio.yieldEarned,
    portfolio.governanceWeight,
  );
  return pts;
}

export function getPublicWealthAllowed(profile: MemberProfile): boolean {
  return profile.publicWealthProfile !== false;
}
