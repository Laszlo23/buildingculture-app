/**
 * X API application-only Bearer via OAuth 2.0 client_credentials (consumer key + secret).
 * @see https://docs.x.com/fundamentals/authentication/oauth-2-0/application-only
 */
import { xApiKeyAndSecret } from "../lib/xApiEnv.js";

let cached: { token: string; expiresAtMs: number } | null = null;

/** RFC 1738-style percent-encoding for Twitter’s Basic credential string. */
function rfc1738Encode(s: string): string {
  return encodeURIComponent(s).replace(/!/g, "%21").replace(/'/g, "%27").replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
}

/**
 * Obtain a short-lived app-only Bearer using `X_API_KEY` + `X_API_SECRET`.
 * Returns null if keys missing or token exchange fails.
 */
export async function fetchXAppOnlyBearerToken(): Promise<string | null> {
  const pair = xApiKeyAndSecret();
  if (!pair) return null;

  const now = Date.now();
  if (cached && cached.expiresAtMs > now + 60_000) {
    return cached.token;
  }

  const { key, secret } = pair;
  const credentials = Buffer.from(`${rfc1738Encode(key)}:${rfc1738Encode(secret)}`, "utf8").toString("base64");

  const res = await fetch("https://api.twitter.com/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(15_000),
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("[x-api] oauth2/token failed:", res.status, text.slice(0, 280));
    return null;
  }

  let json: { access_token?: string; expires_in?: number };
  try {
    json = JSON.parse(text) as { access_token?: string; expires_in?: number };
  } catch {
    return null;
  }

  const token = json.access_token?.trim();
  if (!token) return null;

  const expiresInSec = typeof json.expires_in === "number" && json.expires_in > 0 ? json.expires_in : 7200;
  cached = { token, expiresAtMs: now + expiresInSec * 1000 };
  return token;
}

export function clearXAppOnlyBearerCache() {
  cached = null;
}
