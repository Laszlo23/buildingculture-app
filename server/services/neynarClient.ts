import { neynarApiKey } from "../lib/neynarEnv.js";

const BULK = "https://api.neynar.com/v2/farcaster/user/bulk-by-address/";

export type FarcasterUserDto = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string | null;
  bio: string | null;
  url: string;
};

function pickBest(
  users: {
    username?: string;
    fid?: number;
    display_name?: string;
    pfp_url?: string;
    profile?: { bio?: { text?: string } };
    follower_count?: number;
  }[],
): (typeof users)[0] | null {
  if (!users.length) return null;
  return [...users].sort((a, b) => (b.follower_count ?? 0) - (a.follower_count ?? 0))[0]!;
}

function toDto(u: NonNullable<ReturnType<typeof pickBest>>): FarcasterUserDto {
  const username = String(u.username ?? "");
  return {
    fid: Number(u.fid ?? 0),
    username,
    displayName: String(u.display_name ?? username),
    pfpUrl: u.pfp_url && typeof u.pfp_url === "string" ? u.pfp_url : null,
    bio: u.profile?.bio?.text && typeof u.profile.bio.text === "string" ? u.profile.bio.text : null,
    url: `https://warpcast.com/${username}`,
  };
}

/**
 * Fetches Farcaster profiles for EVM addresses (custody or verified on Farcaster).
 * @returns Map of lowercase 0x address → DTO, or null when address has no Farcaster user in response.
 */
export async function fetchFarcasterByAddresses(
  rawAddresses: string[],
): Promise<Record<string, FarcasterUserDto | null> | null> {
  const key = neynarApiKey();
  if (!key || rawAddresses.length === 0) {
    return {};
  }
  const uniq = [...new Set(rawAddresses.map((a) => a.toLowerCase()))].filter(
    (a) => /^0x[a-f0-9]{40}$/.test(a),
  );
  if (uniq.length === 0) return {};

  const param = uniq.slice(0, 350).join(",");
  const res = await fetch(`${BULK}?${new URLSearchParams({ addresses: param })}`, {
    headers: { "x-api-key": key, Accept: "application/json" },
  });
  if (res.status === 401 || res.status === 403) {
    console.error("[neynar] API key rejected");
    return null;
  }
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    console.error("[neynar] HTTP", res.status, t.slice(0, 200));
    return null;
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return null;
  }
  if (data == null || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const out: Record<string, FarcasterUserDto | null> = Object.fromEntries(uniq.map((a) => [a, null as FarcasterUserDto | null]));

  const top = data as Record<string, unknown>;
  const payload: Record<string, unknown> =
    "users" in top && top.users && typeof top.users === "object" && !Array.isArray(top.users)
      ? (top.users as Record<string, unknown>)
      : top;

  for (const [k, v] of Object.entries(payload)) {
    if (k === "code" || k === "message" || k === "error") continue;
    if (!/^0x[a-fA-F0-9]{40}$/i.test(k)) continue;
    if (!Array.isArray(v) || v.length === 0) {
      out[k.toLowerCase()] = null;
      continue;
    }
    const a = k.toLowerCase();
    const best = pickBest(v as Parameters<typeof pickBest>[0]);
    if (best) out[a] = toDto(best);
  }

  return out;
}
