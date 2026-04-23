import type { Hono } from "hono";
import { isNeynarConfigured } from "../lib/neynarEnv.js";
import { isXApiConfigured } from "../lib/xApiEnv.js";
import { fetchFarcasterByAddresses } from "../services/neynarClient.ts";
import { fetchXUserByUsername } from "../services/xApiClient.ts";

const ADDR = /^0x[a-fA-F0-9]{40}$/i;

function parseList(addresses: string | undefined, single: string | undefined): { ok: true; list: string[] } | { ok: false; error: string } {
  if (single?.trim()) {
    const a = single.trim();
    if (!ADDR.test(a)) return { ok: false, error: "Invalid address" };
    return { ok: true, list: [a] };
  }
  if (addresses?.trim()) {
    const list = addresses
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 50);
    if (list.length === 0) return { ok: false, error: "No addresses" };
    for (const a of list) {
      if (!ADDR.test(a)) return { ok: false, error: "Invalid address in list" };
    }
    return { ok: true, list };
  }
  return { ok: false, error: "Query ?address=0x… or ?addresses=0x…,0x… is required" };
}

/**
 * Farcaster handles via Neynar (NEYNAR_API_KEY). Custody or verified EVM addresses.
 * GET ?address=0x — one wallet
 * GET ?addresses=0x,0y — up to 50, for batch UIs
 */
export function registerSocialRoutes(app: Hono) {
  /**
   * X (Twitter) user by handle — app-only auth: `X_API_BEARER_TOKEN` or `X_API_KEY` + `X_API_SECRET` (OAuth client_credentials).
   * GET ?username=buildingcultu3 (no @).
   */
  app.get("/api/social/x/user", async (c) => {
    const raw = c.req.query("username")?.trim().replace(/^@/, "") ?? "";
    if (!raw) {
      return c.json({ error: { message: "Query ?username=handle is required (without @)." } }, 400);
    }
    if (!isXApiConfigured()) {
      return c.json({ configured: false, user: null as null });
    }
    const result = await fetchXUserByUsername(raw);
    if (!result.ok) {
      /** 200 so browser apiGet does not throw; callers read `error` and conserve retries on 429-style messages */
      return c.json({
        configured: true,
        user: null as null,
        error: { message: result.message, code: String(result.status) },
      });
    }
    return c.json({ configured: true, user: result.user });
  });

  app.get("/api/social/farcaster", async (c) => {
    const address = c.req.query("address");
    const addresses = c.req.query("addresses");
    const parsed = parseList(addresses, address);
    if (!parsed.ok) {
      return c.json({ error: { message: parsed.error } }, 400);
    }

    if (!isNeynarConfigured()) {
      if (parsed.list.length === 1) {
        return c.json({ configured: false, user: null as null });
      }
      const users: Record<string, null> = {};
      for (const a of parsed.list) users[a.toLowerCase()] = null;
      return c.json({ configured: false, users });
    }

    const data = await fetchFarcasterByAddresses(parsed.list);
    if (data === null) {
      return c.json(
        { error: { message: "Could not load Farcaster data from Neynar. Check NEYNAR_API_KEY and API status." } },
        502,
      );
    }

    if (parsed.list.length === 1) {
      const a = parsed.list[0]!.toLowerCase();
      return c.json({ configured: true, user: data[a] ?? null });
    }
    return c.json({ configured: true, users: data });
  });
}
