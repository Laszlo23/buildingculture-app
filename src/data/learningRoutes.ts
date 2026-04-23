export type LearningRouteId = "rwa" | "authenticity" | "truth";

export type LearningChapter = {
  title: string;
  body: string[];
};

export type LearningQuizQuestion = {
  prompt: string;
  options: string[];
  /** Zero-based correct option; API grading uses this via `server/learning/quizAnswers.ts`. */
  correctIndex: number;
};

export type LearningRouteConfig = {
  id: LearningRouteId;
  path: string;
  title: string;
  subtitle: string;
  nftName: string;
  accent: "gold" | "info" | "primary";
  chapters: LearningChapter[];
  quiz: LearningQuizQuestion[];
};

export const learningRoutes: Record<LearningRouteId, LearningRouteConfig> = {
  rwa: {
    id: "rwa",
    path: "/academy/rwa",
    title: "Foundations of RWA",
    subtitle: "Tokenized real estate vs paper friction — what is actually on-chain?",
    nftName: "RWA Scholar",
    accent: "gold",
    chapters: [
      {
        title: "The pooled building",
        body: [
          "Imagine a fictional office building whose rent is collected monthly. A DAO pools capital, buys exposure to that cash flow, and records membership on-chain.",
          "What lives on-chain is usually claims, rules, and settlement — not the deed in a filing cabinet. Custody and legal wrappers still sit in the real world.",
        ],
      },
      {
        title: "Liquidity vs regulation",
        body: [
          "Tokenized instruments can trade faster than legacy paperwork — but they still inherit securities law, KYC expectations, and jurisdiction.",
          "Liquidity is a feature; compliance is not magically solved by minting a token.",
        ],
      },
      {
        title: "Pros and cons",
        body: [
          "Pros: programmable distribution, transparent ledgers, composability with DeFi rails.",
          "Cons: oracle and off-chain data risk, regulatory uncertainty, and marketing that overstates what the smart contract actually controls.",
        ],
      },
    ],
    quiz: [
      {
        prompt: "In most real-world tokenized real-estate setups, what is typically still off-chain?",
        options: [
          "Nothing — the entire building file is stored in calldata",
          "Legal title, disclosures, and regulated custody often remain off-chain",
          "Only the color of the UI theme",
          "Only the user’s phone number",
        ],
        correctIndex: 1,
      },
      {
        prompt: "Liquidity on a secondary market implies which risk is reduced for holders?",
        options: [
          "Regulatory risk — it disappears when a token lists",
          "Smart contract bugs — liquidity fixes code",
          "Difficulty exiting a position quickly — though spreads and rules still apply",
          "Oracle risk — oracles become unnecessary",
        ],
        correctIndex: 2,
      },
      {
        prompt: "A primary benefit of programmable cash flows on-chain is:",
        options: [
          "Automated distribution rules that are visible before you participate",
          "Guaranteed APY regardless of tenants",
          "Elimination of all legal agreements",
          "Free gas on every chain",
        ],
        correctIndex: 0,
      },
      {
        prompt: "“What’s on-chain” vs “what’s marketed” — the safest stance is:",
        options: [
          "Trust the landing page headline",
          "Trust Discord mods",
          "Read the contract, disclosures, and data sources — marketing can overstate control",
          "Assume the DAO owns the physical keys to every door",
        ],
        correctIndex: 2,
      },
    ],
  },
  authenticity: {
    id: "authenticity",
    path: "/academy/authenticity",
    title: "Authenticity & Digital Twins",
    subtitle: "Sneakers, luxury, and certificates — when NFTs are proof vs promotion.",
    nftName: "Authenticity Scout",
    accent: "info",
    chapters: [
      {
        title: "Certificate vs counterfeit economy",
        body: [
          "High-end goods battle fakes with holograms, RFID, and centralized databases. NFTs can anchor a digital twin to a specific item.",
          "The JPEG alone is not authenticity — binding between token, physical item, and issuer matters.",
        ],
      },
      {
        title: "Royalties and resale",
        body: [
          "Royalties on secondary sales are a policy choice of marketplaces and standards — not a law of physics.",
          "When NFTs are marketing fluff, resale incentives can dominate utility.",
        ],
      },
      {
        title: "Utility vs hype",
        body: [
          "Utility: verifiable issuance, transfer history, and clear redemption rules.",
          "Hype: vague roadmaps and scarcity without service-level commitments.",
        ],
      },
    ],
    quiz: [
      {
        prompt: "A useful authenticity NFT ties to physical goods primarily through:",
        options: [
          "Issuer attestations and clear redemption or verification flows",
          "Using a rare background color only",
          "Having the highest floor price on any marketplace",
          "Being stored only in a spreadsheet",
        ],
        correctIndex: 0,
      },
      {
        prompt: "Royalties on resales are:",
        options: [
          "Guaranteed by Ethereum consensus",
          "Fixed at 10% worldwide",
          "Enforced by every wallet automatically",
          "Often marketplace- and standard-dependent — not universally guaranteed",
        ],
        correctIndex: 3,
      },
      {
        prompt: "A “digital twin” in luxury goods usually means:",
        options: [
          "A duplicate physical item shipped for free",
          "A token linked to a specific serialized item with traceable history",
          "Any PNG on IPFS",
          "A Twitter profile picture",
        ],
        correctIndex: 1,
      },
      {
        prompt: "NFTs as proof of authenticity fail when:",
        options: [
          "They use ERC-721",
          "They are soulbound",
          "There is no credible link between issuer, item, and token lifecycle",
          "They are on Base",
        ],
        correctIndex: 2,
      },
    ],
  },
  truth: {
    id: "truth",
    path: "/academy/truth",
    title: "Settlement, Oracles & Verifiable Truth",
    subtitle: "What blockchains prove — and what still requires trusted data.",
    nftName: "Truth Navigator",
    accent: "primary",
    chapters: [
      {
        title: "Finality on L2",
        body: [
          "Moving value on an L2 like Base gives fast UX and lower fees — finality is a protocol and bridge story, not a slogan.",
          "Understand sequencer role, fault/validity assumptions, and withdrawal delays where they apply.",
        ],
      },
      {
        title: "Oracles",
        body: [
          "Smart contracts cannot “know” the weather or stock price without data pushed by oracles.",
          "Oracle risk is trust in feeds, updates, and manipulation resistance — not magic truth dust.",
        ],
      },
      {
        title: "Verifiable data + settlement",
        body: [
          "A “truth layer” is better framed as attestations, signatures, and reproducible data pipelines — plus economic security.",
          "Chains settle transactions; they do not automatically verify your supply chain.",
        ],
      },
    ],
    quiz: [
      {
        prompt: "Without oracles, a smart contract on its own:",
        options: [
          "Knows every central bank rate intrinsically",
          "Trusts Twitter for price data",
          "Cannot fetch arbitrary off-chain facts unless they are provided in a transaction",
          "Runs Google Search internally",
        ],
        correctIndex: 2,
      },
      {
        prompt: "Oracle risk refers to:",
        options: [
          "Wallet font size",
          "Trust assumptions and failure modes of external data fed on-chain",
          "Only Layer 1 block time",
          "NFT image resolution",
        ],
        correctIndex: 1,
      },
      {
        prompt: "A blockchain’s core strength is:",
        options: [
          "Verifiable ordering and execution of transactions under its consensus rules",
          "Replacing all legal systems worldwide",
          "Hosting unbounded private databases for free",
          "Guaranteeing off-chain facts without inputs",
        ],
        correctIndex: 0,
      },
      {
        prompt: "A healthy mental model for “truth layer” products is:",
        options: [
          "The chain magically knows real-world events",
          "One node decides all facts",
          "Ignore data sources if the UI looks premium",
          "Attestations, proofs, and economic security around clearly scoped claims",
        ],
        correctIndex: 3,
      },
    ],
  },
};

export const learningRouteList = Object.values(learningRoutes);
