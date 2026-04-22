import { randomUUID } from "crypto";
import { getDb } from "../lib/db.js";
import { markCommunityPulseForAddress } from "./dailyTasksStore.ts";

const MAX_MESSAGES = 200;

export type ChatMessage = {
  id: string;
  address: string;
  text: string;
  createdAt: string;
};

function normAddr(a: string) {
  return a.toLowerCase() as `0x${string}`;
}

export function listMessages(): ChatMessage[] {
  const rows = getDb()
    .prepare(
      `SELECT id, address, text, created_at AS createdAt
       FROM chat_messages
       ORDER BY created_at ASC`,
    )
    .all() as ChatMessage[];
  return rows;
}

export function appendMessage(address: `0x${string}`, text: string): ChatMessage {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Empty message");
  if (trimmed.length > 500) throw new Error("Message too long (max 500)");

  const d = getDb();
  const msg: ChatMessage = {
    id: randomUUID(),
    address: normAddr(address),
    text: trimmed,
    createdAt: new Date().toISOString(),
  };
  d.prepare(
    "INSERT INTO chat_messages (id, address, text, created_at) VALUES (?, ?, ?, ?)",
  ).run(msg.id, msg.address, msg.text, msg.createdAt);

  const count = (d.prepare("SELECT COUNT(*) AS c FROM chat_messages").get() as { c: number }).c;
  if (count > MAX_MESSAGES) {
    const toDrop = count - MAX_MESSAGES;
    d.prepare(
      `DELETE FROM chat_messages WHERE rowid IN (
        SELECT rowid FROM chat_messages ORDER BY created_at ASC LIMIT ?
      )`,
    ).run(toDrop);
  }

  try {
    markCommunityPulseForAddress(normAddr(address));
  } catch {
    // non-fatal
  }

  return msg;
}
