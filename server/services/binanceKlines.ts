import { getEnv } from "../lib/env.js";

export type BinanceCandle = {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
};

/** Binance kline row: [openTime, open, high, low, close, volume, closeTime, ...] */
function parseKlineRow(row: unknown): BinanceCandle | null {
  if (!Array.isArray(row) || row.length < 7) return null;
  const openTime = Number(row[0]);
  const closeTime = Number(row[6]);
  if (!Number.isFinite(openTime) || !Number.isFinite(closeTime)) return null;
  return {
    openTime,
    open: String(row[1]),
    high: String(row[2]),
    low: String(row[3]),
    close: String(row[4]),
    volume: String(row[5]),
    closeTime,
  };
}

export async function fetchBinanceKlines(params: {
  symbol: string;
  interval: string;
  limit: number;
}): Promise<{ baseUrl: string; symbol: string; interval: string; limit: number; candles: BinanceCandle[] }> {
  const env = getEnv();
  const base = env.BINANCE_API_BASE.replace(/\/$/, "");
  const url = new URL(`${base}/api/v3/klines`);
  url.searchParams.set("symbol", params.symbol);
  url.searchParams.set("interval", params.interval);
  url.searchParams.set("limit", String(params.limit));

  const headers: Record<string, string> = { Accept: "application/json" };
  if (env.BINANCE_API_KEY) {
    headers["X-MBX-APIKEY"] = env.BINANCE_API_KEY;
  }

  const res = await fetch(url.toString(), { headers, method: "GET" });
  const text = await res.text();
  if (!res.ok) {
    let msg = text.slice(0, 400);
    try {
      const j = JSON.parse(text) as { msg?: string; code?: number };
      if (j.msg) msg = j.msg;
    } catch {
      /* raw body */
    }
    throw new Error(`Binance HTTP ${res.status}: ${msg}`);
  }

  let raw: unknown;
  try {
    raw = JSON.parse(text) as unknown;
  } catch {
    throw new Error("Binance returned non-JSON");
  }
  if (!Array.isArray(raw)) {
    throw new Error("Binance klines: expected array");
  }

  const candles = raw.map(parseKlineRow).filter((c): c is BinanceCandle => c != null);

  return {
    baseUrl: base,
    symbol: params.symbol,
    interval: params.interval,
    limit: params.limit,
    candles,
  };
}
