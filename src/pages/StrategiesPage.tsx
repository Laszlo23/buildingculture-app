import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { strategies as staticStrategies } from "@/data/club";
import { StrategyCard } from "@/components/StrategyCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mergeStrategiesForUi, useAllocateMutation, usePortfolio } from "@/hooks/useChainData";
import { TransactionConfirmDialog } from "@/components/TransactionConfirmDialog";
import { Input } from "@/components/ui/input";

const filters = ["All", "Real Asset", "DeFi", "Mining", "AI Trading", "Staking"];

export const StrategiesPage = () => {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [strategyId, setStrategyId] = useState("0");
  const [bps, setBps] = useState("2500");
  const [allocOpen, setAllocOpen] = useState(false);

  const { data: portfolio, isLoading } = usePortfolio();
  const allocateMut = useAllocateMutation();

  const merged = useMemo(() => mergeStrategiesForUi(portfolio, staticStrategies), [portfolio]);

  const filtered = merged.filter(
    s =>
      (filter === "All" || s.type === filter) && s.name.toLowerCase().includes(query.toLowerCase()),
  );

  const totalTvl = merged.reduce((a, s) => a + (typeof s.tvl === "number" ? s.tvl : 0), 0);
  const avgApy =
    merged.reduce((a, s) => a + s.apy * s.allocation, 0) /
    Math.max(1, merged.reduce((a, s) => a + s.allocation, 0));

  return (
    <div className="space-y-6">
      <TransactionConfirmDialog
        open={allocOpen}
        onOpenChange={setAllocOpen}
        title="Update strategy allocation"
        description={`Call strategyRegistry.allocate(${strategyId}, ${bps} bps) from the server wallet.`}
        confirmLabel="Submit"
        isLoading={allocateMut.isPending}
        onConfirm={() => {
          allocateMut.mutate(
            { strategyId, bps: Number(bps) },
            { onSettled: () => setAllocOpen(false) },
          );
        }}
      />

      <header className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">Strategy Explorer</h1>
            <p className="text-muted-foreground text-sm mt-1">Browse all on-chain strategies governed by the DAO.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="glass rounded-xl px-4 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total TVL</div>
              <div className="font-mono-num font-semibold text-lg">
                {isLoading ? "…" : `$${(totalTvl / 1_000_000).toFixed(2)}M`}
              </div>
            </div>
            <div className="glass rounded-xl px-4 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Blended APY</div>
              <div className="font-mono-num font-semibold text-lg text-primary">{avgApy.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 min-w-[240px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search strategies"
              className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 glass rounded-xl p-1">
            {filters.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition",
                  filter === f ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" className="rounded-xl">
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <section className="glass-card p-4 space-y-3">
        <div className="text-sm font-medium">On-chain allocation (strategyRegistry.allocate)</div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-muted-foreground">Strategy id</label>
            <Input
              value={strategyId}
              onChange={e => setStrategyId(e.target.value)}
              className="w-28 font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-muted-foreground">Bps (0–10000)</label>
            <Input value={bps} onChange={e => setBps(e.target.value)} className="w-28 font-mono" />
          </div>
          <Button type="button" variant="secondary" className="rounded-xl" onClick={() => setAllocOpen(true)} disabled={allocateMut.isPending}>
            {allocateMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Apply on-chain
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(s => (
          <StrategyCard key={s.id} strategy={s} />
        ))}
      </section>
    </div>
  );
};
