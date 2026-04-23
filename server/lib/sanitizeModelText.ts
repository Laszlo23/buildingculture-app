/**
 * Post-process LLM completions for member-facing channels (Telegram, chat).
 * Catches degenerate repetition (e.g. "Under!!!!!!!!!!!!!!!!...") from model glitches or bad sampling.
 */
export function sanitizeModelReply(text: string): string {
  let t = text.trim();
  if (!t) return t;

  // Collapse excessive sentence punctuation (common failure mode)
  t = t.replace(/!{2,}/g, "!");
  t = t.replace(/\?{2,}/g, "?");
  t = t.replace(/\.{5,}/g, "...");
  // Long runs of the same non-space symbol (e.g. "aaaaaa" mid-glitch)
  t = t.replace(/(\S)\1{7,}/g, "$1$1$1");

  const letterish = (t.match(/[\p{L}\p{N}]/gu) ?? []).length;
  if (t.length > 40 && letterish < Math.min(10, t.length * 0.06)) {
    return "I’m having trouble replying clearly. Could you ask again in one short sentence?";
  }

  return t;
}
