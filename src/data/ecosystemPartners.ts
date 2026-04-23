/** Public shout-outs — links to official sites; no endorsement implied beyond gratitude. */

export type PartnerAccent = "eth" | "base" | "arb" | "op" | "poly" | "fc" | "neutral";

export type ChainPartner = {
  id: string;
  name: string;
  /** One line — why we care */
  thanks: string;
  url: string;
  accent: PartnerAccent;
};

export const chainPartners: ChainPartner[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    thanks: "The settlement layer that made programmable savings legible — and the home of the ideas we remix every day.",
    url: "https://ethereum.org",
    accent: "eth",
  },
  {
    id: "base",
    name: "Base",
    thanks: "Our default launchpad: fast blocks, Coinbase-scale distribution, and a culture that actually ships consumer apps.",
    url: "https://base.org",
    accent: "base",
  },
  {
    id: "arbitrum",
    name: "Arbitrum",
    thanks: "Nitro-style rollups proved you can keep Ethereum security habits while turning the fee dial down for members.",
    url: "https://arbitrum.io",
    accent: "arb",
  },
  {
    id: "optimism",
    name: "Optimism",
    thanks: "OP Stack energy and retro-minded public goods funding — a reminder that infra can have a sense of mission.",
    url: "https://www.optimism.io",
    accent: "op",
  },
  {
    id: "polygon",
    name: "Polygon",
    thanks: "Long-time proving ground for app chains and zk routes — handy when you need breadth across EVM experiments.",
    url: "https://polygon.technology",
    accent: "poly",
  },
  {
    id: "farcaster",
    name: "Farcaster",
    thanks: "Where social graphs and wallets shake hands — Mini Apps and open feeds keep community growth composable.",
    url: "https://farcaster.xyz",
    accent: "fc",
  },
];

export type DevShout = { label: string; detail: string; url?: string };

export const openSourceShouts: DevShout[] = [
  {
    label: "OpenZeppelin",
    detail: "Battle-tested Solidity patterns so we spend fewer nights inventing foot-guns.",
    url: "https://www.openzeppelin.com",
  },
  {
    label: "viem & wagmi",
    detail: "Type-safe Ethereum plumbing in TypeScript — the wallet and RPC layer this UI actually trusts.",
    url: "https://viem.sh",
  },
  {
    label: "Hardhat & Foundry friends",
    detail: "Compile, test, and ship contracts without pretending bash is a deployment platform (we still love bash).",
    url: "https://hardhat.org",
  },
  {
    label: "Vite & React",
    detail: "Fast dev feedback and a component model that did not ask us to rewrite the universe to ship a dashboard.",
    url: "https://vitejs.dev",
  },
];
