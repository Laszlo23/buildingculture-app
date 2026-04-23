import { config } from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "../../.env") });

const envSchema = z
  .object({
  /** HTTP RPC URL (public node or any provider). Optional if ALCHEMY_API_KEY is set. */
  RPC_URL: z.string().min(4).optional(),
  /** Alchemy Base / Base Sepolia HTTP; server builds `https://base(-sepolia).g.alchemy.com/v2/...` */
  ALCHEMY_API_KEY: z.string().min(1).optional(),
  PRIVATE_KEY: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  VAULT_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  TREASURY_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  DAO_CONTRACT: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  STRATEGY_REGISTRY: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  CHAIN_ID: z.coerce.number().optional().default(8453),
  /** Hono API (default 3001; Vite dev UI is :8080 and proxies here). */
  PORT: z.coerce.number().optional().default(3001),
  /** ERC20 asset used for vault deposit (e.g. USDC on Base) */
  ASSET_TOKEN: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  ASSET_DECIMALS: z.coerce.number().optional().default(6),
  /** Comma-separated proposal ids for governance reads */
  PROPOSAL_IDS: z.string().optional().default("42,41,40,39"),
  CORS_ORIGIN: z.string().optional().default("http://localhost:8080"),
  /**
   * Public browser-facing API origin (no path). Used in GET /api/config for `usersPremium.url`
   * (GET /users/premium). Default matches production API host.
   */
  API_PUBLIC_ORIGIN: z
    .string()
    .url()
    .optional()
    .default("https://api.buildingculture.capital"),
  /** LearningAchievement contract; 0x0 disables mint endpoints */
  LEARNING_NFT_CONTRACT: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .optional()
    .default("0x0000000000000000000000000000000000000000"),
  /** Minimum vault savings (asset decimals) to mint Vault Patron (achievement type 4) */
  VAULT_PATRON_MIN_DEPOSIT: z.coerce.number().optional().default(100),
  /**
   * When true, server may call GovernanceDAO.setVotingPower after verified member actions
   * (quiz pass, wealth snapshot with min vault, vault patron NFT mint). Requires PRIVATE_KEY to be DAO owner.
   */
  DAO_VOTING_REWARDS_ENABLED: z.preprocess((v) => {
    if (v === undefined || v === null || v === "") return false;
    const t = String(v).trim().toLowerCase();
    return t === "1" || t === "true" || t === "yes";
  }, z.boolean()).default(false),
  /** wei-style uint256 increment for learning-route rewards (default ~0.01 voting weight) */
  DAO_REWARD_LEARN_WEI: z.string().regex(/^\d+$/).optional().default("10000000000000000"),
  /** increment when member meets min vault on snapshot / vault patron NFT (default ~0.05) */
  DAO_REWARD_VAULT_MEMBER_WEI: z.string().regex(/^\d+$/).optional().default("50000000000000000"),
  /**
   * Optional Binance API key (server-only — never add VITE_* or expose to browser).
   * Public klines work without a key; a key can improve rate-limit weight on some plans.
   */
  BINANCE_API_KEY: z.preprocess((v) => (v === "" || v == null ? undefined : String(v).trim()), z.string().min(1).optional()),
  /** Spot REST root (default mainnet). Testnet example: https://testnet.binance.vision */
  BINANCE_API_BASE: z.preprocess(
    (v) => {
      const s = typeof v === "string" ? v.trim() : "";
      return s.length > 0 ? s : "https://api.binance.com";
    },
    z.string().url(),
  ),
})
  .refine(
    (d) => Boolean(d.RPC_URL?.trim()) || Boolean(d.ALCHEMY_API_KEY?.trim()),
    {
      message: "Set RPC_URL and/or ALCHEMY_API_KEY (at least one is required for RPC).",
      path: ["RPC_URL"],
    },
  );

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error(
      "Invalid environment variables. Check RPC_URL or ALCHEMY_API_KEY, PRIVATE_KEY, and contract addresses.",
    );
  }
  cached = parsed.data;
  return cached;
}

/** Resolved HTTP RPC URL for viem (Alchemy when key is set, else RPC_URL). */
export function getHttpRpcUrl(): string {
  const e = getEnv();
  const key = e.ALCHEMY_API_KEY?.trim();
  if (key) {
    const host = e.CHAIN_ID === 84532 ? "base-sepolia" : "base-mainnet";
    return `https://${host}.g.alchemy.com/v2/${key}`;
  }
  const url = e.RPC_URL?.trim();
  if (url) return url;
  throw new Error("No RPC URL configured (RPC_URL or ALCHEMY_API_KEY).");
}
