/** Normalize a 40-hex EVM address for public API responses; `null` when unset or zero. */
export function publishableEthAddress(addr: string | null | undefined): string | null {
  if (addr == null || typeof addr !== "string") return null;
  const s = addr.trim();
  if (!/^0x[a-fA-F0-9]{40}$/i.test(s)) return null;
  const lower = s.toLowerCase();
  if (lower === "0x0000000000000000000000000000000000000000") return null;
  return lower;
}

/** First non-null publishable address among candidates (e.g. server env then `VITE_*` mirror). */
export function firstPublishableEthAddress(...candidates: (string | null | undefined)[]): string | null {
  for (const c of candidates) {
    const p = publishableEthAddress(c);
    if (p) return p;
  }
  return null;
}
