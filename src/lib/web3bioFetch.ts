/**
 * Web3.bio Profile API — https://api.web3.bio/
 * Auth: `X-API-KEY: Bearer {API_KEY}` (see official docs). Optional second auth via Authorization remains supported.
 */

const PROFILE_BASE = "https://api.web3.bio/profile";
const NS_BASE = "https://api.web3.bio/ns";

/** Docs use lowercase checksummed EVM addresses in paths. */
export function normalizeWeb3BioIdentity(identity: string): string {
  const t = identity.trim();
  if (/^0x[a-fA-F0-9]{40}$/.test(t)) return t.toLowerCase();
  return t;
}

function web3BioHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const apiKey = import.meta.env.VITE_WEB3BIO_API_KEY?.trim();
  const bearer = import.meta.env.VITE_WEB3BIO_BEARER_TOKEN?.trim();
  // Official format: X-API-KEY: Bearer YOUR_API_KEY
  if (apiKey) {
    const v = /^Bearer\s/i.test(apiKey) ? apiKey : `Bearer ${apiKey}`;
    headers["X-API-KEY"] = v;
  }
  if (bearer) {
    headers.Authorization = /^Bearer\s/i.test(bearer) ? bearer : `Bearer ${bearer}`;
  }
  return headers;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const e = (data as { error?: unknown }).error;
    if (typeof e === "string") return e;
  }
  return fallback;
}

async function parseJsonSafe(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Universal profile + fallback to `/ns/{identity}` when `/profile/{identity}` returns an empty array.
 * @see https://api.web3.bio/
 */
export async function fetchWeb3BioUniversalProfile(address: string): Promise<unknown> {
  const identity = normalizeWeb3BioIdentity(address);
  const headers = web3BioHeaders();

  async function get(pathPrefix: string): Promise<{ res: Response; data: unknown }> {
    const url = `${pathPrefix}/${encodeURIComponent(identity)}`;
    const res = await fetch(url, { headers });
    const data = await parseJsonSafe(res);
    return { res, data };
  }

  let { res, data } = await get(PROFILE_BASE);

  if (res.ok && Array.isArray(data) && data.length === 0) {
    const second = await get(NS_BASE);
    res = second.res;
    data = second.data;
  }

  if (!res.ok) {
    const msg = extractErrorMessage(data, res.statusText);
    throw new Error(msg || `Web3.bio HTTP ${res.status}`);
  }

  if (data !== null && typeof data === "object" && !Array.isArray(data) && "error" in data) {
    const err = (data as { error?: unknown }).error;
    if (typeof err === "string" && err.length > 0) {
      throw new Error(err);
    }
  }

  return data;
}

/** Resolve avatar for <img src> — supports https, ipfs://, and euc.li-style hosts. */
export function web3BioAvatarSrc(avatar: string | null | undefined): string | undefined {
  if (!avatar || typeof avatar !== "string") return undefined;
  const a = avatar.trim();
  if (a.startsWith("http://") || a.startsWith("https://")) return a;
  if (a.startsWith("ipfs://")) {
    const path = a.replace(/^ipfs:\/\//i, "").replace(/^ipfs\//i, "");
    return `https://ipfs.io/ipfs/${path}`;
  }
  return undefined;
}
