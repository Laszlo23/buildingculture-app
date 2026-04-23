import { Pipe } from "@baseai/core";
import communityBuilderPipeFactory from "../../baseai/pipes/community-builder.ts";
import { isAiConfigured } from "../lib/aiEnv.js";

function truncate(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

/**
 * Runs the Community Builder BaseAI pipe on a single user-facing prompt (Member Chat transcript, Telegram DM, etc.).
 */
export async function runCommunityBuilderPipeUserContent(
  userContent: string,
  opts?: { maxOutputChars?: number },
): Promise<string | null> {
  if (!isAiConfigured()) return null;
  const u = userContent.trim();
  if (!u) return null;
  const maxOut = opts?.maxOutputChars ?? 500;

  const config = communityBuilderPipeFactory();
  const baseMessages = config.messages.map(m => ({
    role: m.role,
    content: m.content ?? "",
  }));
  const runMessages = [...baseMessages, { role: "user" as const, content: u }];

  const pipe = new Pipe(config);
  const result = await pipe.run({ messages: runMessages, stream: false });
  if ("stream" in result) return null;

  const text = truncate(result.completion ?? "", maxOut);
  return text || null;
}
