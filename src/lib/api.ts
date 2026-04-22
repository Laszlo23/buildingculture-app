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

/** Single “institutional” snapshot: one response, one block, measured RPC and live vault reads. */
export type ProtocolPulseDto = {
  fetchedAt: string;
  rpcLatencyMs: number;
  chainId: number;
  chainName: string;
  blockNumber: string;
  blockHash: `0x${string}` | null;
  blockTimestamp: string;
  blockAgeSeconds: number;
  baseFeeGwei: string | null;
  vaultTvl: number;
  daoTreasury: number;
  strategyCount: number;
  activeProposals: number;
  pulseScore: number;
  tagline: string;
  /** Set by API when the bundle is the single server read; the UI may set `client` when the pulse route fails. */
  source?: "api" | "client";
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

/** Server-side GovernanceDAO.setVotingPower bump (optional; see DAO_VOTING_REWARDS_ENABLED). */
export type DaoVotingRewardDto =
  | { status: "disabled" }
  | { status: "skipped"; reason: "already_granted" | "below_min_vault" }
  | { status: "granted"; txHash: string; newWeight: string; rewardKey: string }
  | { status: "failed"; message: string; rewardKey: string };

export type NftMintWithDaoReward = TxResult & { daoVotingReward: DaoVotingRewardDto };

export type BinanceCandleDto = {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
};

export type BinanceKlinesDto = {
  baseUrl: string;
  symbol: string;
  interval: string;
  limit: number;
  candles: BinanceCandleDto[];
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
  /** Present when server supports agent rows in Member Chat. */
  role?: "user" | "agent";
  agentKey?: string | null;
};

/** Farcaster (Neynar) — server proxy, no key in the client bundle. */
export type FarcasterUserDto = {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string | null;
  bio: string | null;
  url: string;
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
  /** Default true. When false, /investor/:addr and leaderboards hide this wallet. */
  publicWealthProfile?: boolean;
  wealthDisplayName?: string;
  firstVaultInteractionAt?: string;
};

export type WealthRange = "1M" | "3M" | "6M" | "1Y" | "ALL";

export type WealthSeriesPoint = { t: string; vaultUsd: number; cumulativeYieldUsd: number };

export type WealthAchievementDto = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  tier?: "bronze" | "silver" | "gold" | "legend";
};

export type WealthLevelDto = {
  id: "explorer" | "investor" | "strategist" | "governor" | "architect";
  label: string;
  xp: number;
  xpToNext: number;
};

export type WealthStrategyRowDto = {
  strategyId: string;
  depositedUsd: number;
  yieldUsd: number;
  roiPct: number;
};

export type WealthDto = {
  address: string;
  profile: { wealthDisplayName: string | null; memberSince: string | null };
  portfolio: PortfolioDto;
  series: WealthSeriesPoint[];
  strategies: WealthStrategyRowDto[];
  achievements: WealthAchievementDto[];
  level: WealthLevelDto;
  meta: { range: WealthRange; dataProvenance: string };
};

export type LeaderboardRowDto = {
  address: string;
  vaultUsd: number;
  yieldUsd: number;
  votingPower: number;
  strategyRoiPct: number;
  votesCast: number;
  updatedAt: string;
};

export type LeaderboardDto = {
  topInvestors: LeaderboardRowDto[];
  topYieldEarners: LeaderboardRowDto[];
  topStrategists: LeaderboardRowDto[];
  topDaoVoters: LeaderboardRowDto[];
  meta: { count: number };
};

export type ReferralTierId = "none" | "builder" | "strategist" | "ambassador";

export type ReferralStatsDto = {
  address: string;
  invites: number;
  boostPct: number;
  tier: { tier: ReferralTierId; label: string };
  milestone: { next: number; prev: number; pct: number };
};

export type RecordReferralResult = { ok: boolean; count: number; duplicate: boolean };

