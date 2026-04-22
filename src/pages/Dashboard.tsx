import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useConnection } from "wagmi";
import {
  Wallet,
  TrendingUp,
  Building2,
  Trophy,
  ArrowRight,
  Vote,
  Activity,
  Bitcoin,
  Sparkles,
  ChevronRight,
  Loader2,
  Landmark,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart as RPieChart,
  Pie,
  Cell,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { LevelProgress } from "@/components/LevelProgress";
import { TransactionConfirmDialog } from "@/components/TransactionConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardOnboarding } from "@/components/dashboard/DashboardOnboarding";
import { DashboardVaultCard } from "@/components/dashboard/DashboardVaultCard";
import { PlatformMetricsStrip } from "@/components/dashboard/PlatformMetricsStrip";
import { StrategyPerformanceTable } from "@/components/dashboard/StrategyPerformanceTable";
import { ContractAddressesBlock } from "@/components/dashboard/ContractAddressesBlock";
import { VerifyOnChainStrip } from "@/components/dashboard/VerifyOnChainStrip";
import { strategies as staticStrategies, userStats, growthData as fallbackGrowth } from "@/data/club";
import {
  mergeStrategiesForUi,
  useChainConfig,
  useClaimYieldMutation,
  usePortfolio,
  useProposals,
  useTreasury,
} from "@/hooks/useChainData";
import heroMesh from "@/assets/hero-mesh.jpg";
import { getLeadReserveImagePath, publicAssetSrc } from "@/data/realAssets";

const COLOR_HSL = {
  primary: "hsl(152 76% 50%)",
  gold: "hsl(42 92% 60%)",
  info: "hsl(200 90% 60%)",
  warning: "hsl(35 92% 58%)",
};

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const fmtMoney = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function queryErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e ?? "Unknown error");
}

