import { timingSafeEqual } from "crypto";
import type { Context, Hono } from "hono";
import {
  isPipeflareOutboundConfigured,
  pipeflareApiBase,
  pipeflareConnectorBearer,
  pipeflareOutboundHeaders,
  pipeflareWebhookSecret,
} from "../lib/pipeflareEnv.js";
import { serializeError } from "../services/tx.ts";

function utf8Buf(s: string): Buffer {
  return Buffer.from(s, "utf8");
}

function timingSafeStringEqual(expected: string, received: string): boolean {
  const a = utf8Buf(expected);
  const b = utf8Buf(received);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function extractBearer(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const m = /^Bearer\s+(\S+)$/i.exec(authHeader.trim());
  return m?.[1] ?? null;
}

/** Accept webhook secret as raw header or Bearer (same secret value). */
function verifyPipeflareWebhook(c: Context): boolean {
  const secret = pipeflareWebhookSecret();
  if (!secret) return false;
  const raw = c.req.header("x-pipeflare-webhook-secret")?.trim();
  if (raw && timingSafeStringEqual(secret, raw)) return true;
  const bearer = extractBearer(c.req.header("authorization"));
  if (bearer && timingSafeStringEqual(secret, bearer)) return true;
  return false;
}

function verifyConnectorBearer(c: Context): boolean {
  const expected = pipeflareConnectorBearer();
  if (!expected) return false;
  const bearer = extractBearer(c.req.header("authorization"));
  if (!bearer) return false;
  return timingSafeStringEqual(expected, bearer);
}

export function registerPipeflareRoutes(app: Hono) {
  /** Pipeflare (or operators) can GET to verify the public URL before enabling webhooks. */
  app.get("/pipeflare/callback", (c) => {
    const configured = Boolean(pipeflareWebhookSecret());
    return c.json({
      ok: true,
      listener: "buildingculture-pipeflare",
      webhookSecretConfigured: configured,
    });
  });

  app.post("/pipeflare/callback", async (c) => {
    if (!pipeflareWebhookSecret()) {
      return c.json({ error: { message: "PIPEFLARE_WEBHOOK_SECRET is not set on this server." } }, 503);
    }
    if (!verifyPipeflareWebhook(c)) {
      return c.json({ error: { message: "Unauthorized" } }, 401);
    }

    let payload: unknown;
    try {
      payload = await c.req.json();
    } catch {
      return c.json({ error: { message: "Expected JSON body" } }, 400);
    }

    const id = typeof (payload as { runId?: unknown })?.runId === "string" ? (payload as { runId: string }).runId : null;
    console.log(
      "[pipeflare:callback]",
      JSON.stringify({
        receivedAt: new Date().toISOString(),
        runId: id,
        keys:
          payload && typeof payload === "object" && !Array.isArray(payload)
            ? Object.keys(payload as object).slice(0, 40)
            : [],
      }),
    );

    return c.json({ ok: true, receivedAt: new Date().toISOString() });
  });

  /**
   * Server-side proxy: POST JSON body through to Pipeflare `POST /v1/workflows/{workflowId}/run`.
   * Callers must send `Authorization: Bearer $PIPEFLARE_CONNECTOR_BEARER` (your chosen secret for OpenClaw / internal tools).
   */
  app.post("/api/pipeflare/workflow/:workflowId/run", async (c) => {
    if (!verifyConnectorBearer(c)) {
      return c.json({ error: { message: "Unauthorized (set PIPEFLARE_CONNECTOR_BEARER and send Authorization: Bearer …)" } }, 401);
    }
    if (!isPipeflareOutboundConfigured()) {
      return c.json({ error: { message: "PIPEFLARE_API_KEY is not set; outbound runs are disabled." } }, 503);
    }

    const workflowId = c.req.param("workflowId")?.trim();
    if (!workflowId || !/^[a-zA-Z0-9._-]{1,128}$/.test(workflowId)) {
      return c.json({ error: { message: "Invalid workflowId" } }, 400);
    }

    let body: unknown;
    try {
      const text = await c.req.text();
      body = text.length ? JSON.parse(text) : {};
    } catch {
      return c.json({ error: { message: "Invalid JSON body" } }, 400);
    }

    const base = pipeflareApiBase();
    const url = `${base}/v1/workflows/${encodeURIComponent(workflowId)}/run`;

    try {
      const upstream = await fetch(url, {
        method: "POST",
        headers: pipeflareOutboundHeaders(),
        body: JSON.stringify(body && typeof body === "object" ? body : {}),
        signal: AbortSignal.timeout(120_000),
      });
      const text = await upstream.text();
      const ct = upstream.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        try {
          return c.json(JSON.parse(text) as object, upstream.status);
        } catch {
          return c.text(text || upstream.statusText, upstream.status);
        }
      }
      return c.text(text || upstream.statusText, upstream.status);
    } catch (e) {
      return c.json({ error: { message: serializeError(e) } }, 502);
    }
  });
}
