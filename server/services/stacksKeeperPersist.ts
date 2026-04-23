import { getDb } from "../lib/db.js";

export type StacksKeeperRunStatus = "ok" | "skipped" | "error";

export function insertStacksKeeperRun(row: {
  action: string;
  status: StacksKeeperRunStatus;
  dryRun: boolean;
  txId?: string | null;
  error?: string | null;
  details?: unknown;
}) {
  const d = getDb();
  const detailsJson = row.details != null ? JSON.stringify(row.details) : null;
  d.prepare(
    `INSERT INTO stacks_keeper_runs (created_at, action, status, dry_run, tx_id, error, details_json)
     VALUES (datetime('now'), ?, ?, ?, ?, ?, ?)`,
  ).run(row.action, row.status, row.dryRun ? 1 : 0, row.txId ?? null, row.error ?? null, detailsJson);
}