export const Dashboard = () => {
  const [claimOpen, setClaimOpen] = useState(false);
  const { status } = useConnection();
  const { data: chainConfig } = useChainConfig();
  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioQueryError,
  } = usePortfolio();
  const { data: treasury, isLoading: treasuryLoading } = useTreasury();
  const { data: proposalsList, isLoading: proposalsLoading } = useProposals();
  const claimMut = useClaimYieldMutation();

  const mergedStrategies = useMemo(
    () => mergeStrategiesForUi(portfolio, staticStrategies),
    [portfolio],
  );

  const allocationData = useMemo(
    () =>
      mergedStrategies.map(s => ({
        name: s.name.split(" ")[0],
        fullName: s.name,
        value: s.allocation,
        color: s.color,
      })),
    [mergedStrategies],
  );

  const growthData = useMemo(() => {
    const total = portfolio?.totalSavings;
    if (total == null || total <= 0) return fallbackGrowth;
    const base = Math.max(total * 0.72, 1000);
    return Array.from({ length: 12 }, (_, i) => {
      const growth = base * Math.pow(1.018, i) + Math.sin(i / 2) * 400;
      const yieldVal = growth - base + total * 0.12;
      return {
        month: months[i],
        savings: Math.round(growth),
        yield: Math.round(yieldVal),
      };
    });
  }, [portfolio?.totalSavings]);

  const savings = portfolio?.totalSavings ?? 0;
  const yieldEarned = portfolio?.yieldEarned ?? 0;
  const treasuryM = (treasury?.totalTreasury ?? 0) / 1_000_000;
  const blendedApy = portfolio?.blendedApy ?? 0;
  const avgApy = treasury?.avgApy ?? 0;
  const govWeight = portfolio?.governanceWeight ?? 1;
  const vaultTvl = portfolio?.vaultTotalAssets ?? 0;

  const activeProposals = (proposalsList ?? []).filter(p => p.status === "active");
  const displayProposals = activeProposals.slice(0, 3);

  const voteParticipationIndex =
    proposalsList?.reduce((acc, p) => acc + p.forVotes + p.againstVotes + p.abstainVotes, 0) ?? 0;

  const walletConnected = status === "connected";
  const hasDeposit = savings > 0;
  const hasYield = yieldEarned > 0;

  const chainId = chainConfig?.chainId ?? portfolio?.chainId ?? 8453;

  const leadReserveImagePath = useMemo(() => getLeadReserveImagePath(), []);
  const metricSources = portfolio?.metricSources;

  const contractEntries = [
    { label: "Vault", address: chainConfig?.contracts?.vault },
    { label: "Treasury", address: chainConfig?.contracts?.treasury },
    { label: "DAO", address: chainConfig?.contracts?.dao },
    { label: "Strategy registry", address: chainConfig?.contracts?.strategyRegistry },
  ];

  return (
    <div className="space-y-6">
      <TransactionConfirmDialog
        open={claimOpen}
        onOpenChange={setClaimOpen}
        title="Claim yield on-chain"
        description="This will submit claimYield() from the server wallet to Base. Confirm to continue."
        confirmLabel="Submit transaction"
        isLoading={claimMut.isPending}
        onConfirm={() => {
          claimMut.mutate(undefined, {
            onSettled: () => setClaimOpen(false),
          });
        }}
      />

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl glass border-primary/20"
      >
        <img
          src={heroMesh}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        <div className="relative px-6 lg:px-10 py-8 lg:py-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
                <Sparkles className="w-3 h-3 mr-1.5" /> The Onchain Wealth Club
              </Badge>
              <Badge variant="secondary" className="text-xs font-normal">
                Welcome back, <span className="text-primary font-medium">{userStats.level}</span>
              </Badge>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight leading-tight">
              One Vault. Multiple Yield Strategies. Real-World Asset Backing.
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base max-w-2xl">
              Grow savings through tokenized real estate, AI trading, BTC mining, and DeFi — governed by the community.
            </p>
            <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
              Save · Learn · Earn · Govern — a financial movement, not just a dashboard.
            </p>
            {portfolioError && (
              <div className="text-sm text-destructive space-y-1">
                <p>
                  Could not load on-chain portfolio. Run `npm run dev`, open http://localhost:8080 (API on port 3001),
                  and configure RPC + contracts in `.env`. For static or preview builds, set `VITE_API_URL` to your API
                  origin.
                </p>
                {portfolioQueryError != null && (
                  <p className="font-mono text-xs opacity-90 break-all" title={queryErrorMessage(portfolioQueryError)}>
                    {queryErrorMessage(portfolioQueryError)}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow gap-2"
              asChild
            >
              <Link to="/vault?tab=deposit">
                <Wallet className="w-4 h-4" /> Deposit
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-border/80 gap-2"
              onClick={() => setClaimOpen(true)}
              disabled={claimMut.isPending}
            >
              {claimMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              Claim yield
            </Button>
          </div>
        </div>
      </motion.section>

      <DashboardOnboarding
        walletConnected={walletConnected}
        hasDeposit={hasDeposit}
        hasYield={hasYield}
      />

      <DashboardVaultCard
        vaultBalance={savings}
        yieldEarned={yieldEarned}
        claimableLabel={portfolioLoading ? "…" : fmtMoney(yieldEarned)}
        portfolioLoading={portfolioLoading}
        onClaimYield={() => setClaimOpen(true)}
        claimPending={claimMut.isPending}
      />

      <PlatformMetricsStrip
        vaultTvl={vaultTvl}
        yieldLabel="Your yield (API signer)"
        yieldSub={portfolioLoading ? "…" : fmtMoney(yieldEarned)}
        treasury={treasury?.totalTreasury ?? 0}
        members={treasury?.totalMembers ?? 0}
        treasuryLoading={treasuryLoading}
        portfolioLoading={portfolioLoading}
      />

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative overflow-hidden rounded-2xl glass border border-border/60"
      >
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          {leadReserveImagePath && (
            <div className="relative sm:w-44 sm:shrink-0 h-40 sm:h-auto border-b sm:border-b-0 sm:border-r border-border/50">
              <img
                src={publicAssetSrc(leadReserveImagePath)}
                alt="Featured property photograph from reserves"
                className="absolute inset-0 w-full h-full object-cover"
                width={352}
                height={240}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-transparent sm:bg-gradient-to-t sm:from-transparent sm:to-background/40" />
            </div>
          )}
          <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-primary text-xs font-medium uppercase tracking-wider">
                <Landmark className="w-4 h-4" /> Real-world backing
              </div>
              <p className="text-sm text-foreground leading-snug">
                Selected properties and reference programmes anchor the club’s transparency narrative — photography and fact sheets on the reserves page.
              </p>
              <p className="text-xs text-muted-foreground">
                Reference figures from issuer materials; not investment advice.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-xl border-primary/30 shrink-0 self-start sm:self-center"
              asChild
            >
              <Link to="/reserves" className="gap-2">
                View reserves
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Savings"
          value={portfolioLoading ? "…" : fmtMoney(savings)}
          delta={2.4}
          sub="Vault balance"
          sourceHint={metricSources?.totalSavings === "on-chain" ? "On-chain" : undefined}
          icon={Wallet}
          accent="primary"
        />
        <StatCard
          label="Yield Earned"
          value={portfolioLoading ? "…" : fmtMoney(yieldEarned)}
          delta={12.8}
          sub="claimed + pending"
          sourceHint={metricSources?.yieldEarned === "on-chain" ? "On-chain" : undefined}
          icon={TrendingUp}
          accent="primary"
        />
        <StatCard
          label="Treasury Size"
          value={treasuryLoading ? "…" : `$${treasuryM.toFixed(2)}M`}
          delta={4.1}
          sub={`${fmt(treasury?.totalMembers ?? 0)} members (index TBD)`}
          sourceHint={metricSources?.treasurySize === "on-chain" ? "On-chain" : undefined}
          icon={Building2}
          accent="gold"
        />
        <StatCard
          label="Blended APY"
          value={portfolioLoading ? "…" : `${blendedApy > 0 ? blendedApy.toFixed(1) : "—"}%`}
          delta={0.6}
          sub={avgApy > 0 ? `Network avg ${avgApy.toFixed(1)}%` : "Set APY on-chain"}
          sourceHint={metricSources?.blendedApy === "placeholder" ? "Placeholder" : "On-chain"}
          icon={Activity}
          accent="info"
        />
      </section>

      <div className="space-y-2">
        <VerifyOnChainStrip
          chainId={chainId}
          compact
          entries={[
            { label: "Vault", address: chainConfig?.contracts?.vault },
            { label: "Treasury", address: chainConfig?.contracts?.treasury },
            { label: "Strategy registry", address: chainConfig?.contracts?.strategyRegistry },
            { label: "DAO", address: chainConfig?.contracts?.dao },
          ]}
        />
        <div className="flex justify-end px-1">
          <Button variant="link" size="sm" className="text-xs h-auto py-1" asChild>
            <Link to="/transparency">Full transparency map & registry log</Link>
          </Button>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg">Portfolio Growth</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Total savings & cumulative yield · 12 months</p>
            </div>
            <div className="flex items-center gap-1 glass rounded-lg p-1">
              {["1M", "3M", "1Y", "All"].map((p, i) => (
                <button
                  key={p}
                  type="button"
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                    i === 2 ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLOR_HSL.primary} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={COLOR_HSL.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gYield" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLOR_HSL.gold} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={COLOR_HSL.gold} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number) => `$${v.toLocaleString()}`}
                />
                <Area type="monotone" dataKey="savings" stroke={COLOR_HSL.primary} strokeWidth={2} fill="url(#gSavings)" />
                <Area type="monotone" dataKey="yield" stroke={COLOR_HSL.gold} strokeWidth={2} fill="url(#gYield)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" /> <span className="text-muted-foreground">Savings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />{" "}
              <span className="text-muted-foreground">Cumulative yield</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="mb-4">
            <h3 className="font-display font-semibold text-lg">Strategy Allocation</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Live DAO treasury split</p>
          </div>
          <div className="h-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={allocationData}
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="hsl(var(--background))"
                  strokeWidth={2}
                >
                  {allocationData.map((entry, i) => (
                    <Cell key={i} fill={COLOR_HSL[entry.color as keyof typeof COLOR_HSL]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(v: number, _n, p: { payload: { fullName: string } }) => [`${v}%`, p.payload.fullName]}
                />
              </RPieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Strategies</div>
              <div className="font-display font-semibold text-2xl font-mono-num">{mergedStrategies.length}</div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 max-h-32 overflow-y-auto">
            {allocationData.map((a, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: COLOR_HSL[a.color as keyof typeof COLOR_HSL] }}
                  />
                  <span className="text-muted-foreground truncate">{a.fullName}</span>
                </div>
                <span className="font-mono-num font-medium">{a.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StrategyPerformanceTable
        strategies={mergedStrategies.map(s => ({
          id: s.id,
          name: s.name,
          apy: s.apy,
          risk: s.risk,
          allocation: s.allocation,
          tvl: s.tvl,
        }))}
      />

      <ContractAddressesBlock chainId={chainId} entries={contractEntries} />

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LevelProgress current={userStats.level} xp={userStats.xp} xpToNext={userStats.xpToNext} />

        <div className="glass-card p-6 lg:col-span-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 p-3 rounded-xl bg-secondary/30 border border-border/50">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1">
                <Landmark className="w-3 h-3" /> Treasury
              </div>
              <div className="font-mono-num font-semibold text-sm mt-0.5">
                {treasuryLoading ? "…" : fmtMoney(treasury?.totalTreasury ?? 0)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Open proposals</div>
              <div className="font-mono-num font-semibold text-sm mt-0.5">
                {proposalsLoading ? "…" : activeProposals.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Live strategies</div>
              <div className="font-mono-num font-semibold text-sm mt-0.5">{mergedStrategies.length}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Vote index</div>
              <div className="font-mono-num font-semibold text-sm mt-0.5">
                {proposalsLoading ? "…" : voteParticipationIndex.toFixed(0)}
              </div>
              <div className="text-[9px] text-muted-foreground">for+against+abstain</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-lg">Active Governance</h3>
              <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-[10px]">
                {proposalsLoading ? "…" : `${activeProposals.length} open`}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-xs gap-1" asChild>
              <Link to="/dao">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {proposalsLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading proposals…
              </div>
            )}
            {!proposalsLoading &&
              displayProposals.map(p => {
                const total = p.forVotes + p.againstVotes + p.abstainVotes || 1;
                const forPct = (p.forVotes / total) * 100;
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-border/60 bg-secondary/30 hover:border-primary/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-muted-foreground">{p.id}</span>
                          <Badge variant="outline" className="text-[9px] py-0 border-border/60">
                            {p.category}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">
                          {p.title}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-muted-foreground">Ends in</div>
                        <div className="text-xs font-mono-num font-medium">{p.endsIn}</div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden flex">
                        <div className="h-full bg-success" style={{ width: `${forPct}%` }} />
                        <div className="h-full bg-destructive" style={{ width: `${(p.againstVotes / total) * 100}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-success font-mono-num">{p.forVotes}% For</span>
                        <span className="text-destructive font-mono-num">{p.againstVotes}% Against</span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-semibold text-xl">Top Performing Strategies</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Voting power {govWeight.toFixed(2)}x · Tap a card for depth & allocation
            </p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl gap-1" asChild>
            <Link to="/strategies">
              Explore all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...mergedStrategies]
            .sort((a, b) => b.apy - a.apy)
            .slice(0, 3)
            .map(s => {
              const Icon = s.icon === "Brain" ? Trophy : s.icon === "Bitcoin" ? Bitcoin : Building2;
              return (
                <Link key={s.id} to={`/strategies/${s.id}`} className="block group">
                  <div className="glass-card p-5 h-full hover:border-primary/40 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">
                        {s.type}
                      </Badge>
                    </div>
                    <h4 className="font-display font-semibold mb-1 group-hover:text-primary transition-colors">{s.name}</h4>
                    <div className="font-mono-num font-bold text-2xl text-gradient-primary">
                      {s.apy.toFixed(1)}% <span className="text-xs text-muted-foreground font-normal">APY</span>
                    </div>
                    <p className="text-xs text-primary mt-2 inline-flex items-center gap-1">
                      View details <ArrowRight className="w-3 h-3" />
                    </p>
                  </div>
                </Link>
              );
            })}
        </div>
      </section>

      <section className="glass-card p-5 border-dashed border-border/80">
        <h4 className="font-display font-semibold text-sm mb-2">Roadmap (not live yet)</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Auto-Wealth target allocation, strategy marketplace for external builders, proof-of-reserve oracles, and social
          leaderboards require additional contracts and indexing. See{" "}
          <Link to="/reserves" className="text-primary hover:underline">
            Real asset reserves
          </Link>{" "}
          for on-file disclosures.
        </p>
      </section>
    </div>
  );
};
