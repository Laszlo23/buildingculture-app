import { getDb } from "../lib/db.js";
import { isXApiConfigured } from "../lib/xApiEnv.js";
import {
  addCommunityXp,
  getGrowthDisplay,
  XP_CHECK_IN,
  XP_COMMUNITY_PULSE,
  XP_SHARE_TRUST,
  XP_SHARE_VERIFIED,
} from "./growthXpStore.js";

export type DailyTaskId = "check_in" | "share_x" | "community_pulse";

type DayTasks = {
  check_in: boolean;
  share_x: boolean;
  community_pulse: boolean;
};

function norm(addr: string) {
  return addr.toLowerCase();
}

export function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function utcYesterday(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function emptyDay(): DayTasks {
  return { check_in: false, share_x: false, community_pulse: false };
}

function rowToDay(row: { check_in: number; share_x: number; community_pulse: number } | undefined): DayTasks {
  if (!row) return emptyDay();
  return {
    check_in: Boolean(row.check_in),
    share_x: Boolean(row.share_x),
    community_pulse: Boolean(row.community_pulse),
  };
}

function ensureStreakRow(address: `0x${string}`) {
  const k = norm(address);
  getDb()
    .prepare(
      `INSERT OR IGNORE INTO daily_streaks (address, streak, last_check_in_date) VALUES (?, 0, NULL)`,
    )
    .run(k);
}

function ensureDayRow(address: `0x${string}`, date: string): DayTasks {
  const k = norm(address);
  getDb()
    .prepare(
      `INSERT OR IGNORE INTO daily_task_days (address, date, check_in, share_x, community_pulse)
       VALUES (?, ?, 0, 0, 0)`,
    )
    .run(k, date);
  const row = getDb()
    .prepare("SELECT check_in, share_x, community_pulse FROM daily_task_days WHERE address = ? AND date = ?")
    .get(k, date) as { check_in: number; share_x: number; community_pulse: number };
  return rowToDay(row);
}

export function getDailySnapshot(address: `0x${string}`) {
  const date = utcToday();
  ensureStreakRow(address);
  ensureDayRow(address, date);
  const k = norm(address);
  const streakRow = getDb()
    .prepare("SELECT streak, last_check_in_date FROM daily_streaks WHERE address = ?")
    .get(k) as { streak: number; last_check_in_date: string | null };
  const dayRow = getDb()
    .prepare("SELECT check_in, share_x, community_pulse FROM daily_task_days WHERE address = ? AND date = ?")
    .get(k, date) as { check_in: number; share_x: number; community_pulse: number };

  return {
    date,
    streak: streakRow?.streak ?? 0,
    tasks: rowToDay(dayRow),
    growth: getGrowthDisplay(address),
    capabilities: { shareXVerify: isXApiConfigured() },
  };
}

/**
 * Marks a task complete and grants community XP the first time that task is completed today.
 * For `share_x` when X API is configured, the HTTP route must call `verifyShareXForAddress` first.
 */
export function completeTask(
  address: `0x${string}`,
  taskId: DailyTaskId,
): ReturnType<typeof getDailySnapshot> {
  const k = norm(address);
  const date = utcToday();
  ensureStreakRow(address);
  const before = ensureDayRow(address, date);

  const awardIfFirst = (wasDone: boolean, xp: number) => {
    if (!wasDone && xp > 0) addCommunityXp(address, xp);
  };

  if (taskId === "check_in") {
    if (!before.check_in) {
      getDb()
        .prepare("UPDATE daily_task_days SET check_in = 1 WHERE address = ? AND date = ?")
        .run(k, date);
      awardIfFirst(false, XP_CHECK_IN);
      const streakRow = getDb()
        .prepare("SELECT streak, last_check_in_date FROM daily_streaks WHERE address = ?")
        .get(k) as { streak: number; last_check_in_date: string | null };
      const last = streakRow.last_check_in_date;
      const y = utcYesterday();
      const nextStreak = last === y ? (streakRow.streak || 0) + 1 : 1;
      getDb()
        .prepare("UPDATE daily_streaks SET streak = ?, last_check_in_date = ? WHERE address = ?")
        .run(nextStreak, date, k);
    }
  } else if (taskId === "share_x") {
    if (!before.share_x) {
      getDb()
        .prepare("UPDATE daily_task_days SET share_x = 1 WHERE address = ? AND date = ?")
        .run(k, date);
      const xp = isXApiConfigured() ? XP_SHARE_VERIFIED : XP_SHARE_TRUST;
      awardIfFirst(false, xp);
    }
  } else if (taskId === "community_pulse") {
    if (!before.community_pulse) {
      getDb()
        .prepare("UPDATE daily_task_days SET community_pulse = 1 WHERE address = ? AND date = ?")
        .run(k, date);
      awardIfFirst(false, XP_COMMUNITY_PULSE);
    }
  }

  return getDailySnapshot(address);
}

export function markCommunityPulseForAddress(address: `0x${string}`) {
  const k = norm(address);
  const date = utcToday();
  ensureStreakRow(address);
  const before = ensureDayRow(address, date);
  if (!before.community_pulse) {
    getDb()
      .prepare("UPDATE daily_task_days SET community_pulse = 1 WHERE address = ? AND date = ?")
      .run(k, date);
    addCommunityXp(address, XP_COMMUNITY_PULSE);
  }
}
