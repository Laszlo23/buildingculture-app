import { timingSafeEqual } from "crypto";
import type { Context, Hono } from "hono";
import { z } from "zod";
import { getEnv } from "../lib/env.js";
import { paperclipApiUrlHint, paperclipHttpAdapterSecret } from "../lib/paperclipHttpAdapterEnv.js";

const contextSchema = z
  .object({
    taskId: z.string().optional(),
    wakeReason: z.string().optional(),
    commentId: z.string().optional(),
  })
  .passthrough();

const bodySchema = z
  .object({
    runId: z.string().optional(),
    agentId: z.string().optional(),
    companyId: z.string().optional(),
    context: contextSchema.optional(),
  })
  .passthrough();

function apiPublicOrigin(): string {
  try {
    return new URL(getEnv().API_PUBLIC_ORIGIN.trim()).origin;
  } catch {
    return "https://api.buildingculture.capital";
  }
}

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

function verifyPaperclipAdapter(c: Context): boolean {
  const secret = paperclipHttpAdapterSecret();
  if (!secret) return true;
  const header = c.req.header("x-paperclip-adapter-secret")?.trim();
  if (header && timingSafeStringEqual(secret, header)) return true;
  const bearer = extractBearer(c.req.header("authorization"));
  if (bearer && timingSafeStringEqual(secret, bearer)) return true;
  return false;
}

/**
 * Paperclip HTTP adapter target: Paperclip POSTs execution context here; response is stored as the run result.
 * @see https://docs (Paperclip) — configure URL e.g. https://api.buildingculture.capital/api/paperclip/http-agent
 */
export function registerPaperclipHttpAdapterRoutes(app: Hono) {
  app.get("/api/paperclip/http-agent", (c) => {
    const secretOn = Boolean(paperclipHttpAdapterSecret());
    const pcUrl = paperclipApiUrlHint();
    return c.json({
      ok: true,
      adapter: "paperclip_http",
      description:
        "POST JSON { runId, agentId, companyId, context?: { taskId, wakeReason, commentId } }. Optional auth: X-Paperclip-Adapter-Secret or Authorization: Bearer (PAPERCLIP_HTTP_ADAPTER_SECRET).",
      adapterSecretConfigured: secretOn,
      paperclipApiUrlEnvSet: Boolean(pcUrl),
      /** Where this Building Culture API is reachable (for callback docs); not the same as Paperclip control plane. */
      thisApiOrigin: apiPublicOrigin(),
    });
  });

  app.post("/api/paperclip/http-agent", async (c) => {
    if (!verifyPaperclipAdapter(c)) {
      return c.json({ error: { message: "Unauthorized" } }, 401);
    }

    let raw: unknown;
    try {
      raw = await c.req.json();
    } catch {
      return c.json({ error: { message: "Expected JSON body" } }, 400);
    }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      const msg = parsed.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
      return c.json({ error: { message: msg } }, 400);
    }

    const b = parsed.data;
    const ctx = b.context ?? {};

    const runHeader = c.req.header("x-paperclip-run-id")?.trim() ?? null;

    console.log(
      "[paperclip:http-agent]",
      JSON.stringify({
        receivedAt: new Date().toISOString(),
        paperclipRunIdHeader: runHeader,
        runId: b.runId ?? null,
        agentId: b.agentId ?? null,
        companyId: b.companyId ?? null,
        taskId: ctx.taskId ?? null,
        wakeReason: ctx.wakeReason ?? null,
        commentId: ctx.commentId ?? null,
      }),
    );

    /** Paperclip stores this JSON as the webhook run result */
    return c.json({
      ok: true,
      message: "Accepted — external agent should call Paperclip API with PAPERCLIP_API_URL and run JWT / API key.",
      receivedAt: new Date().toISOString(),
      paperclipRunIdHeader: runHeader,
      runId: b.runId ?? null,
      agentId: b.agentId ?? null,
      companyId: b.companyId ?? null,
      context: {
        taskId: ctx.taskId ?? null,
        wakeReason: ctx.wakeReason ?? null,
        commentId: ctx.commentId ?? null,
      },
    });
  });
}
