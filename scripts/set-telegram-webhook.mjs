#!/usr/bin/env node
/**
 * Register Telegram Bot webhook (setWebhook) using TELEGRAM_BOT_TOKEN from repo .env.
 * Creates TELEGRAM_WEBHOOK_SECRET if missing and appends it to .env (never print the secret).
 *
 * Optional env in .env:
 *   TELEGRAM_WEBHOOK_BASE_URL — Origin where /api/* is served (no path). Default https://app.buildingculture.capital
 *     (nginx proxies /api/ to Hono). Use https://api.example.com only if that host exists in public DNS + TLS.
 *   API_PUBLIC_ORIGIN — fallback if TELEGRAM_WEBHOOK_BASE_URL unset
 */
import crypto from "crypto";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const envPath = join(root, ".env");

function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line.trim());
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

function main() {
  if (!fs.existsSync(envPath)) {
    console.error("Missing .env at", envPath);
    process.exit(1);
  }
  let raw = fs.readFileSync(envPath, "utf8");
  const env = parseEnv(raw);
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) {
    console.error("Set TELEGRAM_BOT_TOKEN in .env first.");
    process.exit(1);
  }

  let secret = env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (!secret) {
    secret = crypto.randomBytes(32).toString("hex");
    const block = `\n# Telegram webhook verification (header X-Telegram-Bot-Api-Secret-Token)\nTELEGRAM_WEBHOOK_SECRET=${secret}\n`;
    if (!raw.endsWith("\n")) raw += "\n";
    fs.writeFileSync(envPath, raw + block, "utf8");
    console.log("Generated TELEGRAM_WEBHOOK_SECRET and appended to .env (not shown). Sync this file to your API server.");
  }

  const base = (
    env.TELEGRAM_WEBHOOK_BASE_URL ||
    env.API_PUBLIC_ORIGIN ||
    "https://app.buildingculture.capital"
  )
    .trim()
    .replace(/\/$/, "");
  const webhookUrl = `${base}/api/telegram/webhook`;

  const payload = {
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ["message"],
  };

  return fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((r) => r.json())
    .then((j) => {
      if (!j.ok) {
        console.error("Telegram setWebhook failed:", j.description || j);
        process.exit(1);
      }
      console.log("OK:", j.description || "webhook was set");
      console.log("Webhook URL:", webhookUrl);
      console.log("Restart or redeploy the API if TELEGRAM_WEBHOOK_SECRET was new so the server loads it.");
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
