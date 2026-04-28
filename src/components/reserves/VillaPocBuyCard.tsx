import { useCallback, useMemo, useState } from "react";
import { parseUnits, formatUnits, maxUint256 } from "viem";
import type { Abi } from "viem";
import { readContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import { base, baseSepolia } from "wagmi/chains";
import {
  useChainId,
  useConnection,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { ArrowUpRight, ExternalLink, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BASE_MAINNET_USDC } from "@/contracts/addresses";
import { useVillaPocBondingAddresses } from "@/hooks/useVillaPocBondingAddresses";
import curveAbiJson from "@/contracts/abis/VillaPocBondingCurve.json";
import { erc20MinimalAbi } from "@/lib/erc20MinimalAbi";
import { explorerAddressUrl } from "@/lib/api";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { cn } from "@/lib/utils";

const curveAbi = curveAbiJson as Abi;

const ACCENT = "hsl(172 72% 48%)";

function trimDisplay(n: string, maxFrac = 6) {
  const [a, b = ""] = n.split(".");
  if (!b) return a;
  const t = b.slice(0, maxFrac).replace(/0+$/, "");
  return t.length ? `${a}.${t}` : a;
}

function TokenPill({ symbol, className }: { symbol: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1.5 pr-3 py-1 shrink-0",
        className,
      )}
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/40 to-cyan-500/30 flex items-center justify-center text-[10px] font-bold text-white/95 ring-1 ring-white/10">
        {symbol.slice(0, 2).toUpperCase()}
      </div>
      <span className="text-sm font-semibold tracking-tight text-foreground/95">{symbol}</span>
    </div>
  );
}

