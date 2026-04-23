import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useBlock } from "wagmi";
import { Activity, Database, ExternalLink, Zap } from "lucide-react";
import { explorerBlockUrl } from "@/lib/api";
import {
  useChainConfig,
  useConnectedPortfolio,
  useProposals,
  useProtocolPulse,
  useTreasury,
} from "@/hooks/useChainData";
import { buildClientProtocolPulse } from "@/lib/protocolPulseClient";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProtocolPulseDto } from "@/lib/api";

const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function relAge(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 2) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function PulseHelp() {
  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-200/90 px-4 py-3 text-sm space-y-2">
      <div className="font-medium text-foreground">Protocol snapshot could not load</div>
      <p className="text-xs text-muted-foreground">
        Start the API (<code className="text-foreground/90">npm run dev</code>) and set Base RPC in <code className="text-foreground/90">.env</code>
        (e.g. <code className="text-foreground/90">ALCHEMY_API_KEY</code>). If the portfolio already loads, wait for the client bridge.
      </p>
    </div>
  );
}

type PulseVariant = "default" | "supporting";

/**
 * Single "protocol truth" surface: TVL, treasury, participants, chain freshness.
 * (Former Protocol Pulse + platform strip — one home per metric, no duplicate APY.)
 * `supporting` = nested under Protocol Core Frame; lighter visual weight than the vault.
 */
export function ProtocolPulseBeacon({ variant = "default" }: { variant?: PulseVariant }) {
  const pulseQ = useProtocolPulse();
  const portQ = useConnectedPortfolio();
  const treasQ = useTreasury();
  const propQ = useProposals();
  const chainQ = useChainConfig();
  const chainId = portQ.data?.chainId ?? chainQ.data?.chainId;
  const { data: latestBlock } = useBlock({
    blockTag: "latest",
    chainId,
    query: { enabled: chainId != null, refetchInterval: 12_000 },
  });
  const [ageTick, setAgeTick] = useState(0);

  const displayData: ProtocolPulseDto | undefined = useMemo(() => {
    if (pulseQ.data) return pulseQ.data;
    if (pulseQ.isError && portQ.data) {
      return buildClientProtocolPulse({
        portfolio: portQ.data,
        treasury: treasQ.data,
        proposals: propQ.data ?? [],
        block: latestBlock ?? null,
        chainNameFromConfig: chainQ.data?.chainName,
      });
    }
    return undefined;
  }, [pulseQ.data, pulseQ.isError, portQ.data, treasQ.data, propQ.data, latestBlock, chainQ.data?.chainName]);

  const isClientFallback = displayData?.source === "client";
  const isBusy = !displayData && (pulseQ.isLoading || (pulseQ.isError && (portQ.isLoading || !portQ.isFetched)));
  const members = treasQ.data?.totalMembers ?? 0;
  const membersDisplay = members > 0 ? members.toLocaleString() : "—";

  useEffect(() => {
    const id = setInterval(() => setAgeTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const dataAge = !pulseQ.dataUpdatedAt ? "—" : relAge(Date.now() - pulseQ.dataUpdatedAt);
  const isSupporting = variant === "supporting";

  if (isBusy) {
    return (
      <div
        className={cn(
          "border border-border/50 bg-secondary/20 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2",
          isSupporting ? "rounded-none border-x-0 border-b-0" : "rounded-2xl",
        )}
      >
        <Activity className="w-4 h-4 animate-spin" /> Loading protocol snapshot…
      </div>
    );
  }

  if (pulseQ.isError && !displayData) {
    return <PulseHelp />;
  }
  if (!displayData) {
    return <PulseHelp />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      data-refresh-tick={ageTick}
      className={cn(
        "relative overflow-hidden border border-border/60 bg-secondary/10",
        isSupporting
          ? "rounded-none border-x-0 border-b-0 border-t"
          : "rounded-2xl bg-secondary/15",
      )}
    >
      {isClientFallback && (
        <div className="px-3 py-1.5 text-[10px] sm:text-xs border-b border-amber-500/15 bg-amber-500/5 text-muted-foreground">
          API pulse unavailable — using wallet + portfolio bundle for the same on-chain readout.
        </div>
      )}
      <div className={cn(isSupporting ? "p-3 sm:p-4 space-y-3" : "p-4 sm:p-5 space-y-4")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              className={cn(
                "text-[10px] uppercase tracking-wider text-muted-foreground",
                isSupporting && "text-muted-foreground/90",
              )}
            >
              Supporting
            </p>
            <h2
              className={cn(
                "font-display font-semibold text-foreground",
                isSupporting ? "text-sm sm:text-base mt-0.5" : "text-base sm:text-lg",
              )}
            >
              Protocol snapshot
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Live protocol status</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "shrink-0 text-[10px] border-border/50",
              (pulseQ.isFetching || pulseQ.isLoading) && !isClientFallback && "animate-pulse",
            )}
          >
            {isClientFallback ? "Client" : "API"} · {isClientFallback ? "live" : dataAge}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <SnapshotCell label="TVL" value={fmtMoney(displayData.vaultTvl)} sub={displayData.chainName} />
          <SnapshotCell
            label="DAO treasury"
            value={fmtMoney(displayData.daoTreasury)}
            sub="On-chain"
          />
          <SnapshotCell label="Active investors" value={membersDisplay} sub={members === 0 ? "Index when set" : "API count"} />
          <div className="rounded-xl border border-border/50 bg-background/30 p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground mb-0.5">
              <Database className="w-3 h-3" />
              Block
            </div>
            <div className="font-mono-num text-sm sm:text-base font-medium">
              {Number(displayData.blockNumber) > 0
                ? Number(displayData.blockNumber).toLocaleString()
                : isClientFallback
                  ? "—"
                  : "0"}
            </div>
            {Number(displayData.blockNumber) > 0 && (
              <Button variant="link" className="h-auto p-0 text-[11px] text-primary mt-0.5" asChild>
                <a
                  href={explorerBlockUrl(displayData.chainId, displayData.blockNumber)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5"
                >
                  BaseScan <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
          </div>
          <div className="rounded-xl border border-border/50 bg-background/30 p-3 col-span-2 sm:col-span-1 lg:col-span-1">
            <div className="flex items-center gap-1.5 text-[10px] uppercase text-muted-foreground mb-0.5">
              <Zap className="w-3 h-3" />
              {isClientFallback ? "Read path" : "RPC round-trip"}
            </div>
            <div className="font-mono-num text-sm sm:text-base">
              {isClientFallback && displayData.rpcLatencyMs === 0 ? "—" : `${displayData.rpcLatencyMs}ms`}
            </div>
            {displayData.activeProposals >= 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{displayData.activeProposals} open votes</p>
            )}
          </div>
        </div>

        <p className="text-[10px] sm:text-[11px] text-muted-foreground/90 leading-relaxed border-t border-border/40 pt-3">
          <span className="text-foreground/80">All data sourced on-chain</span>
          <span className="mx-1.5">·</span>
          <span>Verify via BaseScan</span>
          <span className="mx-1.5">·</span>
          <span>No off-chain assumptions in the metrics shown here</span>
        </p>
      </div>
    </motion.div>
  );
}

function SnapshotCell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-background/30 p-3">
      <div className="text-[10px] uppercase text-muted-foreground mb-0.5">{label}</div>
      <div className="font-mono-num text-sm sm:text-base font-medium">{value}</div>
      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{sub}</p>
    </div>
  );
}
