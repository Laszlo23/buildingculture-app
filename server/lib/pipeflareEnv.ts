/** Pipeflare integration — server-only; never use VITE_* for these. */

export function pipeflareApiBase(): string {
  const raw = process.env.PIPEFLARE_API_BASE?.trim() || "https://api.pipeflare.io";
  return raw.replace(/\/$/, "");
}

export function pipeflareApiKey(): string | null {
  const k = process.env.PIPEFLARE_API_KEY?.trim();
  return k || null;
}

/** Pipeflare → Building Culture: validates POST /pipeflare/callback */
export function pipeflareWebhookSecret(): string | null {
  const s = process.env.PIPEFLARE_WEBHOOK_SECRET?.trim();
  return s || null;
}

/** OpenClaw / internal → Building Culture: required to call POST /api/pipeflare/workflow/:id/run */
export function pipeflareConnectorBearer(): string | null {
  const s = process.env.PIPEFLARE_CONNECTOR_BEARER?.trim();
  return s || null;
}

export function isPipeflareOutboundConfigured(): boolean {
  return Boolean(pipeflareApiKey());
}

export function isPipeflareListenerConfigured(): boolean {
  return Boolean(pipeflareWebhookSecret());
}

/** Outbound auth to Pipeflare REST (Bearer by default; set PIPEFLARE_USE_X_API_KEY=true for X-API-Key). */
export function pipeflareOutboundHeaders(): Record<string, string> {
  const key = pipeflareApiKey();
  if (!key) return {};
  const useX =
    process.env.PIPEFLARE_USE_X_API_KEY?.trim() === "1" ||
    process.env.PIPEFLARE_USE_X_API_KEY?.trim().toLowerCase() === "true";
  if (useX) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-API-Key": key,
    };
  }
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
}