export function VillaPocBuyCard() {
  const { curveAddress: curveAddr, usdcAddressHint, chainId: bondingChainId } =
    useVillaPocBondingAddresses();
  const expectedChainId = Number(
    bondingChainId ?? import.meta.env.VITE_CHAIN_ID ?? 8453,
  ) as typeof base.id | typeof baseSepolia.id;
  const targetChain = expectedChainId === baseSepolia.id ? baseSepolia : base;

  const { address, status } = useConnection();
  const chainId = useChainId();
  const { switchChainAsync, isPending: switching } = useSwitchChain();
  const publicClient = usePublicClient({ chainId: expectedChainId });
  const { data: walletClient } = useWalletClient({ chainId: expectedChainId });

  const [mode, setMode] = useState<"buy" | "sell">("buy");
  const [usdcInput, setUsdcInput] = useState("10");
  const [pending, setPending] = useState<"approve" | "buy" | null>(null);

  const { data: usdcAddr_ } = useReadContract({
    address: curveAddr,
    abi: curveAbi,
    functionName: "usdc",
    chainId: expectedChainId,
    query: { enabled: !!curveAddr },
  });
  const usdcAddr =
    (usdcAddr_ as `0x${string}` | undefined) ??
    usdcAddressHint ??
    (expectedChainId === base.id ? BASE_MAINNET_USDC : undefined);

  const budgetMicro = useMemo(() => {
    try {
      return parseUnits(usdcInput || "0", 6);
    } catch {
      return 0n;
    }
  }, [usdcInput]);

  const { data: preview } = useReadContract({
    address: curveAddr,
    abi: curveAbi,
    functionName: "previewBuy",
    args: [budgetMicro],
    chainId: expectedChainId,
    query: { enabled: !!curveAddr && budgetMicro > 0n },
  });

  const { data: paused } = useReadContract({
    address: curveAddr,
    abi: curveAbi,
    functionName: "paused",
    chainId: expectedChainId,
    query: { enabled: !!curveAddr },
  });

  const { data: totalSupply } = useReadContract({
    address: curveAddr,
    abi: curveAbi,
    functionName: "totalSupply",
    chainId: expectedChainId,
    query: { enabled: !!curveAddr },
  });

  const { data: marginal } = useReadContract({
    address: curveAddr,
    abi: curveAbi,
    functionName: "marginalPriceMicro",
    args: [totalSupply ?? 0n],
    chainId: expectedChainId,
    query: { enabled: !!curveAddr },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: usdcAddr,
    abi: erc20MinimalAbi,
    functionName: "allowance",
    args: address && curveAddr ? [address as `0x${string}`, curveAddr] : undefined,
    chainId: expectedChainId,
    query: { enabled: !!curveAddr && !!usdcAddr && !!address },
  });

  const { data: usdcBalance } = useReadContract({
    address: usdcAddr,
    abi: erc20MinimalAbi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    chainId: expectedChainId,
    query: { enabled: !!curveAddr && !!usdcAddr && !!address },
  });

  const { data: vebrBalance } = useReadContract({
    address: curveAddr,
    abi: erc20MinimalAbi,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    chainId: expectedChainId,
    query: { enabled: !!curveAddr && !!address },
  });

  const tokensOut = preview?.[0] ?? 0n;
  const usdcNeeded = preview?.[1] ?? 0n;
  /** Treat loading allowance as 0 so we do not skip Approve when React Query has not resolved yet. */
  const needApprove = budgetMicro > 0n && (allowance ?? 0n) < budgetMicro;

  const usdcBalDisplay =
    usdcBalance != null ? trimDisplay(formatUnits(usdcBalance as bigint, 6), 4) : "0";
  const vebrBalDisplay = vebrBalance != null ? trimDisplay(formatUnits(vebrBalance as bigint, 18), 4) : "0";
  const receiveDisplay =
    budgetMicro > 0n && tokensOut > 0n ? trimDisplay(formatUnits(tokensOut, 18), 6) : budgetMicro > 0n ? "…" : "0";

  const bridgeUrl = "https://bridge.base.org/deposit";
  const getUsdcUrl =
    expectedChainId === base.id
      ? "https://app.uniswap.org/swap?chain=base&outputCurrency=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
      : "https://docs.base.org/docs/tools/network-faucets/";

  const onSwitch = useCallback(async () => {
    try {
      await switchChainAsync?.({ chainId: expectedChainId });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not switch network");
    }
  }, [expectedChainId, switchChainAsync]);

  const onApprove = useCallback(async () => {
    if (!walletClient || !address || !curveAddr || !usdcAddr) {
      if (!walletClient) toast.error("Wallet not ready — try again in a moment.");
      return;
    }
    setPending("approve");
    try {
      const hash = await writeContract(walletClient, {
        address: usdcAddr,
        abi: erc20MinimalAbi,
        functionName: "approve",
        args: [curveAddr, maxUint256],
        chain: targetChain,
        account: address as `0x${string}`,
      });
      if (publicClient) await waitForTransactionReceipt(publicClient, { hash });
      await refetchAllowance();
      toast.success("USDC allowance set");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed");
    } finally {
      setPending(null);
    }
  }, [address, curveAddr, publicClient, refetchAllowance, targetChain, usdcAddr, walletClient]);

  const onBuy = useCallback(async () => {
    if (!walletClient || !address || !curveAddr || budgetMicro <= 0n) {
      if (!walletClient) toast.error("Wallet not ready — try again in a moment.");
      return;
    }
    setPending("buy");
    try {
      let allow = allowance ?? 0n;
      if (publicClient && usdcAddr) {
        try {
          allow = await readContract(publicClient, {
            address: usdcAddr,
            abi: erc20MinimalAbi,
            functionName: "allowance",
            args: [address as `0x${string}`, curveAddr],
          });
        } catch {
          /* use allowance from hook */
        }
      }
      if (allow < budgetMicro) {
        toast.error("Approve USDC for the curve first, then buy.");
        setPending(null);
        return;
      }
      const hash = await writeContract(walletClient, {
        address: curveAddr,
        abi: curveAbi,
        functionName: "buy",
        args: [budgetMicro],
        chain: targetChain,
        account: address as `0x${string}`,
      });
      if (publicClient) await waitForTransactionReceipt(publicClient, { hash });
      toast.success("Purchase confirmed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Buy failed");
    } finally {
      setPending(null);
    }
  }, [address, allowance, budgetMicro, curveAddr, publicClient, targetChain, usdcAddr, walletClient]);

  if (!curveAddr) return null;

  const scanUrl = explorerAddressUrl(expectedChainId, curveAddr);
  const wrongChain = chainId !== expectedChainId;
  const buyDisabled =
    pending !== null || budgetMicro <= 0n || !!paused || wrongChain || status !== "connected" || mode !== "buy";

  return (
    <div
      className="rounded-2xl p-[1px] shadow-lg max-w-md"
      style={{
        background: `linear-gradient(135deg, ${ACCENT}55, hsl(var(--primary) / 0.25), transparent)`,
      }}
    >
      <div className="rounded-2xl bg-[hsl(222_42%_7%)] border border-white/[0.06] overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
          <div className="inline-flex rounded-full bg-black/30 p-0.5 ring-1 ring-white/[0.08]">
            <button
              type="button"
              onClick={() => setMode("buy")}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-full transition-all",
                mode === "buy"
                  ? "bg-[hsl(172_72%_42%)] text-black shadow-[0_0_20px_hsl(172_72%_42%/0.35)]"
                  : "text-muted-foreground hover:text-foreground/80",
              )}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setMode("sell")}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-full transition-all text-muted-foreground",
                mode === "sell" ? "bg-white/10 text-foreground" : "hover:text-foreground/80",
              )}
            >
              Sell
            </button>
          </div>
          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground shrink-0" asChild>
            <a href={scanUrl} target="_blank" rel="noreferrer" title="Contract on explorer">
              <Settings2 className="h-4 w-4" />
              <span className="sr-only">Contract settings / explorer</span>
            </a>
          </Button>
        </div>

        <div className="px-4 space-y-5 pb-2">
          {mode === "sell" ? (
            <p className="text-sm text-muted-foreground py-6 text-center leading-relaxed">
              Sell / redeem is not available on this POC contract. You can only acquire vEBR via{" "}
              <span className="text-foreground/90 font-medium">Buy</span>.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex justify-between items-baseline gap-2 text-[11px] text-muted-foreground uppercase tracking-wide">
                  <span>Amount to receive (est.)</span>
                  <span>
                    Balance: <span className="text-foreground/90 font-mono-num">{vebrBalDisplay}</span> vEBR
                  </span>
                </div>
                <div className="flex items-end justify-between gap-3 border-b border-white/[0.08] pb-2 min-h-[3.25rem]">
                  <span className="text-[1.65rem] sm:text-3xl font-mono-num font-medium tracking-tight text-foreground tabular-nums leading-none">
                    {receiveDisplay}
                  </span>
                  <TokenPill symbol="vEBR" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline gap-2 text-[11px] text-muted-foreground uppercase tracking-wide">
                  <span>USDC to spend</span>
                  <span>
                    Balance:{" "}
                    <span className="text-[hsl(172_72%_55%)] font-mono-num font-medium">{usdcBalDisplay}</span> USDC
                  </span>
                </div>
                <div className="flex items-end justify-between gap-3 border-b border-white/[0.08] pb-2">
                  <input
                    id="villa-usdc-trade"
                    inputMode="decimal"
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent text-[1.65rem] sm:text-3xl font-mono-num font-medium tracking-tight text-foreground tabular-nums leading-none outline-none border-none focus:ring-0 placeholder:text-muted-foreground/40"
                    placeholder="0"
                    value={usdcInput}
                    onChange={e => setUsdcInput(e.target.value)}
                  />
                  <TokenPill symbol="USDC" />
                </div>
                {budgetMicro > 0n && usdcNeeded > 0n ? (
                  <p className="text-[10px] text-muted-foreground">
                    Estimated charge ~{trimDisplay(formatUnits(usdcNeeded, 6), 6)} USDC (max budget {trimDisplay(formatUnits(budgetMicro, 6), 6)}).
                  </p>
                ) : null}
              </div>
            </>
          )}

          <div className="space-y-2 pt-1">
            <a
              href={bridgeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.08] py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Bridge to Base
              <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
            </a>
            <a
              href={getUsdcUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground hover:text-[hsl(172_72%_55%)] transition-colors"
            >
              Get USDC for this network
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>

          <p className="text-[10px] text-muted-foreground/90 leading-relaxed border-t border-white/[0.06] pt-3">
            Unaudited POC: USDC goes to the beneficiary; you receive vEBR. Marginal price now ~{marginal != null ? String(marginal) : "—"} micro-USDC per full token. Not investment advice.
          </p>

          {paused ? (
            <p className="text-xs text-amber-400 text-center">Purchases are paused by the contract owner.</p>
          ) : null}

          <div className="flex flex-col gap-2 pb-4">
            {status !== "connected" ? (
              <div className="flex justify-center pt-1">
                <WalletConnectButton />
              </div>
            ) : wrongChain ? (
              <Button
                type="button"
                className="w-full rounded-xl h-11 font-semibold bg-white/10 hover:bg-white/15"
                disabled={switching}
                onClick={() => void onSwitch()}
              >
                {switching ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Switch to ${targetChain.name}`}
              </Button>
            ) : mode === "buy" ? (
              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                {needApprove ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="rounded-xl h-11 font-semibold order-2 sm:order-1 bg-white/10 border-white/10 text-foreground hover:bg-white/15"
                    disabled={pending !== null || budgetMicro <= 0n}
                    onClick={() => void onApprove()}
                  >
                    {pending === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Approve USDC
                  </Button>
                ) : null}
                <Button
                  type="button"
                  disabled={buyDisabled || needApprove}
                  className={cn(
                    "rounded-xl h-11 min-w-[7.5rem] font-semibold order-1 sm:order-2 shadow-md",
                    buyDisabled || needApprove
                      ? "bg-white/10 text-muted-foreground cursor-not-allowed"
                      : "bg-[hsl(172_72%_42%)] text-black hover:bg-[hsl(172_72%_48%)] hover:text-black shadow-[0_0_24px_hsl(172_72%_42%/0.25)]",
                  )}
                  onClick={() => void onBuy()}
                >
                  {pending === "buy" ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Buy
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
