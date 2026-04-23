import { telegramBotToken } from "../lib/telegramEnv.js";

export async function telegramSendMessage(
  chatId: number,
  text: string,
  opts?: { replyToMessageId?: number; disablePreview?: boolean; parseMode?: "HTML" },
): Promise<{ ok: boolean; description?: string }> {
  const token = telegramBotToken();
  if (!token) return { ok: false, description: "TELEGRAM_BOT_TOKEN unset" };

  const url = `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`;
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text: text.slice(0, 4096),
  };
  if (opts?.parseMode != null) {
    body.parse_mode = opts.parseMode;
  }
  if (opts?.replyToMessageId != null) {
    body.reply_to_message_id = opts.replyToMessageId;
  }
  if (opts?.disablePreview) {
    body.disable_web_page_preview = true;
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok?: boolean; description?: string };
  if (!data.ok) {
    console.warn("[telegram] sendMessage failed:", data.description ?? res.status);
  }
  return { ok: Boolean(data.ok), description: data.description };
}

/** Escape minimal HTML for Telegram parse_mode HTML */
export function escapeTelegramHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
