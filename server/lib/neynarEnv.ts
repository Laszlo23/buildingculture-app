/** Farcaster via Neynar — server-only. Set NEYNAR_API_KEY in .env (never VITE_*). */
export function isNeynarConfigured(): boolean {
  return Boolean(process.env.NEYNAR_API_KEY?.trim());
}

export function neynarApiKey(): string | null {
  const k = process.env.NEYNAR_API_KEY?.trim();
  return k || null;
}
