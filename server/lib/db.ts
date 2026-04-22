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
  `);
  migrateFromJsonIfNeeded();
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
