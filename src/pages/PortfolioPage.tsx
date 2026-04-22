import { Award, TrendingUp, Wallet, Loader2 } from "lucide-react";
import { LearningBadgesStrip } from "@/components/learning/LearningBadgesStrip";
import { VaultPatronClaim } from "@/components/learning/VaultPatronClaim";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatCard } from "@/components/StatCard";
import { LevelProgress } from "@/components/LevelProgress";
import { Badge } from "@/components/ui/badge";
import { strategies as staticStrategies, userStats, growthData, levels } from "@/data/club";
import { mergeStrategiesForUi, usePortfolio } from "@/hooks/useChainData";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

const achievements = [
  { name: "First Deposit", icon: "🌱", earned: true, rarity: "Common" },
  { name: "10 Modules Done", icon: "📘", earned: true, rarity: "Common" },
  { name: "Diamond Hands", icon: "💎", earned: true, rarity: "Rare" },
  { name: "Governance Voter", icon: "🗳️", earned: true, rarity: "Common" },
  { name: "Strategy Pioneer", icon: "🚀", earned: false, rarity: "Epic" },
  { name: "Real Estate Backer", icon: "🏛️", earned: false, rarity: "Legendary" },
];

export const PortfolioPage = () => {
  const { data: portfolio, isLoading, isError } = usePortfolio();
  const mergedStrategies = useMemo(
    () => mergeStrategiesForUi(portfolio, staticStrategies),
    [portfolio],
  );

  const totalSavings = portfolio?.totalSavings ?? 0;
  const yieldEarned = portfolio?.yieldEarned ?? 0;
  const govWeight = portfolio?.governanceWeight ?? 1;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Portfolio</h1>
        <p className="text-muted-foreground text-sm mt-1">Your positions, rewards and progression in one view.</p>
        {isError && (
          <p className="text-sm text-destructive mt-2">
            Could not load on-chain data. Ensure the API is running and `.env` is configured.
          </p>
        )}
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Value"
          value={isLoading ? "…" : `$${totalSavings.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          delta={2.4}
          sub="all assets"
          icon={Wallet}
          accent="primary"
        />
        <StatCard
          label="Lifetime Yield"
          value={isLoading ? "…" : `$${yieldEarned.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          delta={12.8}
          sub="since join"
          icon={TrendingUp}
          accent="gold"
        />
        <StatCard
          label="Governance Weight"
          value={isLoading ? "…" : `${govWeight.toFixed(2)}x`}
          sub={`${userStats.level} tier`}
          icon={Award}
          accent="info"
        />
        <StatCard
          label="XP Earned"
          value={userStats.xp.toLocaleString()}
          delta={8.2}
          sub="this season"
          icon={Award}
          accent="primary"
        />
      </div>

      <section className="glass-card p-6 space-y-3">
        <h3 className="font-display font-semibold text-lg">Learning credentials</h3>
        <p className="text-xs text-muted-foreground">
          Badges reflect your connected wallet. Complete Academy journeys or meet the Vault Patron threshold.
        </p>
        <LearningBadgesStrip />
        <VaultPatronClaim />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-display font-semibold text-lg mb-1">Strategy Positions</h3>
          <p className="text-xs text-muted-foreground mb-4">Personal allocation across active vaults</p>
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm py-8">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading chain data…
            </div>
          )}
          <div className="space-y-2">
            {!isLoading &&
              mergedStrategies.map(s => {
                const myValue = totalSavings * (s.allocation / 100);
                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-xl border border-border/60 bg-secondary/30 hover:border-primary/30 transition"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">{s.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {s.type} · {s.risk} risk
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono-num font-semibold text-sm">
                          ${myValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-[11px] text-primary font-mono-num">+{s.apy.toFixed(1)}% APY</div>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                      <div className="h-full bg-gradient-primary" style={{ width: `${s.allocation * 2.5}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-display font-semibold mb-1">Yield Curve</h3>
            <p className="text-xs text-muted-foreground mb-3">Compounding over 12 months</p>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(152 76% 50%)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="hsl(152 76% 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => `$${v.toLocaleString()}`}
                  />
                  <Area type="monotone" dataKey="yield" stroke="hsl(152 76% 50%)" strokeWidth={2} fill="url(#gp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <LevelProgress current={userStats.level} xp={userStats.xp} xpToNext={userStats.xpToNext} />
        </div>
      </div>

      <section className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">Savings Levels</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {levels.map((lvl, i) => {
            const reached = userStats.xp >= lvl.min;
            const current = lvl.name === userStats.level;
            return (
              <div
                key={lvl.name}
                className={cn(
                  "p-4 rounded-xl border transition",
                  current
                    ? "border-primary bg-primary/10 shadow-glow"
                    : reached
                      ? "border-border/80 bg-secondary/30"
                      : "border-border/40 bg-secondary/10 opacity-60",
                )}
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Level {i + 1}</div>
                <div className="font-display font-semibold">{lvl.name}</div>
                <div className="text-xs text-muted-foreground font-mono-num mt-0.5">{lvl.min.toLocaleString()} XP</div>
                <Badge variant="outline" className={cn("text-[10px] mt-2 border-border/60", current && "border-primary/40 text-primary")}>
                  {lvl.multiplier} boost
                </Badge>
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-card p-6">
        <h3 className="font-display font-semibold text-lg mb-4">NFT Achievements</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {achievements.map(a => (
            <div
              key={a.name}
              className={cn(
                "p-4 rounded-xl border text-center transition",
                a.earned
                  ? "border-primary/30 bg-primary/5 hover:border-primary/60 hover:shadow-glow"
                  : "border-border/40 bg-secondary/20 opacity-50",
              )}
            >
              <div className="text-3xl mb-2">{a.icon}</div>
              <div className="text-xs font-medium leading-tight">{a.name}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{a.rarity}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
