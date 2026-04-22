import { useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useConnection } from "wagmi";
import { ArrowRight, Vote, ChevronRight, Loader2 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { LevelProgress } from "@/components/LevelProgress";
import { TransactionConfirmDialog } from "@/components/TransactionConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VaultBeginnerOnboarding } from "@/components/dashboard/VaultBeginnerOnboarding";
import { StrategyPerformanceTable } from "@/components/dashboard/StrategyPerformanceTable";
import { ContractAddressesBlock } from "@/components/dashboard/ContractAddressesBlock";
import { VerifyOnChainStrip } from "@/components/dashboard/VerifyOnChainStrip";
import { VaultHeroPanel } from "@/components/dashboard/VaultHeroPanel";
import { SecurityTrustCard } from "@/components/dashboard/SecurityTrustCard";
import { InviteEarnCard } from "@/components/dashboard/InviteEarnCard";
import { ProtocolCoreFrame } from "@/components/dashboard/ProtocolCoreFrame";
import { ClubMemberPulse } from "@/components/dashboard/ClubMemberPulse";
import { ProtocolPulseBeacon } from "@/components/dashboard/ProtocolPulseBeacon";
import { strategies as staticStrategies, userStats, growthData as fallbackGrowth } from "@/data/club";
import {
  mergeStrategiesForUi,
  qk,
  useChainConfig,
  useClaimYieldMutation,
  usePortfolio,
  useProposals,
  useTreasury,
} from "@/hooks/useChainData";
import { useRecordReferral } from "@/hooks/useReferral";
import { riskScoreToOutOf10 } from "@/lib/riskDisplay";
import { chainApi } from "@/lib/api";
import { toast } from "sonner";
import { getLeadReserveImagePath, publicAssetSrc } from "@/data/realAssets";

const COLOR_HSL = {
  primary: "hsl(152 76% 50%)",
  gold: "hsl(42 92% 60%)",
};

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function queryErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e ?? "Unknown error");
}

