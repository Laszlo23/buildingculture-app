import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useBlock } from "wagmi";
import type { Abi } from "viem";
import { ArrowRight, Landmark, Loader2, ShoppingCart } from "lucide-react";
import { base, baseSepolia } from "wagmi/chains";
import { useReadContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import curveAbiJson from "@/contracts/abis/VillaPocBondingCurve.json";
import {
  useChainConfig,
  useConnectedPortfolio,
  useProtocolPulse,
  useProposals,
  useTreasury,
} from "@/hooks/useChainData";
import { useVillaPocBondingAddresses } from "@/hooks/useVillaPocBondingAddresses";
import { buildClientProtocolPulse } from "@/lib/protocolPulseClient";
import { cn } from "@/lib/utils";

const curveAbi = curveAbiJson as Abi;

const fmtUsd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function trimPrice(n: number) {
  if (!Number.isFinite(n)) return "—";
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

/**
 * Live SavingsVault TVL (via protocol pulse / portfolio API) and Villa POC marginal price (on-chain when configured).
 */
export default function VaultWidget({ className }: { className?: string }) {
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

  const displayPulse = useMemo(() => {
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

  const vaultTvl = displayPulse?.vaultTvl ?? portQ.data?.vaultTotalAssets;
  const tvlBusy =
    vaultTvl == null &&
    (pulseQ.isLoading || (pulseQ.isError && (portQ.isLoading || !portQ.isFetched)));

  const { curveAddress: curveAddr, chainId: bondingChainId } = useVillaPocBondingAddresses();
  const expectedChainId = Number(
    bondingChainId ?? import.meta.env.VITE_CHAIN_ID ?? 8453,
  ) as typeof base.id | typeof baseSepolia.id;

  const { data: totalSupply } = useReadContract({
    address: curveAddr,
    abi: curveAbi,
    functionName: "totalSupply",
    chainId: expectedChainId,
    query: { enabled: !!curveAddr, refetchInterval: 30_000 },
  });

  const { data: marginal } = useReadContract({
    address: curveAddr,
    abi: curveAbi,
    functionName: "marginalPriceMicro",
    args: [totalSupply ?? 0n],
    chainId: expectedChainId,
    query: { enabled: !!curveAddr, refetchInterval: 30_000 },
  });

  const priceUsdcPerToken =
    marginal != null && typeof marginal === "bigint" ? Number(marginal) / 1e6 : null;

  return (
    <Card className={cn("rounded-2xl border-border/60 bg-card/80 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
            <Landmark className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold tracking-tight">Villa POC</CardTitle>
            <p className="text-[11px] text-muted-foreground mt-0.5 font-normal leading-snug">
              Live vault TVL and bonding-curve marginal price (curve from <code className="text-[10px]">/api/config</code>
              {" "}first, then VITE fallbacks).
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 sm:px-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/50 bg-secondary/20 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">Vault TVL</p>
            <div className="mt-1 flex items-center gap-2 text-lg font-semibold tabular-nums">
              {tvlBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" aria-hidden />
                  <span className="text-muted-foreground text-sm">Loading…</span>
                </>
              ) : vaultTvl != null && Number.isFinite(vaultTvl) ? (
                fmtUsd(vaultTvl)
              ) : (
                "—"
              )}
            </div>
          </div>
          <div className="rounded-xl border border-border/50 bg-secondary/20 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
              Marginal price (vPOC)
            </p>
            <div className="mt-1 text-lg font-semibold tabular-nums">
              {!curveAddr ? (
                <span className="text-sm font-normal text-muted-foreground">Curve not configured</span>
              ) : priceUsdcPerToken != null ? (
                <span>
                  {trimPrice(priceUsdcPerToken)} <span className="text-sm font-normal text-muted-foreground">USDC / vEBR</span>
                </span>
              ) : (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground inline" aria-hidden />
              )}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          TVL from protocol pulse when the API is up; otherwise your wallet RPC plus portfolio API. Curve reads use{" "}
          <code className="text-[10px] text-foreground/80">marginalPriceMicro</code> at current supply — POC only; not investment advice.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Button size="sm" className="w-full sm:flex-1 rounded-xl gap-1.5" asChild>
            <Link to="/villa">
              <ShoppingCart className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Buy fractional ownership
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto rounded-xl" asChild>
            <Link to="/villa">
              Reserves &amp; curve details <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
