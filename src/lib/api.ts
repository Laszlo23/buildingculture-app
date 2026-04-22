const base = () => (import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "");

export type ApiErrorBody = { error?: { message?: string; code?: string } };

function parseJsonBody<T>(res: Response, text: string, path: string, method: string): T {
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    const apiBase = base();
    if (res.status === 404) {
      throw new Error(
        `API 404 for ${method} ${path}${apiBase ? ` (base=${apiBase})` : ""}. ` +
          "If GET /api/config works but this path 404s, the Hono process on that port is stale: stop `npm run dev` (both api+vite), " +
          "kill anything on PORT (e.g. lsof -i :3001), then run `npm run dev` again. The API uses `tsx watch` so future edits reload.",
      );
    }
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(
        `Cannot reach API (${res.status}) for ${path}. Start Hono: \`npm run dev:api\` or use \`npm run dev\` (Vite + API).`,
      );
    }
    const looksHtml = /^\s*</.test(text) || text.includes("<!DOCTYPE");
    if (looksHtml) {
      throw new Error(
        `API returned HTML instead of JSON (${res.status}) for ${path}. Wrong VITE_API_URL or backend not running.`,
      );
    }
    throw new Error(`Invalid JSON (${res.status}) for ${path}`);
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    headers: { Accept: "application/json" },
  });
  const text = await res.text();
  const data = parseJsonBody<T & ApiErrorBody>(res, text, path, "GET");
  if (!res.ok) {
    const err = (data as ApiErrorBody).error;
    const msg =
      typeof err === "object" && err && "message" in err
        ? String((err as { message?: string }).message)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export async function apiPost<T, B extends object>(path: string, body: B): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const data = parseJsonBody<T & ApiErrorBody>(res, text, path, "POST");
  if (!res.ok) {
    const err = (data as ApiErrorBody).error;
    const msg =
      typeof err === "object" && err && "message" in err
        ? String((err as { message?: string }).message)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export async function apiPut<T, B extends object>(path: string, body: B): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  const data = parseJsonBody<T & ApiErrorBody>(res, text, path, "PUT");
  if (!res.ok) {
    const err = (data as ApiErrorBody).error;
    const msg =
      typeof err === "object" && err && "message" in err
        ? String((err as { message?: string }).message)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export type MetricSource =
  | "on-chain"
  | "placeholder"
  | "registry"
  | "fallback"
  | "computed-ui";

/** Portfolio + strategy allocations (from multicall). */
export type PortfolioDto = {
  address: string;
  totalSavings: number;
  yieldEarned: number;
  treasurySize: number;
  vaultTotalAssets: number;
  blendedApy: number;
  governanceWeight: number;
  strategies: {
    id: string;
    allocationBps: number;
    tvl: string;
    tvlSource?: "adapter" | "manual";
    adapterAddress?: string | null;
  }[];
  chainId: number;
  metricSources?: {
    totalSavings: MetricSource;
    yieldEarned: MetricSource;
    treasurySize: MetricSource;
    vaultTotalAssets: MetricSource;
    blendedApy: MetricSource;
    governanceWeight: MetricSource;
    strategyAllocationBps: MetricSource;
    strategyTvl: MetricSource;
  };
  registryRecentEvents?: Array<{
    kind: string;
    strategyId: string;
    blockNumber: string;
    txHash: string;
    adapter?: string;
  }>;
  keeperStack?: {
    providers: readonly string[];
    note: string;
  };
};

export type TreasuryDto = {
  totalTreasury: number;
  vaultTotalAssets: number;
  totalMembers: number;
  avgApy: number;
  realAssetBacking: number;
};

export type ProposalDto = {
  id: string;
  proposalId: string;
  title: string;
  category: string;
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorum: number;
  endsIn: string;
  status: string;
};

export type TxResult = {
  txHash: `0x${string}`;
  status: "success" | "reverted";
  approvalTxHash?: `0x${string}` | null;
  chainId: number;
};

export type NftRouteEligibility = {
  completed: boolean;
  mintedOnChain: boolean;
  canMint: boolean;
};

export type NftEligibilityDto = {
  learningNftConfigured: boolean;
  routes: Record<"rwa" | "authenticity" | "truth", NftRouteEligibility>;
  vaultPatron: {
    savings: number;
    minDeposit: number;
    eligible: boolean;
    mintedOnChain: boolean;
    canMint: boolean;
  };
};

export type NftBadgesDto = {
  address: string;
  learningNftConfigured: boolean;
  badges: { id: string; name: string; achievementType: number; minted: boolean }[];
};

export type ChatMessageDto = {
  id: string;
  address: string;
  text: string;
  createdAt: string;
};

export type MemberProfileDto = {
  bio: string;
  socials: {
    twitter?: string;
    github?: string;
    website?: string;
    farcaster?: string;
  };
  updatedAt: string;
};

export type DailyTaskId = "check_in" | "share_x" | "community_pulse";

export type DailyTasksDto = {
  definitions: Array<{ id: DailyTaskId; title: string; description: string }>;
  date: string;
  streak: number;
  tasks: {
    check_in: boolean;
    share_x: boolean;
    community_pulse: boolean;
  };
};

export const chainApi = {
  wallet: () => apiGet<{ address: string; chainId: number }>("/api/wallet"),
  config: () =>
    apiGet<{
      chainId: number;
      chainName: string;
      contracts: Record<string, string | null>;
      assetDecimals: number;
      vaultPatronMinDeposit?: number;
    }>("/api/config"),
  portfolio: () => apiGet<PortfolioDto>("/api/portfolio"),
  treasury: () => apiGet<TreasuryDto>("/api/treasury"),
  proposals: () => apiGet<{ proposals: ProposalDto[] }>("/api/governance/proposals"),
  deposit: (amount: string, decimals?: number) =>
    apiPost<TxResult, { amount: string; decimals?: number }>("/api/transactions/deposit", {
      amount,
      ...(decimals != null ? { decimals } : {}),
    }),
  withdraw: (amount: string, decimals?: number) =>
    apiPost<TxResult, { amount: string; decimals?: number }>("/api/transactions/withdraw", {
      amount,
      ...(decimals != null ? { decimals } : {}),
    }),
  claimYield: () => apiPost<TxResult, Record<string, never>>("/api/transactions/claim-yield", {}),
  allocate: (strategyId: string | number, bps: number) =>
    apiPost<TxResult, { strategyId: string | number; bps: number }>("/api/transactions/allocate", {
      strategyId,
      bps,
    }),
  vote: (proposalId: string, support: 0 | 1 | 2) =>
    apiPost<TxResult, { proposalId: string; support: 0 | 1 | 2 }>("/api/governance/vote", {
      proposalId,
      support,
    }),
  nftEligibility: (address: string) =>
    apiGet<NftEligibilityDto>(`/api/nft/eligibility?address=${encodeURIComponent(address)}`),
  nftBadges: (address: string) =>
    apiGet<NftBadgesDto>(`/api/nft/badges?address=${encodeURIComponent(address)}`),
  learningComplete: (body: { address: string; routeId: "rwa" | "authenticity" | "truth"; answers: number[] }) =>
    apiPost<{ ok: boolean; routeId: string }, typeof body>("/api/learning/complete", body),
  claimLearningNft: (body: { address: string; routeId: "rwa" | "authenticity" | "truth" }) =>
    apiPost<TxResult, typeof body>("/api/nft/claim-learning", body),
  claimVaultPatron: (body: { address: string }) =>
    apiPost<TxResult, typeof body>("/api/nft/claim-vault-patron", body),

  communityMessages: () => apiGet<{ messages: ChatMessageDto[] }>("/api/community/messages"),

  postCommunityMessage: (body: { address: string; text: string }) =>
    apiPost<{ message: ChatMessageDto }, typeof body>("/api/community/messages", body),

  getProfile: (address: string) =>
    apiGet<{ profile: MemberProfileDto }>(`/api/profile?address=${encodeURIComponent(address)}`),

  putProfile: (body: {
    address: string;
    bio?: string;
    socials?: Partial<MemberProfileDto["socials"]>;
  }) => apiPut<{ profile: MemberProfileDto }, typeof body>("/api/profile", body),

  getDailyTasks: (address: string) =>
    apiGet<DailyTasksDto>(`/api/tasks/daily?address=${encodeURIComponent(address)}`),

  completeDailyTask: (body: { address: string; taskId: DailyTaskId }) =>
    apiPost<DailyTasksDto, typeof body>("/api/tasks/daily/complete", body),
};

export function explorerTxUrl(chainId: number, txHash: string): string {
  if (chainId === 84532) return `https://sepolia.basescan.org/tx/${txHash}`;
  return `https://basescan.org/tx/${txHash}`;
}

export function explorerAddressUrl(chainId: number, address: string): string {
  const a = address.startsWith("0x") ? address : `0x${address}`;
  if (chainId === 84532) return `https://sepolia.basescan.org/address/${a}`;
  return `https://basescan.org/address/${a}`;
}
