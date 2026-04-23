import { xApiBase, xApiBearerToken } from "../lib/xApiEnv.js";
import { fetchXAppOnlyBearerToken } from "./xAppOnlyBearer.js";

export type XUserPublic = {
  id: string;
  username: string;
  name: string;
  description: string | null;
  profileImageUrl: string | null;
  followersCount: number | null;
  followingCount: number | null;
  tweetCount: number | null;
  verified: boolean | null;
  url: string | null;
};

type XApiUserData = {
  id?: string;
  name?: string;
  username?: string;
  description?: string;
  profile_image_url?: string;
  url?: string;
  verified?: boolean;
  public_metrics?: {
    followers_count?: number;
    following_count?: number;
    tweet_count?: number;
  };
};

type XApiErrorBody = { errors?: { message?: string; detail?: string }[]; title?: string; detail?: string };

const USER_FIELDS =
  "description,profile_image_url,public_metrics,verified,url,name,username";

export async function fetchXUserByUsername(username: string): Promise<
  | { ok: true; user: XUserPublic }
  | { ok: false; status: number; message: string }
> {
  let token = xApiBearerToken();
  if (!token) {
    token = await fetchXAppOnlyBearerToken();
  }
  if (!token) {
    return {
      ok: false,
      status: 503,
      message:
        "X API is not configured. Set X_API_BEARER_TOKEN, or X_API_KEY + X_API_SECRET (consumer keys from developer.x.com) on the server.",
    };
  }

  const u = username.trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(u)) {
    return { ok: false, status: 400, message: "Invalid X username (1–15 letters, numbers, underscore)." };
  }

  const base = xApiBase();
  const url = `${base}/users/by/username/${encodeURIComponent(u)}?user.fields=${USER_FIELDS}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "BuildingCultureApp/1.0",
    },
    signal: AbortSignal.timeout(20_000),
  });

  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    return { ok: false, status: 502, message: "X API returned non-JSON." };
  }

  if (!res.ok) {
    const err = json as XApiErrorBody;
    const msg =
      err.errors?.map(e => e.message ?? e.detail).filter(Boolean).join("; ") ||
      err.detail ||
      err.title ||
      `X API error (${res.status})`;
    if (res.status === 429) {
      return {
        ok: false,
        status: 429,
        message: "X API rate limit or credits exhausted — wait or check usage on developer.x.com.",
      };
    }
    return { ok: false, status: res.status === 401 || res.status === 403 ? res.status : 502, message: msg };
  }

  const data = (json as { data?: XApiUserData }).data;
  if (!data?.id || !data.username) {
    return { ok: false, status: 404, message: "User not found." };
  }

  const pm = data.public_metrics;
  const user: XUserPublic = {
    id: data.id,
    username: data.username,
    name: data.name ?? data.username,
    description: data.description ?? null,
    profileImageUrl: data.profile_image_url ?? null,
    followersCount: pm?.followers_count ?? null,
    followingCount: pm?.following_count ?? null,
    tweetCount: pm?.tweet_count ?? null,
    verified: data.verified ?? null,
    url: data.url ?? null,
  };

  return { ok: true, user };
}
