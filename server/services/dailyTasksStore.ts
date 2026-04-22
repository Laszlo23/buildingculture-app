import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "../.data");
const file = join(dir, "daily-tasks.json");

export type DailyTaskId = "check_in" | "share_x" | "community_pulse";

type DayTasks = {
  check_in: boolean;
  share_x: boolean;
  community_pulse: boolean;
};

type UserRecord = {
  streak: number;
  lastCheckInDate: string | null;
  /** yyyy-mm-dd -> day task flags */
  days: Record<string, DayTasks>;
};

type Book = Record<string, UserRecord>;

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

function ensureUser(book: Book, address: string): UserRecord {
  const k = norm(address);
  if (!book[k]) {
    book[k] = { streak: 0, lastCheckInDate: null, days: {} };
  }
  return book[k];
}

function ensureDay(user: UserRecord, date: string): DayTasks {
  if (!user.days[date]) user.days[date] = emptyDay();
  return user.days[date];
}

export function getDailySnapshot(address: `0x${string}`) {
  const book = readAll();
  const user = ensureUser(book, address);
  const date = utcToday();
  ensureDay(user, date);
  writeAll(book);
  const day = user.days[date] ?? emptyDay();

  return {
    date,
    streak: user.streak,
    tasks: { ...day },
  };
}

export function completeTask(address: `0x${string}`, taskId: DailyTaskId): ReturnType<typeof getDailySnapshot> {
  const book = readAll();
  const user = ensureUser(book, address);
  const date = utcToday();
  const day = ensureDay(user, date);

  if (taskId === "check_in") {
    if (!day.check_in) {
      day.check_in = true;
      const last = user.lastCheckInDate;
      const y = utcYesterday();
      if (last === y) {
        user.streak = (user.streak || 0) + 1;
      } else {
        user.streak = 1;
      }
      user.lastCheckInDate = date;
    }
  } else if (taskId === "share_x") {
    day.share_x = true;
  } else if (taskId === "community_pulse") {
    day.community_pulse = true;
  }

  writeAll(book);
  return getDailySnapshot(address);
}

/** Called when user posts a chat message — completes community_pulse for today. */
export function markCommunityPulseForAddress(address: `0x${string}`) {
  const book = readAll();
  const user = ensureUser(book, address);
  const date = utcToday();
  const day = ensureDay(user, date);
  day.community_pulse = true;
  writeAll(book);
}
