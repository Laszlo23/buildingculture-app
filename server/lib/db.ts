import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "../.data");
const dbPath = join(dataDir, "app.db");
const legacyChat = join(dataDir, "community-chat.json");
const legacyLearning = join(dataDir, "learning-completions.json");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) throw new Error("Database not initialized; call initAppDatabase() at server startup.");
  return db;
}

/**
 * Single-file SQLite (WAL) for community chat + learning completions.
 * Migrates legacy `community-chat.json` and `learning-completions.json` once if tables are empty.
 */
export function initAppDatabase() {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      address TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_chat_created ON chat_messages(created_at);

    CREATE TABLE IF NOT EXISTS learning_completions (
      address TEXT NOT NULL,
      route_id TEXT NOT NULL,
      completed_at TEXT NOT NULL,
      PRIMARY KEY (address, route_id)
    );

    CREATE TABLE IF NOT EXISTS dao_voting_rewards (
      address TEXT NOT NULL,
      reward_key TEXT NOT NULL,
      tx_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (address, reward_key)
    );
    CREATE INDEX IF NOT EXISTS idx_dao_voting_rewards_address ON dao_voting_rewards(address);

    CREATE TABLE IF NOT EXISTS stacks_keeper_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL,
      action TEXT NOT NULL,
      status TEXT NOT NULL,
      dry_run INTEGER NOT NULL DEFAULT 0,
      tx_id TEXT,
      error TEXT,
      details_json TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_stacks_keeper_created ON stacks_keeper_runs(created_at);

    CREATE TABLE IF NOT EXISTS daily_streaks (
      address TEXT PRIMARY KEY,
      streak INTEGER NOT NULL DEFAULT 0,
      last_check_in_date TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_task_days (
      address TEXT NOT NULL,
      date TEXT NOT NULL,
      check_in INTEGER NOT NULL DEFAULT 0,
      share_x INTEGER NOT NULL DEFAULT 0,
      community_pulse INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (address, date)
    );
    CREATE INDEX IF NOT EXISTS idx_daily_task_days_date ON daily_task_days(date);

    CREATE TABLE IF NOT EXISTS member_community_xp (
      address TEXT PRIMARY KEY,
      community_xp INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT ''
    );
  `);
  migrateChatMessageColumnsIfNeeded();
  migrateFromJsonIfNeeded();
  migrateDailyTasksFromLegacyJsonIfNeeded();
}

/** Add agent role columns for Community Builder in-thread messages (idempotent). */
function migrateChatMessageColumnsIfNeeded() {
  const d = getDb();
  const cols = d.prepare("PRAGMA table_info(chat_messages)").all() as { name: string }[];
  const names = new Set(cols.map(c => c.name));
  if (!names.has("role")) {
    d.exec("ALTER TABLE chat_messages ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
  }
  if (!names.has("agent_key")) {
    d.exec("ALTER TABLE chat_messages ADD COLUMN agent_key TEXT");
  }
}

function migrateFromJsonIfNeeded() {
  const d = getDb();
  const chatCount = (d.prepare("SELECT COUNT(*) AS c FROM chat_messages").get() as { c: number }).c;
  if (chatCount === 0 && existsSync(legacyChat)) {
    try {
      const raw = JSON.parse(readFileSync(legacyChat, "utf8")) as {
        messages?: { id: string; address: string; text: string; createdAt: string }[];
      };
      const ins = d.prepare(
        "INSERT OR IGNORE INTO chat_messages (id, address, text, created_at) VALUES (?, ?, ?, ?)",
      );
      const messages = raw.messages ?? [];
      const run = d.transaction((rows: typeof messages) => {
        for (const m of rows) {
          ins.run(m.id, m.address.toLowerCase(), m.text, m.createdAt);
        }
      });
      run(messages);
    } catch {
      // keep empty table on corrupt legacy file
    }
  }

  const learnCount = (d.prepare("SELECT COUNT(*) AS c FROM learning_completions").get() as { c: number }).c;
  if (learnCount === 0 && existsSync(legacyLearning)) {
    try {
      const book = JSON.parse(readFileSync(legacyLearning, "utf8")) as Record<
        string,
        { completions?: Record<string, { completedAt: string }> }
      >;
      const ins = d.prepare(
        "INSERT OR REPLACE INTO learning_completions (address, route_id, completed_at) VALUES (?, ?, ?)",
      );
      const run = d.transaction(() => {
        for (const [addr, data] of Object.entries(book)) {
          for (const [routeId, rec] of Object.entries(data.completions ?? {})) {
            if (rec?.completedAt) {
              ins.run(addr.toLowerCase(), routeId, rec.completedAt);
            }
          }
        }
      });
      run();
    } catch {
      // ignore
    }
  }
}

type LegacyDailyBook = Record<
  string,
  {
    streak?: number;
    lastCheckInDate?: string | null;
    days?: Record<string, { check_in?: boolean; share_x?: boolean; community_pulse?: boolean }>;
  }
>;

/** One-time import from `daily-tasks.json` when SQLite tables are still empty. */
function migrateDailyTasksFromLegacyJsonIfNeeded() {
  const d = getDb();
  const rowCount = (d.prepare("SELECT COUNT(*) AS c FROM daily_task_days").get() as { c: number }).c;
  if (rowCount > 0) return;
  const legacyPath = join(dataDir, "daily-tasks.json");
  if (!existsSync(legacyPath)) return;
  let book: LegacyDailyBook;
  try {
    book = JSON.parse(readFileSync(legacyPath, "utf8")) as LegacyDailyBook;
  } catch {
    return;
  }
  if (!book || typeof book !== "object") return;

  const insStreak = d.prepare(
    "INSERT OR REPLACE INTO daily_streaks (address, streak, last_check_in_date) VALUES (?, ?, ?)",
  );
  const insDay = d.prepare(
    "INSERT OR REPLACE INTO daily_task_days (address, date, check_in, share_x, community_pulse) VALUES (?, ?, ?, ?, ?)",
  );
  const run = d.transaction(() => {
    for (const [addr, rec] of Object.entries(book)) {
      if (!/^0x[a-fA-F0-9]{40}$/i.test(addr)) continue;
      const k = addr.toLowerCase();
      insStreak.run(k, rec.streak ?? 0, rec.lastCheckInDate ?? null);
      for (const [date, day] of Object.entries(rec.days ?? {})) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
        insDay.run(
          k,
          date,
          day.check_in ? 1 : 0,
          day.share_x ? 1 : 0,
          day.community_pulse ? 1 : 0,
        );
      }
    }
  });
  run();
}
