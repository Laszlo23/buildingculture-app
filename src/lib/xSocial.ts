/** Extract X handle from profile URL or raw @handle (1–15 chars per X rules). */
export function xHandleFromSocialInput(raw: string | undefined): string | null {
  if (!raw?.trim()) return null;
  const s = raw.trim();
  if (/^@?[A-Za-z0-9_]{1,15}$/.test(s.replace(/^@/, "")) && !s.includes("/") && !s.includes(".")) {
    return s.replace(/^@/, "").toLowerCase();
  }
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s.replace(/^\/\//, "")}`);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host !== "x.com" && host !== "twitter.com") return null;
    const seg = u.pathname.split("/").filter(Boolean)[0];
    if (!seg || seg === "intent" || seg === "i" || seg === "search") return null;
    const h = seg.replace(/^@/, "");
    return /^[A-Za-z0-9_]{1,15}$/.test(h) ? h.toLowerCase() : null;
  } catch {
    const m = s.match(/(?:^|\/\/)(?:www\.)?(?:x\.com|twitter\.com)\/(@?[A-Za-z0-9_]{1,15})/i);
    if (!m?.[1]) return null;
    return m[1].replace(/^@/, "").toLowerCase();
  }
}
