/** Telegram Bot API — server-only. Never use `VITE_*` for tokens. */

const DEFAULT_GROUP_INVITE = "https://t.me/+4zFH7-2tyW0yOTBk";
const DEFAULT_BOT_USERNAME = "culturebuildingbot";

export function telegramBotToken(): string | null {
  const t = process.env.TELEGRAM_BOT_TOKEN?.trim();
  return t || null;
}

export function isTelegramBotConfigured(): boolean {
  return Boolean(telegramBotToken());
}

/** Invite link for the BuildingCulture Telegram group (public). */
export function telegramGroupInviteUrl(): string {
  const u = process.env.TELEGRAM_GROUP_INVITE_URL?.trim();
  return u || DEFAULT_GROUP_INVITE;
}

/** Bot @handle without @; used for t.me links and optional group mention matching. */
export function telegramBotUsername(): string {
  const u = process.env.TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");
  return u || DEFAULT_BOT_USERNAME;
}

export function telegramBotDeepLink(): string {
  return `https://t.me/${telegramBotUsername()}`;
}

/**
 * Must match `secret_token` passed to Telegram `setWebhook`.
 * When set, webhook requests must include header `X-Telegram-Bot-Api-Secret-Token` with this value.
 */
export function telegramWebhookSecret(): string | null {
  const s = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  return s || null;
}

/** Public web app URL for /start replies (defaults to CORS_ORIGIN / localhost). */
export function telegramSitePublicUrl(): string {
  const o = process.env.TELEGRAM_SITE_URL?.trim() || process.env.CORS_ORIGIN?.trim();
  if (o) return o.replace(/\/$/, "");
  return "http://localhost:8080";
}
