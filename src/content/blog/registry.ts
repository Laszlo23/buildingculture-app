import type { BlogPost, BlogTag } from "./types";
import {
  BodyAiTradingSignals,
  BodyClubGrowthContent,
  BodyDocsAreAFeature,
  BodyGasAndPatience,
  BodyJpegDiligence,
  BodyNarrativeSeasons,
  BodyRwaOnChainClaims,
  BodyStrategyStack,
  BodyThinkingAboutYield,
  BodyTransparencyFirst,
} from "./bodies";

export type { BlogPost, BlogTag } from "./types";

export const blogTagLabels: Record<BlogTag, string> = {
  rwa: "RWA",
  "ai-trading": "AI & trading",
  strategies: "Strategies",
  risk: "Risk",
  yield: "Yield",
  club: "Club",
};

const posts: BlogPost[] = [
  {
    slug: "rwa-onchain-claims",
    title: "RWA: what is usually on-chain vs off-chain?",
    description:
      "A member-friendly framing for tokenized real-world assets — claims, settlement, and where diligence still matters.",
    publishedAt: "2026-04-01",
    tags: ["rwa", "risk", "strategies"],
    featured: true,
    readingTimeMinutes: 5,
    Body: BodyRwaOnChainClaims,
  },
  {
    slug: "ai-trading-signals-not-oracles",
    title: "AI-assisted workflows are not automatic alpha",
    description:
      "How we think about AI around savings and strategies — tooling, communication, and the limits of model outputs.",
    publishedAt: "2026-04-08",
    tags: ["ai-trading", "strategies", "risk"],
    featured: true,
    readingTimeMinutes: 6,
    Body: BodyAiTradingSignals,
  },
  {
    slug: "strategy-stack-portfolio",
    title: "Reading the strategy stack next to your portfolio",
    description:
      "Treat the strategy catalog as education and transparency — not a personalized suitability map.",
    publishedAt: "2026-04-12",
    tags: ["strategies", "yield", "club"],
    featured: false,
    readingTimeMinutes: 5,
    Body: BodyStrategyStack,
  },
  {
    slug: "thinking-about-yield",
    title: "Thinking about yield without certainty theater",
    description:
      "Questions to ask when you see APY-style numbers — periods, fees, and what the headline leaves out.",
    publishedAt: "2026-04-15",
    tags: ["yield", "risk", "rwa"],
    featured: false,
    readingTimeMinutes: 4,
    Body: BodyThinkingAboutYield,
  },
  {
    slug: "transparency-first-onboarding",
    title: "Transparency-first onboarding for new members",
    description:
      "Why we link contracts, reserves, and governance surfaces early — and how that supports safer growth.",
    publishedAt: "2026-04-20",
    tags: ["club", "strategies", "rwa"],
    featured: false,
    readingTimeMinutes: 4,
    Body: BodyTransparencyFirst,
  },
  {
    slug: "content-and-club-growth",
    title: "Content, clarity, and club growth",
    description:
      "How short explainers and obvious deep links reduce onboarding friction without replacing diligence.",
    publishedAt: "2026-04-22",
    tags: ["club", "strategies"],
    featured: false,
    readingTimeMinutes: 3,
    Body: BodyClubGrowthContent,
  },
  {
    slug: "the-docs-are-a-feature",
    title: "The docs are a feature (yes, we saw the analytics)",
    description:
      "Why we built a learning hub anyway, a brief roast of flattery-as-UX, and where to go when you want receipts not vibes.",
    publishedAt: "2026-04-24",
    tags: ["club", "strategies", "risk"],
    featured: false,
    readingTimeMinutes: 4,
    Body: BodyDocsAreAFeature,
  },
  {
    slug: "narrative-seasons-and-your-timeline",
    title: "Narrative seasons and your actual calendar",
    description:
      "Liquidity summer, builder winter, and other moods that do not owe you alignment — plus where to cross-check before you FOMO.",
    publishedAt: "2026-04-26",
    tags: ["yield", "risk", "ai-trading"],
    featured: false,
    readingTimeMinutes: 4,
    Body: BodyNarrativeSeasons,
  },
  {
    slug: "gas-receipts-and-patience",
    title: "Gas receipts and the virtue of not rage-refreshing",
    description:
      "A love letter to transaction patience, a gentle separation of deposit vs claim vibes, and where to read while Base does its job.",
    publishedAt: "2026-04-28",
    tags: ["club", "strategies", "yield"],
    featured: false,
    readingTimeMinutes: 3,
    Body: BodyGasAndPatience,
  },
  {
    slug: "jpeg-diligence-and-real-diligence",
    title: "Your PFP is not due diligence (neither is ours)",
    description:
      "Celebrate the gradient, then still walk reserves, strategies, and contracts — plus a shared confession about skipping terms of service.",
    publishedAt: "2026-04-30",
    tags: ["club", "rwa", "risk"],
    featured: false,
    readingTimeMinutes: 4,
    Body: BodyJpegDiligence,
  },
];

export function getBlogPosts(): BlogPost[] {
  return [...posts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getBlogPostBySlug(slug: string | undefined): BlogPost | undefined {
  if (!slug) return undefined;
  return posts.find(p => p.slug === slug);
}

export function getBlogTitleForSlug(slug: string | undefined): string | null {
  const p = getBlogPostBySlug(slug);
  return p?.title ?? null;
}

export function getFeaturedPosts(): BlogPost[] {
  return getBlogPosts().filter(p => p.featured);
}
