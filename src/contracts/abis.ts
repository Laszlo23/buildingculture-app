/**
 * Minimal ABIs for Onchain Savings Club contracts on Base.
 * Replace or extend when deployment artifacts differ.
 */
export const vaultAbi = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claimYield",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "totalAssets",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "yieldEarned",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const strategyRegistryAbi = [
  {
    type: "function",
    name: "allocate",
    stateMutability: "nonpayable",
    inputs: [
      { name: "strategyId", type: "uint256" },
      { name: "bps", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "strategyCount",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "allocationBps",
    stateMutability: "view",
    inputs: [{ name: "strategyId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "strategyTvl",
    stateMutability: "view",
    inputs: [{ name: "strategyId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "strategyAdapter",
    stateMutability: "view",
    inputs: [{ name: "strategyId", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "effectiveStrategyTvl",
    stateMutability: "view",
    inputs: [{ name: "strategyId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "event",
    name: "TvlUpdated",
    inputs: [
      { name: "strategyId", type: "uint256", indexed: true },
      { name: "tvl", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Allocated",
    inputs: [
      { name: "strategyId", type: "uint256", indexed: true },
      { name: "bps", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "StrategyAdapterSet",
    inputs: [
      { name: "strategyId", type: "uint256", indexed: true },
      { name: "adapter", type: "address", indexed: false },
    ],
  },
] as const;

export const treasuryAbi = [
  {
    type: "function",
    name: "totalAssets",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

/** OpenZeppelin Governor-style + custom vote entrypoint */
export const governanceDaoAbi = [
  {
    type: "function",
    name: "vote",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "uint8" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "castVote",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "uint8" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "proposalVotes",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      { name: "againstVotes", type: "uint256" },
      { name: "forVotes", type: "uint256" },
      { name: "abstainVotes", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "getVotes",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "blockNumber", type: "uint256" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

/** Soulbound learning / activity credentials (LearningAchievement.sol) */
export const learningAchievementAbi = [
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "achievementType", type: "uint8" },
    ],
    outputs: [{ name: "tokenId", type: "uint256" }],
  },
  {
    type: "function",
    name: "hasAchievement",
    stateMutability: "view",
    inputs: [
      { name: "holder", type: "address" },
      { name: "achievementType", type: "uint8" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "achievementOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "uint8" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "string" }],
  },
] as const;
