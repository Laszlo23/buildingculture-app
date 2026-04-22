import { Pipe } from "@baseai/core";
import communityBuilderPipeFactory from "../../baseai/pipes/community-builder.ts";
import { isAiConfigured, isCommunityAgentInChatEnabled } from "../lib/aiEnv.js";
import { appendAgentMessage, listMessages } from "./chatStore.js";

let replyChain: Promise<void> = Promise.resolve();

function truncate(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

async function runOneCommunityBuilderReply(): Promise<void> {
  if (!isCommunityAgentInChatEnabled() || !isAiConfigured()) return;

  const recent = listMessages().slice(-14);
  if (recent.length === 0) return;

  const last = recent[recent.length - 1]!;
  if (last.role === "agent") return;

  const transcript = recent
    .map(m => {
      const who = m.role === "agent" ? "Community Builder" : `Member(${m.address.slice(0, 8)})`;
      return `${who}: ${m.text}`;
    })
    .join("\n");

  const userMessage =
    `Here is the recent Member Chat (oldest first). The last line is the newest member message.\n\n${transcript}\n\n` +
    `Write ONE short reply as Community Builder: welcoming, a question, or a healthy norm. ` +
    `Max 320 characters. No personalized financial or investment advice. Plain text only.`;

  const config = communityBuilderPipeFactory();
  const baseMessages = config.messages.map(m => ({
    role: m.role,
    content: m.content ?? "",
  }));
  const runMessages = [...baseMessages, { role: "user" as const, content: userMessage }];

  const pipe = new Pipe(config);
  const result = await pipe.run({ messages: runMessages, stream: false });
  if ("stream" in result) return;

  const text = truncate(result.completion ?? "", 500);
  if (!text) return;

  appendAgentMessage(text, "community_builder");
}

/**
 * After a member posts, enqueue at most one agent reply per completed prior reply (serialized).
 */
export function scheduleCommunityBuilderChatReply(): void {
  replyChain = replyChain.then(() => runOneCommunityBuilderReply()).catch(e => {
    console.warn("[community-agent]", e instanceof Error ? e.message : String(e));
  });
}
