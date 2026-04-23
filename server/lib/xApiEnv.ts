/** X (Twitter) API v2 — server only. Credentials from https://developer.x.com / dev.x.com */

export function xApiBearerToken(): string | null {
  const t = process.env.X_API_BEARER_TOKEN?.trim();
  return t || null;
}

export function isXApiConfigured(): boolean {
  return Boolean(xApiBearerToken());
}

/** Base URL without trailing slash (v2 REST). */
export function xApiBase(): string {
  const b = process.env.X_API_BASE?.trim().replace(/\/$/, "");
  return b || "https://api.twitter.com/2";
}
