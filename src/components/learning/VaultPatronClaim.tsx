import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/hooks/useChainData";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useConnection } from "wagmi";
import { chainApi, explorerTxUrl, type NftMintWithDaoReward } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const qkElig = (addr: string | undefined) => ["nft", "eligibility", addr] as const;
const qkBadges = (addr: string | undefined) => ["nft", "badges", addr] as const;

export function VaultPatronClaim({ className }: { className?: string }) {
  const { address, status } = useConnection();
  const qc = useQueryClient();
  const { data: elig, isLoading } = useQuery({
    queryKey: qkElig(address),
    queryFn: () => chainApi.nftEligibility(address!),
    enabled: status === "connected" && Boolean(address),
  });

  const claim = useMutation({
    mutationFn: () => chainApi.claimVaultPatron({ address: address! }),
    onSuccess: (data: NftMintWithDaoReward) => {
      toast.success("Vault Patron minted", {
        action: {
          label: "BaseScan",
          onClick: () => window.open(explorerTxUrl(data.chainId, data.txHash), "_blank"),
        },
      });
      if (data.daoVotingReward?.status === "granted") {
        toast.success("DAO member reward", { description: "Governance voting weight increased on-chain." });
        void qc.invalidateQueries({ queryKey: qk.portfolio });
      }
      void qc.invalidateQueries({ queryKey: qkElig(address) });
      void qc.invalidateQueries({ queryKey: qkBadges(address) });
    },
    onError: (e: Error) => toast.error(e.message || "Mint failed"),
  });

  if (status !== "connected" || !address) {
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Connect your wallet to check Vault Patron eligibility (uses your on-chain vault balance).
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" /> Checking eligibility…
      </div>
    );
  }

  const vp = elig?.vaultPatron;
  if (!vp || !elig?.learningNftConfigured) {
    return (
      <p className={cn("text-xs text-muted-foreground", className)}>
        NFT contract not configured on the server — patron mint is unavailable.
      </p>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm text-muted-foreground">
        Vault savings (your wallet):{" "}
        <span className="font-mono-num text-foreground">${vp.savings.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        {" · "}
        Min: ${vp.minDeposit.toLocaleString()}
      </div>
      {vp.mintedOnChain ? (
        <p className="text-sm text-primary">Vault Patron credential already minted.</p>
      ) : (
        <Button
          size="sm"
          className="rounded-xl"
          disabled={!vp.canMint || claim.isPending}
          onClick={() => claim.mutate()}
        >
          {claim.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Claim Vault Patron NFT"}
        </Button>
      )}
      {!vp.eligible && !vp.mintedOnChain && (
        <p className="text-xs text-muted-foreground">Deposit more to reach the threshold (educational demo).</p>
      )}
    </div>
  );
}
