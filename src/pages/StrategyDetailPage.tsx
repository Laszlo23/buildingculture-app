import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Bitcoin,
  Brain,
  Droplets,
  Layers,
  Palette,
  Boxes,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TransactionConfirmDialog } from "@/components/TransactionConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/RiskBadge";
import { strategies as staticStrategies } from "@/data/club";
import {
  mergeStrategiesForUi,
  useAllocateMutation,
  useConnectedPortfolio,
  useChainConfig,
} from "@/hooks/useChainData";
import { explorerAddressUrl, explorerTxUrl } from "@/lib/api";
import { buildDeployedContractStripEntries } from "@/lib/deployedContracts";
import { disclosureForRegistryIndex } from "@/data/strategyOnchain";
import { cn } from "@/lib/utils";

const iconMap = { Building2, Bitcoin, Brain, Droplets, Layers, Palette, Boxes };

const COLOR_HSL = {
  primary: "hsl(152 76% 50%)",
  gold: "hsl(42 92% 60%)",
  info: "hsl(200 90% 60%)",
  warning: "hsl(35 92% 58%)",
};

const perfMonths = ["M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12"];

export const StrategyDetailPage = () => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const [bps, setBps] = useState("2500");
  const [strategyIdField, setStrategyIdField] = useState("0");
  const [allocOpen, setAllocOpen] = useState(false);

  const { data: portfolio, isLoading } = useConnectedPortfolio();
  const { data: chainConfig } = useChainConfig();
  const allocateMut = useAllocateMutation();

  const merged = useMemo(() => mergeStrategiesForUi(portfolio, staticStrategies), [portfolio]);
  const strategy = merged.find(s => s.id === strategyId);
  const staticIdx = staticStrategies.findIndex(s => s.id === strategyId);

  useEffect(() => {
    if (staticIdx >= 0) setStrategyIdField(String(staticIdx));
  }, [staticIdx]);

  const Icon = strategy
    ? iconMap[strategy.icon as keyof typeof iconMap] ?? Building2
    : Building2;

  const perfData = useMemo(() => {
    if (!strategy) return [];
    const base = strategy.apy;
    return perfMonths.map((m, i) => ({
      m,
      perf: Math.max(0, base + Math.sin(i / 2) * 3 + (i - 6) * 0.15),
    }));
  }, [strategy]);

  const chainId = chainConfig?.chainId ?? portfolio?.chainId ?? 8453;

  if (!strategyId || !strategy || staticIdx < 0) {
    return (
      <div className="space-y-4 text-center py-16">
        <p className="text-muted-foreground">Strategy not found.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/strategies">Back to strategies</Link>
        </Button>
      </div>
    );
  }

  const strategyEvents =
    portfolio?.registryRecentEvents?.filter(e => e.strategyId === String(staticIdx)) ?? [];

  const adapterFromMerged =
    (strategy as { adapterAddress?: string | null }).adapterAddress ?? null;
  const tvlSource = (strategy as { tvlSource?: "adapter" | "manual" }).tvlSource;

  const stroke =
    strategy.color === "gold"
      ? COLOR_HSL.gold
      : strategy.color === "info"
        ? COLOR_HSL.info
        : strategy.color === "warning"
          ? COLOR_HSL.warning
          : COLOR_HSL.primary;

  return (
    <div className="space-y-8 max-w-4xl">
      <TransactionConfirmDialog
        open={allocOpen}
        onOpenChange={setAllocOpen}
        title="Update strategy allocation"
        description={`Call strategyRegistry.allocate(${strategyIdField}, ${bps} bps) from the server wallet.`}
        confirmLabel="Submit"
        isLoading={allocateMut.isPending}
        onConfirm={() => {
          allocateMut.mutate(
            { strategyId: strategyIdField, bps: Number(bps) },
            { onSettled: () => setAllocOpen(false) },
          );
        }}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" className="rounded-xl -ml-2 gap-1" asChild>
          <Link to="/strategies">
            <ArrowLeft className="w-4 h-4" /> Strategies
          </Link>
        </Button>
        <Badge variant="outline">{strategy.type}</Badge>
      </div>

      <header className="flex flex-col md:flex-row md:items-start gap-6">
        <div
          className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0",
            strategy.color === "gold" && "bg-gold/15 text-gold",
            strategy.color === "info" && "bg-info/15 text-info",
            strategy.color === "warning" && "bg-warning/15 text-warning",
            !["gold", "info", "warning"].includes(strategy.color) && "bg-primary/15 text-primary",
          )}
        >
          <Icon className="w-8 h-8" />
        </div>
        <div className="space-y-2 flex-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">{strategy.name}</h1>
          <p className="text-muted-foreground leading-relaxed">{strategy.description}</p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="font-mono-num text-2xl font-bold text-primary">{strategy.apy.toFixed(1)}% APY</div>
            <RiskBadge risk={strategy.risk} score={strategy.riskScore} />
            <span className="text-sm text-muted-foreground">Target allocation {strategy.allocation}%</span>
          </div>
        </div>
      </header>

      <section className="glass-card p-6 space-y-2">
        <h2 className="font-display font-semibold">Yield source</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Cash flows and mark-to-market depend on the underlying mandate (rent, hashrate, LP fees, etc.). The DAO sets
          registry weights; this page is descriptive. Past performance does not guarantee future results.
        </p>
        <p className="text-xs text-muted-foreground border-l-2 border-border pl-3">{disclosureForRegistryIndex(staticIdx)}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Badge variant="outline" className="text-[10px]">
            Registry id <span className="font-mono">{staticIdx}</span>
          </Badge>
          {tvlSource && (
            <Badge variant="secondary" className="text-[10px]">
              TVL: {tvlSource === "adapter" ? "adapter.totalAssets()" : "manual registry slot"}
            </Badge>
          )}
        </div>
      </section>

      <section className="glass-card p-6">
        <h2 className="font-display font-semibold mb-4">Illustrative performance (12m)</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={perfData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="m" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" unit="%" />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(v: number) => [`${v.toFixed(2)}%`, "Blended APY (illustrative)"]}
              />
              <Area type="monotone" dataKey="perf" stroke={stroke} strokeWidth={2} fill={stroke} fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-card p-6 space-y-3">
        <h2 className="font-display font-semibold">On-chain contracts</h2>
        <p className="text-xs text-muted-foreground">
          Strategy execution is routed via the DAO registry and vault. Verify balances and events on BaseScan.
        </p>
        <ul className="space-y-2 text-sm">
          {[
            ...buildDeployedContractStripEntries(chainConfig?.contracts).map(r => ({
              label: r.label,
              addr: r.address,
            })),
            ...(adapterFromMerged
              ? [{ label: "Strategy adapter (this id)", addr: adapterFromMerged }]
              : []),
          ].map(
            row =>
              row.addr && (
                <li key={row.label} className="flex flex-wrap justify-between gap-2">
                  <span className="text-muted-foreground">{row.label}</span>
                  <a
                    href={explorerAddressUrl(chainId, row.addr)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-primary inline-flex items-center gap-1 hover:underline min-h-[44px] sm:min-h-0 items-center"
                  >
                    {row.addr.slice(0, 10)}…{row.addr.slice(-6)}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              ),
          )}
        </ul>
      </section>

      {strategyEvents.length > 0 && (
        <section className="glass-card p-6 space-y-3">
          <h2 className="font-display font-semibold">Recent registry events (this strategy)</h2>
          <ul className="space-y-2 text-sm max-h-48 overflow-y-auto">
            {strategyEvents.map((ev, i) => (
              <li key={`${ev.txHash}-${i}`} className="flex flex-wrap justify-between gap-2 border-b border-border/40 pb-2">
                <span>
                  <span className="font-medium">{ev.kind}</span>
                  <span className="text-muted-foreground text-xs"> · block {ev.blockNumber}</span>
                </span>
                {ev.txHash && (
                  <a
                    href={explorerTxUrl(chainId, ev.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary inline-flex items-center gap-1"
                  >
                    Tx <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold">Adjust allocation (bps)</h2>
        <p className="text-xs text-muted-foreground">
          This strategy maps to registry id <span className="font-mono text-foreground">{staticIdx}</span>. Coordinate
          total bps across strategies with DAO votes.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-muted-foreground">Strategy id</label>
            <Input value={strategyIdField} onChange={e => setStrategyIdField(e.target.value)} className="w-28 font-mono" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-muted-foreground">Bps (0–10000)</label>
            <Input value={bps} onChange={e => setBps(e.target.value)} className="w-28 font-mono" />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            onClick={() => setAllocOpen(true)}
            disabled={allocateMut.isPending || isLoading}
          >
            {allocateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Apply on-chain
          </Button>
        </div>
      </section>
    </div>
  );
};