export type ReferralLeaderboardRowDto = {
  address: `0x${string}`;
  invites: number;
  boostPct: number;
  tier: string;
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

/** Server BaseAI pipe (no keys in the browser; 503 if LANGBASE_API_KEY unset). */
export type BuildingCulturePipeRequest =
  | { userMessage: string }
  | { messages: { role: "user" | "assistant" | "system"; content: string }[] };

export type BuildingCulturePipeResponseDto = {
  id: string;
  model: string;
  completion: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  threadId?: string;
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
      binance?: { apiKeyConfigured: boolean; restHost: string };
      ai?: { langbaseConfigured: boolean; communityAgentInChat: boolean };
    }>("/api/config"),

  getBinanceKlines: (params: { symbol: string; interval: string; limit?: number }) => {
    const q = new URLSearchParams();
    q.set("symbol", params.symbol);
    q.set("interval", params.interval);
    if (params.limit != null) q.set("limit", String(params.limit));
    return apiGet<BinanceKlinesDto>(`/api/market/binance/klines?${q.toString()}`);
  },
  portfolio: () => apiGet<PortfolioDto>("/api/portfolio"),
  treasury: () => apiGet<TreasuryDto>("/api/treasury"),
  /** Protocol “secret weapon”: sub-second read bundle for dashboards and embeds. */
  getProtocolPulse: () => apiGet<ProtocolPulseDto>("/api/protocol/pulse"),
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
    apiPost<{ ok: boolean; routeId: string; daoVotingReward: DaoVotingRewardDto }, typeof body>(
      "/api/learning/complete",
      body,
    ),

  /** Story-quiz completion stored server-side (SQLite). */
  getLearningProgress: (address: string) =>
    apiGet<{
      routes: Partial<Record<"rwa" | "authenticity" | "truth", { completedAt: string }>>;
    }>(`/api/learning/progress?address=${encodeURIComponent(address)}`),
  claimLearningNft: (body: { address: string; routeId: "rwa" | "authenticity" | "truth" }) =>
    apiPost<NftMintWithDaoReward, typeof body>("/api/nft/claim-learning", body),
  claimVaultPatron: (body: { address: string }) =>
    apiPost<NftMintWithDaoReward, typeof body>("/api/nft/claim-vault-patron", body),

  communityMessages: () => apiGet<{ messages: ChatMessageDto[] }>("/api/community/messages"),

  postCommunityMessage: (body: { address: string; text: string }) =>
    apiPost<{ message: ChatMessageDto }, typeof body>("/api/community/messages", body),

  /** Farcaster @username via Neynar (NEYNAR_API_KEY on server). */
  getFarcaster: (address: string) =>
    apiGet<{ configured: boolean; user: FarcasterUserDto | null }>(
      `/api/social/farcaster?address=${encodeURIComponent(address)}`,
    ),

  getFarcasterBatch: (addresses: string[]) => {
    const q = addresses
      .map((a) => a.trim().toLowerCase())
      .filter((a) => /^0x[a-fA-F0-9]{40}$/i.test(a));
    if (q.length === 0) {
      return Promise.resolve({
        configured: false as boolean,
        users: {} as Record<string, FarcasterUserDto | null>,
      });
    }
    const unique = [...new Set(q)].slice(0, 50);
    return apiGet<{
      configured: boolean;
      users: Record<string, FarcasterUserDto | null>;
    }>(`/api/social/farcaster?addresses=${encodeURIComponent(unique.join(","))}`);
  },

  askBuildingCultureClub: (body: BuildingCulturePipeRequest) =>
    apiPost<BuildingCulturePipeResponseDto, BuildingCulturePipeRequest>(
      "/api/ai/pipe/building-culture-club",
      body,
    ),

  askCommunityBuilder: (body: BuildingCulturePipeRequest) =>
    apiPost<BuildingCulturePipeResponseDto, BuildingCulturePipeRequest>(
      "/api/ai/pipe/community-builder",
      body,
    ),

  getProfile: (address: string) =>
    apiGet<{ profile: MemberProfileDto }>(`/api/profile?address=${encodeURIComponent(address)}`),

  putProfile: (body: {
    address: string;
    bio?: string;
    socials?: Partial<MemberProfileDto["socials"]>;
    publicWealthProfile?: boolean;
    wealthDisplayName?: string | null;
  }) => apiPut<{ profile: MemberProfileDto }, typeof body>("/api/profile", body),

  getWealth: (address: string, range?: WealthRange) =>
    apiGet<WealthDto>(
      `/api/wealth/${encodeURIComponent(address)}${range ? `?range=${encodeURIComponent(range)}` : ""}`,
    ),

  postWealthSnapshot: (body: { address: string }) =>
    apiPost<
      { ok: boolean; address: string; vault: number; yield: number; daoVotingReward: DaoVotingRewardDto },
      typeof body
    >("/api/wealth/snapshot", body),

  getLeaderboard: () => apiGet<LeaderboardDto>("/api/leaderboard"),

  getDailyTasks: (address: string) =>
    apiGet<DailyTasksDto>(`/api/tasks/daily?address=${encodeURIComponent(address)}`),

  completeDailyTask: (body: { address: string; taskId: DailyTaskId }) =>
    apiPost<DailyTasksDto, typeof body>("/api/tasks/daily/complete", body),

  getReferralStats: (address: string) =>
    apiGet<ReferralStatsDto>(`/api/referrals/${encodeURIComponent(address)}`),

  getReferralLeaderboard: (limit = 20) =>
    apiGet<{ rows: ReferralLeaderboardRowDto[] }>(
      `/api/referrals/leaderboard/top?limit=${encodeURIComponent(String(limit))}`,
    ),

  recordReferral: (body: { inviter: string; invitee: string }) =>
    apiPost<RecordReferralResult, typeof body>("/api/referrals/record", body),
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

export function explorerBlockUrl(chainId: number, blockNumber: string | number): string {
  const b = String(blockNumber);
  if (chainId === 84532) return `https://sepolia.basescan.org/block/${b}`;
  return `https://basescan.org/block/${b}`;
}
