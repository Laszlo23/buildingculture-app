import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "../.data");
const file = join(dir, "referrals.json");

type Book = Record<string, { invited: string[]; updatedAt: string }>;

function readAll(): Book {
  if (!existsSync(file)) return {};
  try {
    const raw = readFileSync(file, "utf8");
    const p = JSON.parse(raw) as Book;
    return p && typeof p === "object" ? p : {};
  } catch {
    return {};
  }
}

function writeAll(data: Book) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function norm(a: string): `0x${string}` {
  return a.toLowerCase() as `0x${string}`;
}

/** One invitee can only be attributed to one inviter (first claim wins). */
export function recordReferral(inviter: `0x${string}`, invitee: `0x${string}`): { ok: boolean; count: number; duplicate: boolean } {
  if (norm(inviter) === norm(invitee)) return { ok: false, count: 0, duplicate: true };
  const book = readAll();
  for (const data of Object.values(book)) {
    if (data.invited.some((x) => norm(x) === norm(invitee))) {
      return { ok: false, count: 0, duplicate: true };
    }
  }
  const k = norm(inviter);
  if (!book[k]) book[k] = { invited: [], updatedAt: new Date().toISOString() };
  if (book[k]!.invited.includes(norm(invitee))) {
    return { ok: true, count: book[k].invited.length, duplicate: true };
  }
  book[k].invited.push(norm(invitee));
  book[k].updatedAt = new Date().toISOString();
  writeAll(book);
  return { ok: true, count: book[k].invited.length, duplicate: false };
}

export function getReferralCount(address: `0x${string}`): number {
  return readAll()[norm(address)]?.invited.length ?? 0;
}

export function referralBoostPct(count: number): number {
  if (count >= 50) return 1.5;
  if (count >= 20) return 1.25;
  if (count >= 5) return 1.0;
  if (count >= 1) return 0.25;
  return 0;
}

export type ReferralTier = "none" | "builder" | "strategist" | "ambassador";

export function referralTier(count: number): { tier: ReferralTier; label: string } {
  if (count >= 50) return { tier: "ambassador", label: "DAO Ambassador" };
  if (count >= 20) return { tier: "strategist", label: "Strategist" };
  if (count >= 1) return { tier: "builder", label: "Club Builder" };
  return { tier: "none", label: "—" };
}

const MILESTONES = [1, 5, 20, 50] as const;

export function nextMilestoneProgress(count: number) {
  const next = MILESTONES.find((m) => m > count) ?? 50;
  const prev = [...MILESTONES].filter((m) => m <= count).pop() ?? 0;
  const span = next - prev;
  const p = span > 0 ? ((count - prev) / span) * 100 : 100;
  return { next, prev, pct: Math.min(100, Math.max(0, p)) };
}

export function getReferralStats(address: `0x${string}`) {
  const count = getReferralCount(address);
  return {
    address: norm(address),
    invites: count,
    boostPct: referralBoostPct(count),
    tier: referralTier(count),
    milestone: nextMilestoneProgress(count),
  };
}

export function leaderboardByInvites(limit: number) {
  const book = readAll();
  return Object.entries(book)
    .map(([addr, d]) => ({
      address: addr as `0x${string}`,
      invites: d.invited.length,
      boostPct: referralBoostPct(d.invited.length),
      tier: referralTier(d.invited.length).label,
    }))
    .sort((a, b) => b.invites - a.invites)
    .slice(0, limit);
}
