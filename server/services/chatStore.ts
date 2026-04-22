import { randomUUID } from "crypto";
import { getDb } from "../lib/db.js";
import { markCommunityPulseForAddress } from "./dailyTasksStore.ts";

const MAX_MESSAGES = 200;

export type ChatRole = "user" | "agent";

export type ChatMessage = {
  id: string;
  address: string;
  text: string;
  createdAt: string;
  role: ChatRole;
  agentKey: string | null;
};

function normAddr(a: string) {
  return a.toLowerCase() as `0x${string}`;
}

/** Persisted address for agent-authored rows (UI uses `role === "agent"`). */
export const COMMUNITY_BUILDER_CHAT_ADDRESS = "0x0000000000000000000000000000000000b00b";

export function listMessages(): ChatMessage[] {
  const rows = getDb()
    .prepare(
      `SELECT id, address, text, created_at AS createdAt,
              COALESCE(role, 'user') AS role,
              agent_key AS agentKey
       FROM chat_messages
       ORDER BY created_at ASC`,
    )
    .all() as ChatMessage[];
  return rows.map(r => ({
    ...r,
    role: (r.role === "agent" ? "agent" : "user") as ChatRole,
    agentKey: r.agentKey ?? null,
  }));
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
    role: "user",
    agentKey: null,
  };
  d.prepare(
    `INSERT INTO chat_messages (id, address, text, created_at, role, agent_key)
     VALUES (?, ?, ?, ?, 'user', NULL)`,
  ).run(msg.id, msg.address, msg.text, msg.createdAt);

  trimOldMessages(d);

  try {
    markCommunityPulseForAddress(normAddr(address));
  } catch {
    // non-fatal
  }

  return msg;
}

export function appendAgentMessage(text: string, agentKey: string): ChatMessage {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Empty agent message");
  if (trimmed.length > 500) throw new Error("Message too long (max 500)");

  const d = getDb();
  const addr = normAddr(COMMUNITY_BUILDER_CHAT_ADDRESS);
  const msg: ChatMessage = {
    id: randomUUID(),
    address: addr,
    text: trimmed,
    createdAt: new Date().toISOString(),
    role: "agent",
    agentKey,
  };
  d.prepare(
    `INSERT INTO chat_messages (id, address, text, created_at, role, agent_key)
     VALUES (?, ?, ?, ?, 'agent', ?)`,
  ).run(msg.id, msg.address, msg.text, msg.createdAt, agentKey);

  trimOldMessages(d);

  return msg;
}

function trimOldMessages(d: ReturnType<typeof getDb>) {
  const count = (d.prepare("SELECT COUNT(*) AS c FROM chat_messages").get() as { c: number }).c;
  if (count > MAX_MESSAGES) {
    const toDrop = count - MAX_MESSAGES;
    d.prepare(
      `DELETE FROM chat_messages WHERE rowid IN (
        SELECT rowid FROM chat_messages ORDER BY created_at ASC LIMIT ?
      )`,
    ).run(toDrop);
  }
}
