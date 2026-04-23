import { getDb } from "../lib/db.js";

/** XP granted per task (first completion that UTC day). */
export const XP_CHECK_IN = 25;
export const XP_COMMUNITY_PULSE = 40;
/** When X API verifies a promo tweet. */
export const XP_SHARE_VERIFIED = 75;
/** When X API is not configured — honor system. */
export const XP_SHARE_TRUST = 35;

/** Tier thresholds (community XP only) — aligned with `src/data/club.ts` `levels[].min`. */
const TIERS = [
  { name: "Explorer", min: 0 },
  { name: "Investor", min: 2_500 },
  { name: "Strategist", min: 6_000 },
  { name: "Governor", min: 12_000 },
  { name: "Architect", min: 25_000 },
] as const;

function norm(addr: string) {
  return addr.toLowerCase();
}

export function getCommunityXp(address: `0x${string}`): number {
  const row = getDb()
    .prepare("SELECT community_xp FROM member_community_xp WHERE address = ?")
    .get(norm(address)) as { community_xp: number } | undefined;
  return row?.community_xp ?? 0;
}

/** Adds XP and returns new total. */
export function addCommunityXp(address: `0x${string}`, delta: number): number {
  if (delta <= 0) return getCommunityXp(address);
  const k = norm(address);
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO member_community_xp (address, community_xp, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(address) DO UPDATE SET
         community_xp = community_xp + excluded.community_xp,
         updated_at = excluded.updated_at`,
    )
    .run(k, delta, now);
  return getCommunityXp(address);
}

export type GrowthDisplay = {
  communityXp: number;
  tierName: string;
  /** Progress within current tier (for progress bar numerator). */
  xpIntoTier: number;
  /** Span of current tier (denominator for bar). Top tier uses a synthetic span. */
  xpSpanInTier: number;
};

export function getGrowthDisplay(address: `0x${string}`): GrowthDisplay {
  const xp = getCommunityXp(address);
  let idx = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (xp >= TIERS[i].min) {
      idx = i;
      break;
    }
  }
  const tier = TIERS[idx];
  const next = TIERS[idx + 1];
  const xpIntoTier = xp - tier.min;
  const xpSpanInTier = next ? next.min - tier.min : Math.max(50_000, xpIntoTier + 10_000);
  return {
    communityXp: xp,
    tierName: tier.name,
    xpIntoTier,
    xpSpanInTier,
  };
}
