/** X (Twitter) API v2 — server only. Credentials from https://developer.x.com / dev.x.com */

export function xApiBearerToken(): string | null {
  const t = process.env.X_API_BEARER_TOKEN?.trim();
  return t || null;
}

/** Consumer “API Key” + “API Key Secret” (Keys and tokens tab) for application-only Bearer exchange. */
export function xApiKeyAndSecret(): { key: string; secret: string } | null {
  const key =
    process.env.X_API_KEY?.trim() ||
    process.env.X_CONSUMER_KEY?.trim() ||
    process.env.TWITTER_API_KEY?.trim() ||
    "";
  const secret =
    process.env.X_API_SECRET?.trim() ||
    process.env.X_API_KEY_SECRET?.trim() ||
    process.env.X_CONSUMER_SECRET?.trim() ||
    process.env.TWITTER_API_SECRET?.trim() ||
    "";
  if (!key || !secret) return null;
  return { key, secret };
}

export function isXApiConfigured(): boolean {
  return Boolean(xApiBearerToken() || xApiKeyAndSecret());
}

/** Base URL without trailing slash (v2 REST). */
export function xApiBase(): string {
  const b = process.env.X_API_BASE?.trim().replace(/\/$/, "");
  return b || "https://api.twitter.com/2";
}