export const Dashboard = () => {
  const [claimOpen, setClaimOpen] = useState(false);
  const qc = useQueryClient();
  const { status, address } = useConnection();
  const recordReferral = useRecordReferral();
  const didAttemptReferral = useRef(false);
  const didWealthSnapshotForDao = useRef(false);
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

  const growthData = useMemo(() => {
    const total = portfolio?.totalSavings;
    if (total == null || total <= 0) return fallbackGrowth;
    const base = Math.max(total * 0.72, 1000);
    return Array.from({ length: 12 }, (_, i) => {
      const growth = base * Math.pow(1.018, i) + Math.sin(i / 2) * 400;
      const yieldVal = growth - base + total * 0.12;
      return { month: months[i], savings: Math.round(growth), yield: Math.round(yieldVal) };
    });
  }, [portfolio?.totalSavings]);

  const savings = portfolio?.totalSavings ?? 0;
  const yieldEarned = portfolio?.yieldEarned ?? 0;
  const blendedApy = portfolio?.blendedApy ?? 0;
  const displayApy = useMemo(() => {
    if (blendedApy > 0.01) return blendedApy;
    if (!mergedStrategies.length) return 0;
    return mergedStrategies.reduce((acc, s) => acc + (s.allocation * s.apy) / 100, 0);
  }, [blendedApy, mergedStrategies]);

  const estYearlyYield = useMemo(
    () => (savings > 0 && displayApy > 0 ? (savings * displayApy) / 100 : 0),
    [savings, displayApy],
  );

  useEffect(() => {
    if (!address) return;
    if (didAttemptReferral.current) return;
    let inv: string | null = null;
    try {
      inv = localStorage.getItem("osc_inviter");
    } catch {
      return;
    }
    if (!inv || !/^0x[a-fA-F0-9]{40}$/i.test(inv)) return;
    if (inv.toLowerCase() === address.toLowerCase()) {
      try {
        localStorage.removeItem("osc_inviter");
      } catch {
        /* ignore */
      }
      return;
    }
    const doneKey = `osc_referral_recorded_${address.toLowerCase()}`;
    if (sessionStorage.getItem(doneKey)) {
      didAttemptReferral.current = true;
      return;
    }
    didAttemptReferral.current = true;
    recordReferral.mutate(
      { inviter: inv as `0x${string}`, invitee: address },
      {
        onSettled: () => {
          try {
            sessionStorage.setItem(doneKey, "1");
          } catch {
            /* ignore */
          }
          try {
            localStorage.removeItem("osc_inviter");
          } catch {
            /* ignore */
          }
        },
      },
    );
  }, [address, recordReferral]);

  /** One snapshot per session so investors can receive optional DAO voting-power rewards (server-gated). */
  useEffect(() => {
    if (!address || didWealthSnapshotForDao.current) return;
    const k = `osc_wealth_snap_${address.toLowerCase()}`;
    if (sessionStorage.getItem(k)) {
      didWealthSnapshotForDao.current = true;
      return;
    }
    didWealthSnapshotForDao.current = true;
    void chainApi
      .postWealthSnapshot({ address })
      .then((r) => {
        try {
          sessionStorage.setItem(k, "1");
        } catch {
          /* ignore */
        }
        if (r.daoVotingReward?.status === "granted") {
          toast.success("DAO voting power updated", {
            description: "Member reward recorded on-chain.",
          });
          void qc.invalidateQueries({ queryKey: qk.portfolio });
        }
      })
      .catch(() => {
        didWealthSnapshotForDao.current = false;
      });
  }, [address, qc]);

  const activeProposals = (proposalsList ?? []).filter(p => p.status === "active");
  const displayProposals = activeProposals.slice(0, 3);
  const voteParticipationIndex =
    proposalsList?.reduce((acc, p) => acc + p.forVotes + p.againstVotes + p.abstainVotes, 0) ?? 0;

  const walletConnected = status === "connected";

  const chainId = chainConfig?.chainId ?? portfolio?.chainId ?? 8453;
  const leadReserveImagePath = useMemo(() => getLeadReserveImagePath(), []);
  const contractEntries = [
    { label: "Vault", address: chainConfig?.contracts?.vault },
    { label: "Treasury", address: chainConfig?.contracts?.treasury },
    { label: "DAO", address: chainConfig?.contracts?.dao },
    { label: "Strategy registry", address: chainConfig?.contracts?.strategyRegistry },
  ];

  return (
    <div className="space-y-5 sm:space-y-6">
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

      <h2 className="sr-only">Your vault and protocol</h2>
      <VaultBeginnerOnboarding
        walletConnected={walletConnected}
        savings={savings}
        portfolioLoading={portfolioLoading}
      />
      <ProtocolCoreFrame>
        <VaultHeroPanel
          embeddedInFrame
          vaultBalance={savings}
          yieldEarned={yieldEarned}
          blendedApy={displayApy}
          estYearlyYield={estYearlyYield}
          portfolioLoading={portfolioLoading}
          onClaimYield={() => setClaimOpen(true)}
          claimPending={claimMut.isPending}
        />
        <ClubMemberPulse
          totalMembers={treasury?.totalMembers}
          strategyCount={mergedStrategies.length}
          loading={treasuryLoading}
        />
        <ProtocolPulseBeacon variant="supporting" />
      </ProtocolCoreFrame>

      {portfolioError && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive space-y-1">
          <p>
            Could not load on-chain portfolio. Run the API, set <code className="text-xs">VITE_API_URL</code> if needed, and configure RPC + contracts in
            <code className="text-xs"> .env</code>.
          </p>
          {portfolioQueryError != null && (
            <p className="font-mono text-xs opacity-90 break-all" title={queryErrorMessage(portfolioQueryError)}>
              {queryErrorMessage(portfolioQueryError)}
            </p>
          )}
        </div>
      )}

      <div
        className="space-y-4 pt-1 border-t border-border/30"
        aria-label="Community and allocation tools"
      >
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/80 px-0.5 -mb-1">Beyond the core</p>
      <InviteEarnCard />

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="relative overflow-hidden rounded-2xl border border-border/35 bg-card/20"
      >
        {leadReserveImagePath && (
          <div className="flex flex-col sm:flex-row sm:items-stretch">
            <div className="relative sm:w-36 sm:shrink-0 h-32 sm:h-auto border-b sm:border-b-0 sm:border-r border-border/50">
              <img
                src={publicAssetSrc(leadReserveImagePath)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-90"
                width={288}
                height={200}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent sm:bg-gradient-to-r" />
            </div>
            <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-muted-foreground max-w-xl">
                Real-asset context and reference materials — not a recommendation to invest.
              </p>
              <Button variant="outline" size="sm" className="rounded-xl shrink-0" asChild>
                <Link to="/reserves" className="gap-1.5">
                  Reserves
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        )}
        {!leadReserveImagePath && (
          <div className="p-4 sm:p-5 flex justify-end">
            <Button variant="outline" size="sm" className="rounded-xl" asChild>
              <Link to="/reserves">Reserves</Link>
            </Button>
          </div>
        )}
      </motion.section>

      <section className="rounded-2xl border border-border/35 bg-card/15 p-5 sm:p-6" aria-label="Your trajectory">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-medium text-base text-foreground/90">Projected path</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Illustrative 12-month view (not a forecast)</p>
          </div>
        </div>
        <div className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_HSL.primary} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={COLOR_HSL.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gYield" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLOR_HSL.gold} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={COLOR_HSL.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
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
        <div className="flex items-center gap-5 mt-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" /> Savings
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold" /> Cumulative yield
          </span>
        </div>
      </section>

      <h2 className="sr-only">Strategies</h2>
      <StrategyPerformanceTable
        strategies={mergedStrategies.map(s => {
          const riskOutOf10 = riskScoreToOutOf10(s.riskScore);
          return {
            id: s.id,
            name: s.name,
            apy: s.apy,
            risk: s.risk,
            riskScore: s.riskScore,
            riskOutOf10,
            allocation: s.allocation,
            tvl: s.tvl,
          };
        })}
      />

      <h2 className="sr-only">Governance and progress</h2>
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 border-t border-border/25 pt-4">
        <LevelProgress current={userStats.level} xp={userStats.xp} xpToNext={userStats.xpToNext} />

        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-primary shrink-0" />
              <h3 className="font-display font-semibold text-base">Governance</h3>
            </div>
            <Button variant="ghost" size="sm" className="text-xs h-8" asChild>
              <Link to="/dao" className="gap-0.5">
                Open DAO <ArrowRight className="w-3 h-3" />
              </Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            {proposalsLoading
              ? "…"
              : `Treasury and TVL: use the protocol snapshot in the core block above. ${activeProposals.length} open ${activeProposals.length === 1 ? "proposal" : "proposals"} · ${fmt(voteParticipationIndex)} votes in this bundle (index).`}
          </p>
          <div className="space-y-2.5">
            {proposalsLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading…
              </div>
            )}
            {!proposalsLoading &&
              displayProposals.map(p => {
                const total = p.forVotes + p.againstVotes + p.abstainVotes || 1;
                const forPct = (p.forVotes / total) * 100;
                return (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-border/50 bg-secondary/20 hover:border-primary/25 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-[10px] text-muted-foreground">{p.id}</span>
                          <Badge variant="outline" className="text-[9px] py-0 border-border/50">
                            {p.category}
                          </Badge>
                        </div>
                        <h4 className="text-sm font-medium leading-snug">{p.title}</h4>
                      </div>
                      <div className="text-right shrink-0 text-[10px] text-muted-foreground">
                        Ends
                        <div className="text-xs font-mono-num text-foreground">{p.endsIn}</div>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-secondary/60 overflow-hidden flex">
                      <div className="h-full bg-success" style={{ width: `${forPct}%` }} />
                      <div className="h-full bg-destructive" style={{ width: `${(p.againstVotes / total) * 100}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] mt-1 text-muted-foreground">
                      <span className="text-success font-mono-num">{p.forVotes}% for</span>
                      <span className="text-destructive font-mono-num">{p.againstVotes}% against</span>
                    </div>
                  </div>
                );
              })}
            {!proposalsLoading && displayProposals.length === 0 && (
              <p className="text-sm text-muted-foreground py-2">No active proposals in this bundle.</p>
            )}
          </div>
        </div>
      </section>

      <h2 className="sr-only">Security and contracts</h2>
      <div className="space-y-3">
        <SecurityTrustCard
          chainId={chainId}
          vault={chainConfig?.contracts?.vault}
          treasury={chainConfig?.contracts?.treasury}
          strategyRegistry={chainConfig?.contracts?.strategyRegistry}
          dao={chainConfig?.contracts?.dao}
        />
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
            <Link to="/transparency">Full transparency</Link>
          </Button>
        </div>
        <ContractAddressesBlock chainId={chainId} entries={contractEntries} />
      </div>

      <section className="rounded-2xl border border-dashed border-border/50 bg-muted/5 p-4">
        <h4 className="font-medium text-xs text-muted-foreground mb-1">Upcoming (not live)</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Auto-allocations, external strategy marketplaces, and PoR oracles are roadmap items — see <Link to="/reserves" className="text-primary hover:underline">reserves</Link> for current disclosures.
        </p>
      </section>
      </div>
    </div>
  );
};
