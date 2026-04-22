import { getDb } from "../lib/db.js";

export type RouteId = "rwa" | "authenticity" | "truth";

function norm(addr: string) {
  return addr.toLowerCase();
}

export function getCompletions(address: `0x${string}`) {
  const rows = getDb()
    .prepare(
      "SELECT route_id, completed_at FROM learning_completions WHERE address = ?",
    )
    .all(norm(address)) as { route_id: string; completed_at: string }[];
  const out: Partial<Record<RouteId, { completedAt: string }>> = {};
  for (const r of rows) {
    if (r.route_id === "rwa" || r.route_id === "authenticity" || r.route_id === "truth") {
      out[r.route_id as RouteId] = { completedAt: r.completed_at };
    }
  }
  return out;
}

export function markRouteComplete(address: `0x${string}`, routeId: RouteId) {
  getDb()
    .prepare(
      "INSERT OR REPLACE INTO learning_completions (address, route_id, completed_at) VALUES (?, ?, ?)",
    )
    .run(norm(address), routeId, new Date().toISOString());
}

export function hasCompletedRoute(address: `0x${string}`, routeId: RouteId): boolean {
  const row = getDb()
    .prepare("SELECT 1 AS ok FROM learning_completions WHERE address = ? AND route_id = ?")
    .get(norm(address), routeId) as { ok: number } | undefined;
  return Boolean(row);
}
