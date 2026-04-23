import type { Context } from "hono";
import {
  isTelegramBotConfigured,
  telegramBotUsername,
  telegramGroupInviteUrl,
  telegramSitePublicUrl,
  telegramWebhookSecret,
} from "../lib/telegramEnv.js";
import { runCommunityBuilderPipeUserContent } from "./communityBuilderAi.js";
import { escapeTelegramHtml, telegramSendMessage } from "./telegramApi.js";

type TgChat = { id: number; type: "private" | "group" | "supergroup" | "channel" | string };
type TgUser = { id: number; is_bot?: boolean };
type TgMessage = {
  message_id: number;
  chat: TgChat;
  from?: TgUser;
  text?: string;
};

type TgUpdate = {
  update_id: number;
  message?: TgMessage;
};

const lastAiReplyAt = new Map<number, number>();
const RATE_MS = 2500;

function htmlAttrHref(url: string): string {
  return url.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

async function sendWelcome(chatId: number, replyToMessageId?: number): Promise<void> {
  const site = telegramSitePublicUrl();
  const group = telegramGroupInviteUrl();
  const bot = escapeTelegramHtml(telegramBotUsername());
  const html =
    `<b>BuildingCulture — Community Builder</b>\n\n` +
    `<a href="${htmlAttrHref(group)}">Join our Telegram group</a>\n` +
    `<a href="${htmlAttrHref(site)}">Open the web app</a>\n\n` +
    `Message me here anytime to talk culture and onboarding.\n` +
    `In the group, mention <code>@${bot}</code> or use <code>/ask your question</code>.\n\n` +
    `<i>Educational only — not financial advice.</i>`;
  await telegramSendMessage(chatId, html, {
    replyToMessageId: replyToMessageId,
    parseMode: "HTML",
    disablePreview: true,
  });
}

function extractUserPrompt(chatType: string, textRaw: string): string | null {
  const trimmed = textRaw.trim();
  const ask = /^\/ask(?:@\S+)?\s+(.*)$/s.exec(trimmed);
  if (ask) {
    const rest = ask[1]?.trim() ?? "";
    return rest.length > 0 ? rest : null;
  }
  if (chatType === "private") {
    if (trimmed.startsWith("/")) return null;
    return trimmed.length > 0 ? trimmed : null;
  }
  const handle = telegramBotUsername().toLowerCase();
  if (trimmed.toLowerCase().includes(`@${handle}`)) {
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}

export async function handleTelegramWebhook(c: Context): Promise<Response> {
  const expected = telegramWebhookSecret();
  if (expected) {
    const got = c.req.header("X-Telegram-Bot-Api-Secret-Token");
    if (got !== expected) {
      return c.text("Forbidden", 403);
    }
  }

  if (!isTelegramBotConfigured()) {
    return c.text("Telegram bot not configured", 503);
  }

  let update: TgUpdate;
  try {
    update = (await c.req.json()) as TgUpdate;
  } catch {
    return c.text("Bad Request", 400);
  }

  const msg = update.message;
  if (!msg?.chat?.id || msg.from?.is_bot) {
    return c.json({ ok: true });
  }

  const textRaw = msg.text;
  if (textRaw == null || !textRaw.trim()) {
    return c.json({ ok: true });
  }

  const trimmed = textRaw.trim();
  if (/^\/start(?:@\S+)?(?:\s|$)/i.test(trimmed)) {
    await sendWelcome(msg.chat.id, msg.message_id);
    return c.json({ ok: true });
  }
  if (/^\/help(?:@\S+)?(?:\s|$)/i.test(trimmed)) {
    await sendWelcome(msg.chat.id, msg.message_id);
    return c.json({ ok: true });
  }

  const prompt = extractUserPrompt(msg.chat.type, textRaw);
  if (prompt == null) {
    return c.json({ ok: true });
  }

  const now = Date.now();
  const last = lastAiReplyAt.get(msg.chat.id) ?? 0;
  if (now - last < RATE_MS) {
    return c.json({ ok: true });
  }
  lastAiReplyAt.set(msg.chat.id, now);

  const completion = await runCommunityBuilderPipeUserContent(
    `[Telegram ${msg.chat.type}] ${prompt}`,
    { maxOutputChars: 3500 },
  );

  if (!completion) {
    await telegramSendMessage(
      msg.chat.id,
      "The Community Builder AI is offline (configure LANGBASE_API_KEY on the API server). You can still use the web app and the group.",
      { replyToMessageId: msg.message_id, disablePreview: true },
    );
    return c.json({ ok: true });
  }

  await telegramSendMessage(msg.chat.id, completion, {
    replyToMessageId: msg.message_id,
    disablePreview: true,
  });
  return c.json({ ok: true });
}
