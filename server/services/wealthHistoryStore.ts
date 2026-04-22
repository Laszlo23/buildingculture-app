import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "../.data");
const file = join(dir, "wealth-history.json");

export type WealthPoint = {
  at: string;
  vaultUsd: number;
  cumulativeYieldUsd: number;
  votingPower: number;
};

type Book = Record<string, WealthPoint[]>;

const MAX_POINTS = 500;

function readAll(): Book {
  if (!existsSync(file)) return {};
  try {
    const raw = readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as Book;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data: Book) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function norm(addr: string) {
  return addr.toLowerCase();
}

/** UTC date YYYY-MM-DD for dedupe */
function dayKey(iso: string) {
  return iso.slice(0, 10);
}

export function appendWealthSnapshot(
  address: `0x${string}`,
  vaultUsd: number,
  cumulativeYieldUsd: number,
  votingPower: number,
): WealthPoint[] {
  const k = norm(address);
  const book = readAll();
  const prev = [...(book[k] ?? [])];
  const now = new Date().toISOString();
  const last = prev[prev.length - 1];
  if (last && dayKey(last.at) === dayKey(now)) {
    last.vaultUsd = vaultUsd;
    last.cumulativeYieldUsd = cumulativeYieldUsd;
    last.votingPower = votingPower;
    last.at = now;
    book[k] = prev.slice(-MAX_POINTS);
    writeAll(book);
    return book[k];
  }
  prev.push({ at: now, vaultUsd, cumulativeYieldUsd, votingPower });
  book[k] = prev.slice(-MAX_POINTS);
  writeAll(book);
  return book[k];
}

export function getWealthHistory(address: `0x${string}`): WealthPoint[] {
  const book = readAll();
  return book[norm(address)] ?? [];
}

export type LeaderEntry = {
  address: string;
  vaultUsd: number;
  yieldUsd: number;
  votingPower: number;
  strategyRoiPct: number;
  votesCast: number;
  updatedAt: string;
};

/** Latest snapshot per address (for leaderboards). */
export function getAllLatestSnapshots(): LeaderEntry[] {
  const book = readAll();
  const out: LeaderEntry[] = [];
  for (const [addr, pts] of Object.entries(book)) {
    if (!pts.length) continue;
    const last = pts[pts.length - 1];
    const first = pts[0];
    const vaultUsd = last.vaultUsd;
    const yieldUsd = last.cumulativeYieldUsd;
    const impliedDeposit = Math.max(vaultUsd, first.vaultUsd * 0.5, 1e-6);
    const strategyRoiPct = Math.min(999, (yieldUsd / impliedDeposit) * 100);
    out.push({
      address: addr.startsWith("0x") ? addr : `0x${addr}`,
      vaultUsd,
      yieldUsd,
      votingPower: last.votingPower,
      strategyRoiPct,
      votesCast: Math.round(Math.min(100, last.votingPower / 2)),
      updatedAt: last.at,
    });
  }
  return out;
}
