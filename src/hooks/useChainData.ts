import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { chainApi, explorerTxUrl, type PortfolioDto, type ProposalDto, type ProtocolPulseDto } from "@/lib/api";

export const qk = {
  wallet: ["chain", "wallet"] as const,
  config: ["chain", "config"] as const,
  portfolio: ["chain", "portfolio"] as const,
  treasury: ["chain", "treasury"] as const,
  proposals: ["chain", "proposals"] as const,
  pulse: ["chain", "protocol", "pulse"] as const,
};

export function useWalletInfo() {
  return useQuery({
    queryKey: qk.wallet,
    queryFn: () => chainApi.wallet(),
    retry: 1,
  });
}

export function useChainConfig() {
  return useQuery({
    queryKey: qk.config,
    queryFn: () => chainApi.config(),
    retry: 1,
  });
}

export function usePortfolio() {
  return useQuery({
    queryKey: qk.portfolio,
    queryFn: () => chainApi.portfolio(),
    retry: 1,
  });
}

export function useTreasury() {
  return useQuery({
    queryKey: qk.treasury,
    queryFn: () => chainApi.treasury(),
    retry: 1,
  });
}

export function useProposals() {
  return useQuery({
    queryKey: qk.proposals,
    queryFn: async () => {
      const { proposals } = await chainApi.proposals();
      return proposals;
    },
    retry: 1,
  });
}

/** Institutional-style live snapshot: same block height, RPC timing, and vault reads in one response. */
export function useProtocolPulse() {
  return useQuery<ProtocolPulseDto>({
    queryKey: qk.pulse,
    queryFn: () => chainApi.getProtocolPulse(),
    refetchInterval: 12_000,
    staleTime: 6_000,
    retry: 2,
    retryDelay: (i) => Math.min(1500 * 2 ** i, 6_000),
  });
}

function onTxSuccess(chainId: number, txHash: string, label: string) {
  const url = explorerTxUrl(chainId, txHash);
  toast.success(label, {
    description: `${txHash.slice(0, 10)}…${txHash.slice(-8)}`,
    duration: 8000,
    action: {
      label: "BaseScan",
      onClick: () => window.open(url, "_blank", "noopener,noreferrer"),
    },
  });
}

export function useDepositMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, decimals }: { amount: string; decimals?: number }) =>
      chainApi.deposit(amount, decimals),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: qk.portfolio });
      void qc.invalidateQueries({ queryKey: qk.treasury });
      void qc.invalidateQueries({ queryKey: qk.pulse });
      onTxSuccess(data.chainId, data.txHash, "Deposit confirmed");
    },
    onError: (e: Error) => toast.error(e.message || "Deposit failed"),
  });
}

export function useWithdrawMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ amount, decimals }: { amount: string; decimals?: number }) =>
      chainApi.withdraw(amount, decimals),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: qk.portfolio });
      void qc.invalidateQueries({ queryKey: qk.treasury });
      void qc.invalidateQueries({ queryKey: qk.pulse });
      onTxSuccess(data.chainId, data.txHash, "Withdraw confirmed");
    },
    onError: (e: Error) => toast.error(e.message || "Withdraw failed"),
  });
}

export function useClaimYieldMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => chainApi.claimYield(),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: qk.portfolio });
      void qc.invalidateQueries({ queryKey: qk.pulse });
      onTxSuccess(data.chainId, data.txHash, "Yield claimed");
    },
    onError: (e: Error) => toast.error(e.message || "Claim failed"),
  });
}

export function useAllocateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ strategyId, bps }: { strategyId: string | number; bps: number }) =>
      chainApi.allocate(strategyId, bps),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: qk.portfolio });
      void qc.invalidateQueries({ queryKey: qk.pulse });
      onTxSuccess(data.chainId, data.txHash, "Allocation updated");
    },
    onError: (e: Error) => toast.error(e.message || "Allocation failed"),
  });
}

export function useVoteMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ proposalId, support }: { proposalId: string; support: 0 | 1 | 2 }) =>
      chainApi.vote(proposalId, support),
    onSuccess: (data) => {
      void qc.invalidateQueries({ queryKey: qk.proposals });
      void qc.invalidateQueries({ queryKey: qk.pulse });
      onTxSuccess(data.chainId, data.txHash, "Vote submitted");
    },
    onError: (e: Error) => toast.error(e.message || "Vote failed"),
  });
}

/** Merge static strategy metadata from club with on-chain allocations. */
export function mergeStrategiesForUi(
  portfolio: PortfolioDto | undefined,
  staticStrategies: Array<{
    id: string;
    name: string;
    type: string;
    apy: number;
    risk: string;
    riskScore: number;
    description: string;
    color: string;
    icon: string;
    allocation: number;
    tvl: number;
    reservesLink?: string;
  }>,
) {
  if (!portfolio?.strategies?.length) return staticStrategies;
  return staticStrategies.map((s, i) => {
    const onChain = portfolio.strategies[i];
    const bps = onChain?.allocationBps ?? s.allocation * 100;
    const allocation = Math.min(100, Math.max(0, Math.round(bps / 100))) || s.allocation;
    const tvl = onChain?.tvl ? Number(onChain.tvl) : s.tvl;
    return {
      ...s,
      allocation,
      tvl,
      tvlSource: onChain?.tvlSource,
      adapterAddress: onChain?.adapterAddress ?? null,
    };
  });
}

export type { PortfolioDto, ProposalDto };
