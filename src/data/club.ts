export const navItems = [
  { name: "Dashboard", path: "/", icon: "LayoutDashboard" },
  { name: "Vault", path: "/vault", icon: "Vault" },
  { name: "Strategies", path: "/strategies", icon: "TrendingUp" },
  { name: "Portfolio", path: "/portfolio", icon: "PieChart" },
  { name: "Leaderboard", path: "/leaderboard", icon: "Trophy" },
  { name: "Transparency", path: "/transparency", icon: "Shield" },
  { name: "Reserves", path: "/reserves", icon: "Landmark" },
  { name: "Academy", path: "/academy", icon: "GraduationCap" },
  { name: "DAO", path: "/dao", icon: "Vote" },
  { name: "Community", path: "/community", icon: "Users" },
  { name: "Membership", path: "/membership", icon: "Gem" },
  { name: "Profile", path: "/profile", icon: "UserCircle" },
] as const;

/** Gamification only; financial figures come from GET /api/portfolio. */
export const userStats = {
  level: "Investor",
  levelNumber: 4,
  xp: 7_840,
  xpToNext: 10_000,
};

export const strategies = [
  {
    id: "real-estate",
    name: "Tokenized Real Estate",
    type: "Real Asset",
    icon: "Building2",
    apy: 8.4,
    risk: "Low",
    riskScore: 2,
    allocation: 28,
    tvl: 13_530_000,
    description: "Fractionalized ownership of premium urban rental properties across NYC, Lisbon and Singapore.",
    color: "gold",
    reservesLink: "/reserves",
  },
  {
    id: "btc-mining",
    name: "BTC Mining Pool",
    type: "Mining",
    icon: "Bitcoin",
    apy: 14.7,
    risk: "Medium",
    riskScore: 3,
    allocation: 18,
    tvl: 8_697_000,
    description: "DAO-owned hashpower in Texas & Paraguay, paying out daily in native BTC.",
    color: "warning",
  },
  {
    id: "ai-trading",
    name: "AI Quant Vault",
    type: "AI Trading",
    icon: "Brain",
    apy: 32.6,
    risk: "High",
    riskScore: 5,
    allocation: 12,
    tvl: 5_798_000,
    description: "Neural-net signals on perp markets with strict drawdown controls.",
    color: "primary",
  },
  {
    id: "liquidity",
    name: "Concentrated Liquidity",
    type: "DeFi",
    icon: "Droplets",
    apy: 22.1,
    risk: "Medium",
    riskScore: 3,
    allocation: 16,
    tvl: 7_731_000,
    description: "Active LP positions on Uniswap v4, Aerodrome and Curve stableswaps.",
    color: "info",
  },
  {
    id: "staking",
    name: "ETH Restaking",
    type: "Staking",
    icon: "Layers",
    apy: 6.8,
    risk: "Low",
    riskScore: 2,
    allocation: 14,
    tvl: 6_764_000,
    description: "Native ETH staking layered with EigenLayer AVS rewards.",
    color: "primary",
  },
  {
    id: "art",
    name: "Blue-chip Art Vault",
    type: "Real Asset",
    icon: "Palette",
    apy: 5.2,
    risk: "Low",
    riskScore: 1,
    allocation: 8,
    tvl: 3_865_000,
    description: "Custodied works from Picasso, Basquiat and contemporary masters.",
    color: "gold",
  },
  {
    id: "structured",
    name: "Structured Products",
    type: "DeFi",
    icon: "Boxes",
    apy: 11.9,
    risk: "Medium",
    riskScore: 3,
    allocation: 4,
    tvl: 1_932_000,
    description: "Principal-protected notes via Ribbon-style options vaults.",
    color: "info",
  },
];

export const growthData = Array.from({ length: 12 }, (_, i) => {
  const base = 18000;
  const growth = base * Math.pow(1.018, i) + Math.sin(i / 2) * 400;
  const yieldVal = growth - base + 6500;
  return {
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
    savings: Math.round(growth),
    yield: Math.round(yieldVal),
  };
});

export const treasuryHistory = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: Math.round(42_000_000 + i * 210_000 + Math.sin(i / 3) * 600_000),
}));

/** Display-only yield boost (UI); on-chain enforcement is roadmap. Ladder: Explorer → Architect. */
export const levels = [
  {
    name: "Explorer",
    min: 0,
    multiplier: "1.0x",
    yieldBoostDisplay: "+0%",
    perks: ["Academy & vault access", "Read governance"],
  },
  {
    name: "Investor",
    min: 2_500,
    multiplier: "1.1x",
    yieldBoostDisplay: "+1%",
    perks: ["Higher yield boost tier", "Achievement NFTs"],
  },
  {
    name: "Strategist",
    min: 6_000,
    multiplier: "1.25x",
    yieldBoostDisplay: "+2%",
    perks: ["Early strategy access", "DAO voting weight UI"],
  },
  {
    name: "Governor",
    min: 12_000,
    multiplier: "1.4x",
    yieldBoostDisplay: "+3%",
    perks: ["Governance rewards", "Real-asset round visibility"],
  },
  {
    name: "Architect",
    min: 25_000,
    multiplier: "1.5x",
    yieldBoostDisplay: "+4%",
    perks: ["Council-tier flair", "Priority new strategies"],
  },
];

export const academyPaths = [
  {
    level: "Beginner",
    color: "primary",
    modules: [
      { name: "What is DeFi?", duration: "12 min", reward: 50, done: true },
      { name: "How DAOs Work", duration: "18 min", reward: 75, done: true },
      { name: "Tokenized Real-World Assets", duration: "22 min", reward: 100, done: false },
    ],
  },
  {
    level: "Intermediate",
    color: "info",
    modules: [
      { name: "Liquidity Pools Deep Dive", duration: "30 min", reward: 150, done: false },
      { name: "Staking & Restaking", duration: "25 min", reward: 125, done: false },
      { name: "Risk Management 101", duration: "35 min", reward: 175, done: false },
    ],
  },
  {
    level: "Advanced",
    color: "gold",
    modules: [
      { name: "Designing Yield Strategies", duration: "55 min", reward: 300, done: false },
      { name: "On-chain Analytics", duration: "45 min", reward: 250, done: false },
      { name: "DAO Treasury Management", duration: "60 min", reward: 350, done: false },
    ],
  },
];

export const leaderboard = [
  { rank: 1, name: "0xVault.eth", level: "Architect", xp: 48_210, savings: 412_500 },
  { rank: 2, name: "moneta.lens", level: "Architect", xp: 39_842, savings: 318_900 },
  { rank: 3, name: "satoshi_jr", level: "Strategist", xp: 22_140, savings: 184_200 },
  { rank: 4, name: "you", level: "Investor", xp: 7_840, savings: 24_580, isYou: true },
  { rank: 5, name: "defi.pioneer", level: "Investor", xp: 7_120, savings: 19_800 },
  { rank: 6, name: "yield.farmer", level: "Explorer", xp: 4_320, savings: 9_400 },
];
