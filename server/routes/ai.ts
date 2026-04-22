import { Pipe } from "@baseai/core";
import type { Hono } from "hono";
import { ZodError } from "zod";
import pipeFactory from "../../baseai/pipes/building-culture-club.ts";
import { isBuildingCultureAiConfigured } from "../lib/aiEnv.js";
import { serializeError } from "../services/tx.ts";
import { buildingCulturePipeBody } from "../validation.ts";

function zodMessage(e: ZodError) {
  return e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
}

export function registerAiRoutes(app: Hono) {
  app.post("/api/ai/pipe/building-culture-club", async (c) => {
    if (!isBuildingCultureAiConfigured()) {
      return c.json(
        {
          error: {
            message:
              "AI is not configured. Add LANGBASE_API_KEY to your server .env (merge from .env.baseai.example; see deploy/DEPLOY.md).",
          },
        },
        503,
      );
    }

    let raw: unknown;
    try {
      raw = await c.req.json();
    } catch {
      return c.json({ error: { message: "Invalid JSON body" } }, 400);
    }

    const parsed = buildingCulturePipeBody.safeParse(raw);
    if (!parsed.success) {
      return c.json({ error: { message: zodMessage(parsed.error) } }, 400);
    }

    const body = parsed.data;
    const config = pipeFactory();
    const baseMessages = config.messages.map((m) => ({
      role: m.role,
      content: m.content ?? "",
    }));
    const runMessages =
      body.messages && body.messages.length > 0
        ? [
            ...baseMessages,
            ...body.messages.map((m) => ({
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
            })),
          ]
        : [...baseMessages, { role: "user" as const, content: body.userMessage! }];

    const pipe = new Pipe(config);
    try {
      const result = await pipe.run({ messages: runMessages, stream: false });
      if ("stream" in result) {
        return c.json({ error: { message: "Unexpected streaming response" } }, 500);
      }
      return c.json({
        id: result.id,
        model: result.model,
        completion: result.completion,
        usage: result.usage,
        threadId: result.threadId,
      });
    } catch (e) {
      return c.json({ error: { message: serializeError(e) } }, 500);
    }
  });
}
