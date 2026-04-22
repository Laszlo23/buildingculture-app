import { Pipe } from "@baseai/core";
import type { PipeI } from "@baseai/core";
import type { Context, Hono } from "hono";
import { ZodError } from "zod";
import buildingCulturePipeFactory from "../../baseai/pipes/building-culture-club.ts";
import communityBuilderPipeFactory from "../../baseai/pipes/community-builder.ts";
import { isAiConfigured } from "../lib/aiEnv.js";
import { allowAiPipeRequest, clientKeyFromRequest } from "../services/aiPipeRateLimit.js";
import { serializeError } from "../services/tx.ts";
import { buildingCulturePipeBody } from "../validation.ts";

function zodMessage(e: ZodError) {
  return e.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ");
}

const AI_PIPE_MAX_PER_MINUTE = 20;
const AI_PIPE_WINDOW_MS = 60_000;

function notConfiguredResponse() {
  return {
    error: {
      message:
        "AI is not configured. Add LANGBASE_API_KEY to your server .env (merge from .env.baseai.example; see deploy/DEPLOY.md).",
    },
  } as const;
}

async function runLangbasePipeCompletion(
  body: NonNullable<ReturnType<typeof buildingCulturePipeBody.safeParse>["data"]>,
  factory: () => PipeI,
) {
  const config = factory();
  const baseMessages = config.messages.map(m => ({
    role: m.role,
    content: m.content ?? "",
  }));
  const runMessages =
    body.messages && body.messages.length > 0
      ? [
          ...baseMessages,
          ...body.messages.map(m => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          })),
        ]
      : [...baseMessages, { role: "user" as const, content: body.userMessage! }];

  const pipe = new Pipe(config);
  const result = await pipe.run({ messages: runMessages, stream: false });
  if ("stream" in result) {
    throw new Error("Unexpected streaming response");
  }
  return {
    id: result.id,
    model: result.model,
    completion: result.completion,
    usage: result.usage,
    threadId: result.threadId,
  };
}

export function registerAiRoutes(app: Hono) {
  const handlePipe =
    (factory: () => PipeI) =>
    async (c: Context) => {
      if (!isAiConfigured()) {
        return c.json(notConfiguredResponse(), 503);
      }

      const rateKey = clientKeyFromRequest(n => c.req.header(n));
      if (!allowAiPipeRequest(rateKey, AI_PIPE_MAX_PER_MINUTE, AI_PIPE_WINDOW_MS)) {
        return c.json({ error: { message: "Too many AI requests. Try again in a minute." } }, 429);
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

      try {
        const payload = await runLangbasePipeCompletion(parsed.data, factory);
        return c.json(payload);
      } catch (e) {
        return c.json({ error: { message: serializeError(e) } }, 500);
      }
    };

  app.post("/api/ai/pipe/building-culture-club", handlePipe(buildingCulturePipeFactory));
  app.post("/api/ai/pipe/community-builder", handlePipe(communityBuilderPipeFactory));
}
