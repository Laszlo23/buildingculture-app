import { useCallback, useMemo, useState } from "react";
import { parseUnits } from "viem";
import { waitForTransactionReceipt, writeContract } from "viem/actions";
import { base, baseSepolia } from "wagmi/chains";
import {
  useChainId,
  useConnection,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { HandCoins, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BASE_MAINNET_USDC } from "@/contracts/addresses";
import { erc20MinimalAbi } from "@/lib/erc20MinimalAbi";
import { useChainConfig } from "@/hooks/useChainData";
import { cn } from "@/lib/utils";

/** Club micro-financing / GM tip — USDC on Base (user pays gas in ETH). */
const GM_RECIPIENT = "0xd13e1cD3f0d2e83494EeAb8130EfD671C368FD22" as const;
const GM_USDC_AMOUNT = parseUnits("1.11", 6);

function targetChainIdFromEnv(): number {
  const n = Number(import.meta.env.VITE_CHAIN_ID);
  return n === 84532 ? baseSepolia.id : base.id;
}

export function GmMicroFinancingFab() {
  const { address, status } = useConnection();
  const chainId = useChainId();
  const { data: cfg } = useChainConfig();
  const { switchChainAsync, isPending: switching } = useSwitchChain();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const expectedChainId = targetChainIdFromEnv();
  const targetChain = expectedChainId === baseSepolia.id ? baseSepolia : base;
  const publicClient = usePublicClient({ chainId: expectedChainId });
  const { data: walletClient } = useWalletClient({ chainId: expectedChainId });

  const usdcAddress = useMemo(() => {
    const fromApi = cfg?.contracts?.assetToken?.trim();
    if (fromApi && /^0x[a-fA-F0-9]{40}$/i.test(fromApi) && fromApi !== "0x0000000000000000000000000000000000000000") {
      return fromApi as `0x${string}`;
    }
    if (expectedChainId === base.id) return BASE_MAINNET_USDC;
    return undefined;
  }, [cfg?.contracts?.assetToken, expectedChainId]);

  const { data: balance = 0n } = useReadContract({
    address: usdcAddress,
    abi: erc20MinimalAbi,
    functionName: "balanceOf",
    args: address && usdcAddress ? [address] : undefined,
    chainId: expectedChainId,
    query: { enabled: Boolean(address && usdcAddress) },
  });

  const sendGm = useCallback(async () => {
    if (!address || !usdcAddress || !walletClient || !publicClient) {
      toast.error("Connect a wallet and ensure USDC is configured for this network.");
      return;
    }
    if (chainId !== expectedChainId) {
      try {
        await switchChainAsync({ chainId: expectedChainId });
      } catch {
        toast.error(`Switch to ${targetChain.name} first.`);
        return;
      }
    }
    if (balance < GM_USDC_AMOUNT) {
      toast.error("You need at least 1.11 USDC on this network.");
      return;
    }
    setPending(true);
    try {
      const hash = await writeContract(walletClient, {
        address: usdcAddress,
        abi: erc20MinimalAbi,
        functionName: "transfer",
        args: [GM_RECIPIENT, GM_USDC_AMOUNT],
        chain: targetChain,
        account: address as `0x${string}`,
      });
      const receipt = await waitForTransactionReceipt(publicClient, { hash });
      if (receipt.status !== "success") throw new Error("Transfer failed");
      toast.success("GM — 1.11 USDC sent. Thank you for micro-financing the club.");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setPending(false);
    }
  }, [
    address,
    balance,
    chainId,
    expectedChainId,
    publicClient,
    switchChainAsync,
    targetChain,
    usdcAddress,
    walletClient,
  ]);

  const busy = pending || switching;

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-2 pointer-events-none">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            size="lg"
            className={cn(
              "pointer-events-auto h-14 w-14 rounded-full p-0 shadow-elevated",
              "bg-gradient-to-br from-primary via-emerald-500 to-cyan-600 text-primary-foreground border border-white/15",
              "hover:opacity-95 hover:scale-[1.03] active:scale-[0.98] transition-transform motion-reduce:transition-none",
              "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
            )}
            aria-label="Open GM micro financing — send 1.11 USDC"
          >
            <span className="relative flex items-center justify-center">
              <Sparkles className="w-5 h-5 absolute opacity-60 motion-safe:animate-pulse" aria-hidden />
              <span className="font-display text-sm font-bold tracking-tight">GM</span>
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md border-border/80 bg-card/95 backdrop-blur-xl">
          <SheetHeader>
            <SheetTitle className="font-display flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-primary" />
              GM micro financing
            </SheetTitle>
            <SheetDescription className="text-left leading-relaxed">
              Send <span className="font-mono-num text-foreground">1.11 USDC</span> on{" "}
              <span className="text-foreground">{targetChain.name}</span> to support club operations. You pay network
              fees (ETH) separately; the tip is USDC only.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 text-sm">
            <div className="rounded-xl border border-border/60 bg-secondary/30 px-3 py-2 font-mono-num text-xs break-all text-muted-foreground">
              Recipient: {GM_RECIPIENT}
            </div>
            {!usdcAddress ? (
              <p className="text-amber-200/90 text-xs">
                USDC address is not configured for this network. Set <code className="text-xs">ASSET_TOKEN</code> in
                server env so <code className="text-xs">/api/config</code> returns it, or use Base mainnet.
              </p>
            ) : null}
            {status !== "connected" ? (
              <p className="text-muted-foreground">Connect your wallet to continue.</p>
            ) : (
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Amount is fixed at 1.11 USDC (non-custodial transfer from your wallet).</li>
                <li>No approval step — standard ERC-20 transfer.</li>
              </ul>
            )}
            <Button
              type="button"
              className="w-full rounded-xl gap-2 bg-gradient-primary text-primary-foreground"
              disabled={status !== "connected" || !usdcAddress || busy}
              onClick={() => void sendGm()}
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Send 1.11 USDC
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
