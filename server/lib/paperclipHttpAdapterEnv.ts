/**
 * Paperclip HTTP adapter — inbound webhook verification (server-only).
 * Configure the same value in Paperclip agent HTTP adapter → headers, e.g.
 * `X-Paperclip-Adapter-Secret` or `Authorization: Bearer …`.
 */
export function paperclipHttpAdapterSecret(): string | null {
  const s = process.env.PAPERCLIP_HTTP_ADAPTER_SECRET?.trim();
  return s || null;
}

export function paperclipApiUrlHint(): string | null {
  const u = process.env.PAPERCLIP_API_URL?.trim();
  return u || null;
}
