import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Gem, Check, Sparkles, Vote, Coins, Lock, Loader2, ExternalLink } from "lucide-react";
import { formatEther } from "viem";
import { useChainId, useConnection, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LearningBadgesStrip } from "@/components/learning/LearningBadgesStrip";
import { VaultPatronClaim } from "@/components/learning/VaultPatronClaim";
import { learningNftPerks } from "@/data/nftPerks";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { clubCitizenPassAbi } from "@/contracts/abis";
import { useChainConfig } from "@/hooks/useChainData";
import { chainApi, explorerAddressUrl, explorerTxUrl } from "@/lib/api";
import { toast } from "sonner";

const ZERO = "0x0000000000000000000000000000000000000000";

const genesisTier = {
  name: "Genesis",
  price: "0.5 ETH",
  supply: "2,500 / 2,500",
  sold: true,
  color: "from-primary to-primary-glow",
  perks: [
    "Founding member status",
    "2.0x rewards multiplier",
    "Council voting seat",
    "Real-estate priority access",
    "Exclusive art drops",
  ],
} as const;

const visitorTier = {
  name: "Visitor",
  price: "Free",
  supply: "Open",
  sold: false,
  color: "from-muted-foreground to-foreground",
  perks: ["Read-only dashboard", "Beginner academy", "Community chat", "Limited deposit cap"],
} as const;

const qkMembershipSale = (addr?: string) => ["membership", "sale", addr ?? ""] as const;

