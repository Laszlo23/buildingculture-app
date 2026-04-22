import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chainApi } from "@/lib/api";
import { useChainConfig } from "@/hooks/useChainData";
import { cn } from "@/lib/utils";

const intervals = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

export function BinanceKlinesPreview({ className }: { className?: string }) {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState<(typeof intervals)[number]>("1m");
  const [limit, setLimit] = useState(24);

  const qk = useMemo(
    () => ["market", "binance", "klines", symbol.toUpperCase(), interval, limit] as const,
    [symbol, interval, limit],
  );

  const { data: cfg } = useChainConfig();

  const q = useQuery({
    queryKey: qk,
    queryFn: () =>
      chainApi.getBinanceKlines({
        symbol: symbol.replace(/\s+/g, "").toUpperCase(),
        interval,
        limit,
      }),
    enabled: symbol.trim().length >= 6,
    retry: 1,
  });

  const last = q.data?.candles?.[q.data.candles.length - 1];

  return (
    <section
      className={cn(
        "rounded-2xl border border-border/60 p-5 sm:p-6 space-y-4",
        "bg-gradient-to-br from-secondary/40 via-card/90 to-primary/[0.03]",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Live Binance candles</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
            Proxied through the Hono API — your Binance key stays in <code className="text-[10px]">.env</code> only (
            <code className="text-[10px]">BINANCE_API_KEY</code>). Public klines work without a key; a key can help
            rate limits.
          </p>
          {cfg?.binance ? (
            <p className="text-[11px] text-muted-foreground mt-2">
              REST host: <span className="font-mono text-foreground/85">{cfg.binance.restHost}</span>
              {cfg.binance.apiKeyConfigured ? (
                <span className="text-primary"> · API key loaded on server</span>
              ) : (
                <span> · No API key (anonymous weight)</span>
              )}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl gap-1.5 shrink-0"
          disabled={q.isFetching}
          onClick={() => void q.refetch()}
        >
          {q.isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-muted-foreground">Symbol</label>
          <Input
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
            className="w-36 font-mono-num uppercase text-sm"
            placeholder="BTCUSDT"
            spellCheck={false}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-muted-foreground">Interval</label>
          <select
            value={interval}
            onChange={e => setInterval(e.target.value as (typeof intervals)[number])}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm min-w-[100px]"
          >
            {intervals.map(iv => (
              <option key={iv} value={iv}>
                {iv}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase text-muted-foreground">Limit</label>
          <Input
            type="number"
            min={1}
            max={1000}
            value={limit}
            onChange={e => setLimit(Math.min(1000, Math.max(1, Number(e.target.value) || 24)))}
            className="w-24 font-mono-num text-sm"
          />
        </div>
      </div>

      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading klines…
        </div>
      ) : q.isError ? (
        <p className="text-sm text-destructive py-2">{q.error instanceof Error ? q.error.message : "Request failed"}</p>
      ) : q.data?.candles?.length ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Received <span className="font-mono-num text-foreground">{q.data.candles.length}</span> candles · last close{" "}
            <span className="font-mono-num text-primary">{last?.close}</span>
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/50">
            <table className="w-full text-xs font-mono-num">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/40 text-left text-muted-foreground">
                  <th className="p-2 font-medium">Open time</th>
                  <th className="p-2 font-medium">O</th>
                  <th className="p-2 font-medium">H</th>
                  <th className="p-2 font-medium">L</th>
                  <th className="p-2 font-medium">C</th>
                  <th className="p-2 font-medium">Vol</th>
                </tr>
              </thead>
              <tbody>
                {q.data.candles.slice(-8).map(c => (
                  <tr key={c.openTime} className="border-b border-border/30 hover:bg-secondary/20">
                    <td className="p-2 text-muted-foreground whitespace-nowrap">
                      {new Date(c.openTime).toLocaleString()}
                    </td>
                    <td className="p-2">{c.open}</td>
                    <td className="p-2 text-gold/90">{c.high}</td>
                    <td className="p-2">{c.low}</td>
                    <td className="p-2 text-primary">{c.close}</td>
                    <td className="p-2 text-muted-foreground truncate max-w-[120px]" title={c.volume}>
                      {c.volume}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No rows returned.</p>
      )}
    </section>
  );
}
