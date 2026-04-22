import { randomUUID } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { markCommunityPulseForAddress } from "./dailyTasksStore.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dir = join(__dirname, "../.data");
const file = join(dir, "community-chat.json");

const MAX_MESSAGES = 200;

export type ChatMessage = {
  id: string;
  address: string;
  text: string;
  createdAt: string;
};

type Store = {
  messages: ChatMessage[];
};

function readAll(): Store {
  if (!existsSync(file)) return { messages: [] };
  try {
    const raw = readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || !Array.isArray(parsed.messages)) return { messages: [] };
    return parsed;
  } catch {
    return { messages: [] };
  }
}

function writeAll(data: Store) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

function normAddr(a: string) {
  return a.toLowerCase() as `0x${string}`;
}

export function listMessages(): ChatMessage[] {
  const { messages } = readAll();
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export function appendMessage(address: `0x${string}`, text: string): ChatMessage {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Empty message");
  if (trimmed.length > 500) throw new Error("Message too long (max 500)");

  const data = readAll();
  const msg: ChatMessage = {
    id: randomUUID(),
    address: normAddr(address),
    text: trimmed,
    createdAt: new Date().toISOString(),
  };
  data.messages.push(msg);
  if (data.messages.length > MAX_MESSAGES) {
    data.messages = data.messages.slice(-MAX_MESSAGES);
  }
  writeAll(data);

  try {
    markCommunityPulseForAddress(normAddr(address));
  } catch {
    // non-fatal
  }

  return msg;
}
