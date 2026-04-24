import { useMemo, useState } from "react";
import { useFarcasterQuery } from "@/hooks/useFarcaster";
import { Link, useParams } from "react-router-dom";
import { useEnsName } from "wagmi";
import { mainnet } from "wagmi/chains";
import { ArrowLeft, ExternalLink, Loader2, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LearningBadgesStrip } from "@/components/learning/LearningBadgesStrip";
import { AchievementBadges } from "@/components/wealth/AchievementBadges";
import { ShareWealthCard } from "@/components/wealth/ShareWealthCard";
import { StrategyBreakdownTable } from "@/components/wealth/StrategyBreakdownTable";
import { WealthLineChart } from "@/components/wealth/WealthLineChart";
import { useWealthQuery } from "@/hooks/useWealth";
import { explorerAddressUrl } from "@/lib/api";
import { useChainConfig } from "@/hooks/useChainData";
import type { WealthRange } from "@/lib/api";
import { shortAddress } from "@/components/wealth/InvestorAddressLink";

const RANGES: WealthRange[] = ["1M", "3M", "6M", "1Y", "ALL"];

export function InvestorPage() {
  const { address: raw } = useParams<{ address: string }>();
  const address = raw?.startsWith("0x") ? raw : raw ? `0x${raw}` : "";
  const valid = /^0x[a-fA-F0-9]{40}$/i.test(address);
  const [range, setRange] = useState<WealthRange>("1Y");
  const { data: chainCfg } = useChainConfig();
  const q = useWealthQuery(valid ? address : undefined, range);
  const { data: ensName } = useEnsName({
    address: valid ? (address as `0x${string}`) : undefined,
    chainId: mainnet.id,
    query: { enabled: valid },
  });
  const { data: farcaster } = useFarcasterQuery(valid ? address : undefined);

  const xpPct = useMemo(() => {
    if (!q.data) return 0;
    const { xp, xpToNext } = q.data.level;
    const cap = xp + xpToNext;
    return cap > 0 ? Math.min(100, Math.round((xp / cap) * 100)) : 0;
  }, [q.data]);

  if (!valid) {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="font-display text-2xl font-semibold">Invalid address</h1>
        <p className="text-sm text-muted-foreground">Use a valid 0x-prefixed 40-hex wallet in the URL.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" /> Home
          </Link>
        </Button>
      </div>
    );
  }

  if (q.isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm">Loading public wealth graph…</p>
      </div>
    );
  }

  if (q.isError) {
    const msg = q.error instanceof Error ? q.error.message : String(q.error);
    const isPrivate = msg.toLowerCase().includes("private");
    return (
      <div className="max-w-lg space-y-4 glass-card p-8">
        <ShieldOff className="h-10 w-10 text-muted-foreground" />
        <h1 className="font-display text-2xl font-semibold">{isPrivate ? "Private profile" : "Could not load"}</h1>
        <p className="text-sm text-muted-foreground">
          {isPrivate
            ? "This member turned off their public wealth profile."
            : msg}
        </p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/leaderboard">View leaderboard</Link>
        </Button>
      </div>
    );
  }

  if (!q.data) return null;

  const d = q.data;
  const scan = chainCfg?.chainId != null ? explorerAddressUrl(chainCfg.chainId, d.address) : null;
  const headerName = ensName ?? d.profile.wealthDisplayName ?? shortAddress(d.address);

  return (
    <div className="relative space-y-10 pb-16">
      <div
        className="absolute inset-x-0 top-0 h-72 -z-10 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -20%, hsl(var(--primary) / 0.25), transparent), radial-gradient(ellipse 50% 40% at 100% 0%, hsl(142 76% 36% / 0.12), transparent)",
        }}
      />

      <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3 min-w-0">
          <Button variant="ghost" size="sm" className="rounded-xl -ml-2 w-fit" asChild>
            <Link to="/leaderboard">
              <ArrowLeft className="w-4 h-4 mr-2" /> Leaderboard
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight truncate">{headerName}</h1>
            <Badge variant="outline" className="border-primary/40 text-primary shrink-0">
              {d.level.label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="break-all">{d.address}</span>
            {farcaster?.configured && farcaster.user && (
              <a
                href={farcaster.user.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary font-sans font-medium not-italic hover:underline shrink-0"
              >
                @{farcaster.user.username}
              </a>
            )}
            {scan && (
              <a href={scan} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline shrink-0">
                BaseScan <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          {d.profile.memberSince && (
            <p className="text-xs text-muted-foreground">
              Member since {new Date(d.profile.memberSince).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
            </p>
          )}
          <div className="max-w-md space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>XP progress</span>
              <span className="font-mono-num text-foreground">{d.level.xp.toLocaleString()} XP</span>
            </div>
            <Progress value={xpPct} className="h-2 bg-secondary" />
          </div>
        </div>
      </header>

      <section className="glass-card border border-border/60 p-5 space-y-3">
        <div>
          <h2 className="font-display text-lg font-semibold">On-chain credentials</h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-prose">
            Soulbound Academy NFTs and vault patron status for this wallet (same art as in-app mint previews).
          </p>
        </div>
        <LearningBadgesStrip viewerAddress={d.address} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Vault balance", val: d.portfolio.totalSavings, cls: "text-foreground", kind: "usd" as const },
          { label: "Protocol vault TVL", val: d.portfolio.vaultTotalAssets, cls: "text-foreground", kind: "usd" as const },
          { label: "Yield earned (contract)", val: d.portfolio.yieldEarned, cls: "text-success", kind: "usd" as const },
          { label: "Voting power (weight)", val: d.portfolio.governanceWeight, cls: "text-primary", kind: "num" as const },
          {
            label: "Strategies used",
            val: d.portfolio.strategies.filter((s) => s.allocationBps > 0).length,
            cls: "text-foreground",
            kind: "int" as const,
          },
          { label: "DAO proposals participated", val: 0, cls: "text-muted-foreground", kind: "prop" as const },
        ].map((row) => (
          <div key={row.label} className="glass-card p-5 space-y-1 border border-border/50">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{row.label}</p>
            <p className={`text-2xl font-mono-num font-semibold ${row.cls}`}>
              {row.kind === "prop"
                ? "—"
                : row.kind === "int"
                  ? String(row.val)
                  : row.kind === "num"
                    ? row.val.toLocaleString(undefined, { maximumFractionDigits: 1 })
                    : row.val.toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
            </p>
            {row.kind === "prop" && (
              <p className="text-[10px] text-muted-foreground">Per-wallet proposal history needs log indexer.</p>
            )}
          </div>
        ))}
      </section>

      <section className="glass-card border border-border/60 p-6 space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Wealth graph</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-prose">{d.meta.dataProvenance}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {RANGES.map((r) => (
              <Button
                key={r}
                type="button"
                size="sm"
                variant={range === r ? "default" : "outline"}
                className="rounded-xl font-mono text-xs"
                onClick={() => setRange(r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
        <WealthLineChart data={d.series} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Strategy performance</h2>
        <StrategyBreakdownTable rows={d.strategies} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Achievements</h2>
        <AchievementBadges items={d.achievements} />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Share</h2>
        <ShareWealthCard data={d} shortAddress={shortAddress(d.address)} />
      </section>
    </div>
  );
}
