import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Wallet, Plus, ArrowDownToLine, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransactionConfirmDialog } from "@/components/TransactionConfirmDialog";
import { strategies as staticStrategies } from "@/data/club";
import {
  mergeStrategiesForUi,
  useChainConfig,
  useDepositMutation,
  usePortfolio,
  useWithdrawMutation,
} from "@/hooks/useChainData";
import { cn } from "@/lib/utils";
import { VerifyOnChainStrip } from "@/components/dashboard/VerifyOnChainStrip";
import { Link } from "react-router-dom";

export const VaultPage = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [tab, setTab] = useState<"deposit" | "withdraw">(
    tabParam === "withdraw" ? "withdraw" : "deposit",
  );
  const [amount, setAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (tabParam === "withdraw" || tabParam === "deposit") setTab(tabParam);
  }, [tabParam]);

  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio();
  const { data: chainConfig } = useChainConfig();
  const depositMut = useDepositMutation();
  const withdrawMut = useWithdrawMutation();

  const decimals = chainConfig?.assetDecimals ?? 6;

  const mergedStrategies = useMemo(
    () => mergeStrategiesForUi(portfolio, staticStrategies),
    [portfolio],
  );

  const primaryBalance = portfolio?.totalSavings ?? 0;
  const blendedApy =
    mergedStrategies.reduce((a, s) => a + s.apy * s.allocation, 0) /
      Math.max(1, mergedStrategies.reduce((a, s) => a + s.allocation, 0)) || 0;

  const tokens = [
    {
      symbol: "USDC",
      name: "USD Coin",
      balance: primaryBalance,
      apy: blendedApy || 8.4,
      color: "info" as const,
    },
  ];

  const selected = tokens[0]!;
  const pending = depositMut.isPending || withdrawMut.isPending;

  const executeTab = () => {
    if (!amount.trim()) return;
    if (tab === "deposit") {
      depositMut.mutate(
        { amount, decimals },
        { onSettled: () => setConfirmOpen(false) },
      );
    } else {
      withdrawMut.mutate(
        { amount, decimals },
        { onSettled: () => setConfirmOpen(false) },
      );
    }
  };

  const chainId = chainConfig?.chainId ?? portfolio?.chainId ?? 8453;

  return (
    <div className="space-y-6">
      <TransactionConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={tab === "deposit" ? "Confirm deposit" : "Confirm withdraw"}
        description={`Submit ${tab} of ${amount || "0"} ${selected.symbol} via server-signed transaction on Base.`}
        confirmLabel="Sign & send"
        isLoading={pending}
        onConfirm={executeTab}
      />

      <VerifyOnChainStrip
        chainId={chainId}
        compact
        entries={[
          { label: "Vault", address: chainConfig?.contracts?.vault },
          { label: "Treasury", address: chainConfig?.contracts?.treasury },
          { label: "Strategy registry", address: chainConfig?.contracts?.strategyRegistry },
        ]}
      />
      <div className="flex justify-end">
        <Link to="/transparency" className="text-xs font-medium text-primary hover:underline py-2 min-h-[44px] flex items-center">
          How these numbers are sourced
        </Link>
      </div>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">Member Vault</h1>
          <p className="text-muted-foreground text-sm mt-1">Deposit auto-allocates into DAO-governed strategies. Withdraw anytime.</p>
        </div>
        <div className="flex items-center gap-2 glass rounded-xl px-4 py-2.5">
          <div className="text-xs text-muted-foreground">Your blended APY</div>
          <div className="font-mono-num font-semibold text-lg text-primary">
            {portfolioLoading ? "…" : `${blendedApy.toFixed(1)}%`}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="glass-card p-6 lg:col-span-2 space-y-5">
          <div className="flex items-center gap-1 p-1 bg-secondary/40 rounded-xl">
            {(["deposit", "withdraw"] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-lg capitalize transition",
                  tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Asset</label>
            <div className="grid grid-cols-1 gap-2">
              {tokens.map(t => (
                <div
                  key={t.symbol}
                  className="p-3 rounded-xl border border-primary bg-primary/10 shadow-glow text-center"
                >
                  <div className="font-mono font-semibold text-sm">{t.symbol}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t.apy.toFixed(1)}% APY</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-muted-foreground">Amount</label>
              <span className="text-xs text-muted-foreground">
                Balance:{" "}
                <span className="font-mono-num text-foreground">
                  {portfolioLoading ? "…" : selected.balance.toLocaleString()} {selected.symbol}
                </span>
              </span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full h-16 bg-secondary/40 border border-border/60 rounded-xl px-4 pr-20 font-mono-num text-2xl font-semibold focus:outline-none focus:border-primary transition"
              />
              <button
                type="button"
                onClick={() => setAmount(selected.balance.toString())}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20"
              >
                MAX
              </button>
            </div>
            <div className="flex gap-2">
              {[25, 50, 75, 100].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(((selected.balance * p) / 100).toString())}
                  className="flex-1 py-1.5 text-xs rounded-lg border border-border/60 text-muted-foreground hover:text-primary hover:border-primary/30"
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Allocation strategies</span>
              <span className="font-medium">{mergedStrategies.length} vaults</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated APY</span>
              <span className="font-mono-num text-primary font-medium">{selected.apy.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Asset decimals</span>
              <span className="font-mono-num">{decimals}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow gap-2 min-h-[48px] h-12 text-base sm:text-sm"
            disabled={pending || !amount.trim()}
            onClick={() => setConfirmOpen(true)}
          >
            {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : tab === "deposit" ? <Plus className="w-4 h-4" /> : <ArrowDownToLine className="w-4 h-4" />}
            {tab === "deposit" ? "Deposit" : "Withdraw"} {amount || "0"} {selected.symbol}
          </Button>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-semibold text-lg">Your Holdings</h3>
                <p className="text-xs text-muted-foreground mt-0.5">On-chain vault position (server wallet)</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl gap-1" disabled>
                <Wallet className="w-3.5 h-3.5" /> Custodial signer
              </Button>
            </div>
            <div className="space-y-2">
              {tokens.map(t => (
                <div
                  key={t.symbol}
                  className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/60 hover:border-primary/30 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-mono font-semibold text-sm",
                        t.color === "info" && "bg-info/15 text-info",
                      )}
                    >
                      {t.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{t.symbol}</div>
                      <div className="text-xs text-muted-foreground">{t.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-num font-medium">
                      {portfolioLoading ? "…" : t.balance.toLocaleString()}
                    </div>
                    <div className="text-xs text-primary font-mono-num">+{t.apy.toFixed(1)}% APY</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-info" />
              <h3 className="font-display font-semibold">How allocation works</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every deposit is auto-routed across strategies based on the current DAO governance vote. Members can override their personal allocation at any time, and yield is harvested every epoch (24h) directly to your level-boosted reward pool.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {mergedStrategies.slice(0, 3).map(s => (
                <div key={s.id} className="p-3 rounded-lg bg-secondary/30 border border-border/60">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.type}</div>
                  <div className="text-sm font-medium truncate">{s.name}</div>
                  <div className="text-xs font-mono-num text-primary mt-0.5">{s.allocation}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
