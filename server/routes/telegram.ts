import type { Hono } from "hono";
import { handleTelegramWebhook } from "../services/telegramWebhook.js";

/** Telegram Bot API updates — set webhook to POST /api/telegram/webhook (see deploy/DEPLOY.md). */
export function registerTelegramRoutes(app: Hono) {
  app.post("/api/telegram/webhook", async (c) => handleTelegramWebhook(c));
}
