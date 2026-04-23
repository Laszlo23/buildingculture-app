import { getEnv } from "../lib/env.js";
import { xHandleFromSocialInput } from "../lib/xSocialParse.js";
import { getProfile } from "./profileStore.js";
import { fetchRecentTweetTextsForUserId, fetchXUserByUsername } from "./xApiClient.js";

function shareTweetPhrases(): string[] {
  const extra =
    process.env.SHARE_X_PHRASE_HINTS?.split(/[,|]/).map(s => s.trim().toLowerCase()).filter(Boolean) ?? [];
  const base = ["onchain savings club", "buildingculture", "growing wealth"];
  try {
    const origin = getEnv().CORS_ORIGIN.trim();
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    base.push(host);
    base.push(origin.replace(/^https?:\/\//i, "").toLowerCase().replace(/\/$/, ""));
  } catch {
    /* ignore bad CORS_ORIGIN */
  }
  return [...new Set([...base, ...extra])];
}

export function tweetMatchesClubShare(text: string): boolean {
  const t = text.toLowerCase();
  return shareTweetPhrases().some(p => p.length >= 3 && t.includes(p));
}

export async function verifyShareXForAddress(
  address: `0x${string}`,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const profile = getProfile(address);
  const handle = xHandleFromSocialInput(profile.socials.twitter);
  if (!handle) {
    return {
      ok: false,
      message:
        "Add your X profile URL under Profile → About you, save, then verify your share again.",
    };
  }

  const userRes = await fetchXUserByUsername(handle);
  if (!userRes.ok) {
    return { ok: false, message: userRes.message };
  }

  const tweets = await fetchRecentTweetTextsForUserId(userRes.user.id, { maxResults: 20, hoursBack: 72 });
  if (!tweets.ok) {
    return { ok: false, message: tweets.message };
  }

  for (const text of tweets.texts) {
    if (tweetMatchesClubShare(text)) return { ok: true };
  }

  return {
    ok: false,
    message:
      "No qualifying post found in your recent tweets (about 3 days). Open X from the daily task, publish the suggested post (it should mention the club or site), then tap Verify again.",
  };
}