export const MembershipPage = () => {
  const qc = useQueryClient();
  const { data: cfg } = useChainConfig();
  const { address, status } = useConnection();
  const walletChainId = useChainId();
  const { switchChain, isPending: switchPending } = useSwitchChain();
  const passAddrRaw = cfg?.contracts?.membershipNft?.trim();
  const passReady = Boolean(passAddrRaw && passAddrRaw.toLowerCase() !== ZERO);
  const passAddr = (passReady ? passAddrRaw : undefined) as `0x${string}` | undefined;
  const expectedChainId = cfg?.chainId;

  const { data: sale, isLoading: saleLoading } = useQuery({
    queryKey: qkMembershipSale(status === "connected" ? address : undefined),
    queryFn: () => chainApi.getMembershipSale(status === "connected" && address ? address : undefined),
    enabled: passReady,
  });

  const [mintHash, setMintHash] = useState<`0x${string}` | undefined>();
  const { writeContractAsync, isPending: writePending } = useWriteContract();
  const { isLoading: confirmPending, isSuccess: mintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash,
  });

  useEffect(() => {
    if (!mintSuccess || !mintHash || !expectedChainId) return;
    toast.success("Citizen pass minted", {
      action: {
        label: "BaseScan",
        onClick: () => window.open(explorerTxUrl(expectedChainId, mintHash), "_blank"),
      },
    });
    void qc.invalidateQueries({ queryKey: ["membership", "sale"] });
    setMintHash(undefined);
  }, [mintSuccess, mintHash, expectedChainId, qc]);

  const citizenMeta = useMemo(() => {
    if (!passReady || saleLoading || !sale) {
      return {
        priceLabel: "…",
        supplyLabel: "…",
        soldOut: false,
        hasPass: false,
      };
    }
    if (!sale.configured) {
      return {
        priceLabel: "—",
        supplyLabel: "Deploy contract",
        soldOut: true,
        hasPass: false,
      };
    }
    const priceWei = BigInt(sale.citizenPriceWei);
    const max = BigInt(sale.maxCitizenSupply);
    const minted = BigInt(sale.citizensMinted);
    const remaining = max - minted;
    const bal = sale.balance != null ? BigInt(sale.balance) : 0n;
    return {
      priceLabel: `${formatEther(priceWei)} ETH`,
      supplyLabel: `${minted.toLocaleString()} / ${max.toLocaleString()}`,
      soldOut: remaining <= 0n,
      hasPass: bal > 0n,
    };
  }, [sale, saleLoading, passReady]);

  const wrongChain = Boolean(
    passReady && expectedChainId != null && walletChainId !== expectedChainId && status === "connected",
  );

  const mintCitizen = async () => {
    if (!passAddr || !sale?.configured) return;
    try {
      const hash = await writeContractAsync({
        address: passAddr,
        abi: clubCitizenPassAbi,
        functionName: "mintCitizen",
        value: BigInt(sale.citizenPriceWei),
        chainId: expectedChainId,
      });
      setMintHash(hash);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Mint failed");
    }
  };

  const mintBusy = writePending || confirmPending;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Membership NFTs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your NFT is your access pass, governance weight and rewards multiplier. Citizen passes mint on-chain when
          configured on the API.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_0_0_1px_hsl(var(--primary)/0.08),inset_0_1px_0_0_hsl(var(--primary)/0.06)]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-gradient-mesh opacity-35 motion-reduce:opacity-25" />
          <div
            className={cn(
              "absolute inset-[-20%] opacity-40 motion-reduce:hidden",
              "bg-[length:200%_200%] animate-onboarding-aurora",
            )}
            style={{
              backgroundImage:
                "linear-gradient(125deg, hsl(var(--primary) / 0.22) 0%, transparent 45%, hsl(var(--gold) / 0.14) 55%, transparent 78%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/55 to-card" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
        </div>
        <div className="relative space-y-4 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            <h2 className="font-display text-lg font-semibold">Learning & activity credentials</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Soulbound achievements from Academy journeys and vault activity. Displayed here for recognition; product
            perks are cosmetic in v1.
          </p>
          <LearningBadgesStrip />
          <VaultPatronClaim />
          <div className="overflow-x-auto border-t border-border/60 pt-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="py-2 pr-4">Badge</th>
                  <th className="py-2 pr-4">Governance UI</th>
                  <th className="py-2 pr-4">Other perks</th>
                </tr>
              </thead>
              <tbody>
                {learningNftPerks.map(row => (
                  <tr key={row.badgeId} className="border-t border-border/40">
                    <td className="py-3 pr-4 font-medium">{row.name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{row.governanceUi}</td>
                    <td className="py-3 text-muted-foreground">
                      {row.feeMessaging} · {row.other}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Featured holder card */}
      <section className="glass-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-30" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
          <div className="relative aspect-square max-w-sm mx-auto md:mx-0">
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-50" />
            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-primary/30 via-card to-gold/20 border border-primary/30 p-8 flex flex-col justify-between shadow-elevated">
              <div className="flex items-start justify-between">
                <Gem className="w-10 h-10 text-primary" />
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  {citizenMeta.hasPass ? "CITIZEN" : "MEMBER"}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Onchain Savings Club</div>
                <div className="font-display text-3xl font-semibold">
                  {citizenMeta.hasPass ? "Verified" : "Explore"}
                </div>
                <div className="font-mono text-[10px] text-muted-foreground mt-2">
                  {status === "connected" && address
                    ? `${address.slice(0, 6)}…${address.slice(-4)}`
                    : "Connect to mint Citizen"}
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
              <Sparkles className="w-3 h-3 mr-1.5" /> {citizenMeta.hasPass ? "Citizen pass on file" : "Choose your path"}
            </Badge>
            <h2 className="font-display text-3xl font-semibold">
              {citizenMeta.hasPass ? "You hold a Citizen pass" : "Citizen membership"}
            </h2>
            <p className="text-muted-foreground">
              {citizenMeta.hasPass
                ? "Your wallet has a Citizen NFT. Club AI and future member-only surfaces can key off this pass."
                : "Mint a Citizen pass on Base to unlock gated experiences (e.g. Club AI when the server enforces the contract)."}
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</div>
                <div className="font-mono-num font-bold text-lg text-primary">{citizenMeta.priceLabel}</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Minted</div>
                <div className="font-mono-num font-bold text-lg text-info">{citizenMeta.supplyLabel}</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Chain</div>
                <div className="font-mono-num font-bold text-lg text-gold">{cfg?.chainName ?? "Base"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Genesis — static sold out */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${genesisTier.color} opacity-20 blur-2xl`} />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Tier</div>
                <div className="font-display font-semibold text-xl">{genesisTier.name}</div>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${genesisTier.color} flex items-center justify-center shadow-glow`}
              >
                <Gem className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl font-mono-num">{genesisTier.price}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Supply: {genesisTier.supply}</div>
            </div>
            <ul className="space-y-2 pt-2 border-t border-border/60">
              {genesisTier.perks.map(p => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full rounded-xl" variant="outline" disabled>
              <Lock className="w-4 h-4 mr-2" /> Sold out
            </Button>
          </div>
        </div>

        {/* Citizen — on-chain */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br from-info to-primary opacity-20 blur-2xl" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Tier</div>
                <div className="font-display font-semibold text-xl">Citizen</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-info to-primary flex items-center justify-center shadow-glow">
                <Gem className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl font-mono-num">{citizenMeta.priceLabel}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {passReady ? (saleLoading ? "Loading on-chain…" : `Supply: ${citizenMeta.supplyLabel}`) : "Set MEMBERSHIP_NFT_CONTRACT on the API"}
              </div>
            </div>
            <ul className="space-y-2 pt-2 border-t border-border/60">
              {[
                "Full vault access",
                "1.25x rewards multiplier",
                "Standard governance",
                "Academy seasons unlocked",
                "Achievement NFTs",
                "Club AI when server enforces pass",
              ].map(p => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ul>
            {!passReady ? (
              <Button className="w-full rounded-xl" variant="outline" disabled>
                Contract not configured
              </Button>
            ) : status !== "connected" ? (
              <div className="w-full [&_button]:w-full">
                <WalletConnectButton disconnectedPrimary disconnectedLabel="Connect to mint" />
              </div>
            ) : wrongChain ? (
              <Button
                className="w-full rounded-xl bg-gradient-primary text-primary-foreground"
                disabled={switchPending}
                onClick={() => {
                  if (expectedChainId == null) return;
                  try {
                    switchChain({ chainId: expectedChainId });
                  } catch {
                    /* user reject or unsupported */
                  }
                }}
              >
                {switchPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Switch to ${cfg?.chainName ?? "network"}`}
              </Button>
            ) : citizenMeta.hasPass ? (
              <Button className="w-full rounded-xl" variant="outline" disabled>
                You hold Citizen
              </Button>
            ) : citizenMeta.soldOut ? (
              <Button className="w-full rounded-xl" variant="outline" disabled>
                <Lock className="w-4 h-4 mr-2" /> Sold out
              </Button>
            ) : (
              <Button
                className="w-full rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"
                disabled={mintBusy || saleLoading || !sale?.configured}
                onClick={() => void mintCitizen()}
              >
                {mintBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mint Citizen"}
              </Button>
            )}
            {passAddr ? (
              <a
                href={explorerAddressUrl(expectedChainId ?? 8453, passAddr)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View contract <ExternalLink className="w-3 h-3" />
              </a>
            ) : null}
          </div>
        </div>

        {/* Visitor */}
        <div className="glass-card p-6 relative overflow-hidden">
          <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${visitorTier.color} opacity-20 blur-2xl`} />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Tier</div>
                <div className="font-display font-semibold text-xl">{visitorTier.name}</div>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${visitorTier.color} flex items-center justify-center shadow-glow`}
              >
                <Gem className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl font-mono-num">{visitorTier.price}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Supply: {visitorTier.supply}</div>
            </div>
            <ul className="space-y-2 pt-2 border-t border-border/60">
              {visitorTier.perks.map(p => (
                <li key={p} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full rounded-xl" variant="outline" asChild>
              <Link to="/academy">Start with Academy</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Vote, title: "On-chain governance", text: "Every NFT carries voting weight on treasury, strategies and real-asset acquisitions." },
          { icon: Coins, title: "Rewards multipliers", text: "Stack yield boosts up to 2.0x by holding higher tiers and progressing your savings level." },
          { icon: Sparkles, title: "Exclusive rounds", text: "Early access to new strategies, real-estate co-investments and curated art drops." },
        ].map(b => (
          <div key={b.title} className="glass-card p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <b.icon className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold">{b.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
};
