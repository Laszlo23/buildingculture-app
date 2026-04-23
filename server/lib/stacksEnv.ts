import { z } from "zod";

const boolish = z.preprocess((v) => {
  if (v === undefined || v === null || v === "") return false;
  const t = String(v).trim().toLowerCase();
  return t === "1" || t === "true" || t === "yes";
}, z.boolean());

const stacksSchema = z.object({
  STACKS_NETWORK: z.enum(["mainnet", "testnet"]),
  STACKS_HIRO_API_BASE: z.string().url().optional(),
  STACKS_ADDRESS: z.string().min(3),
  STACKS_MODE: z.enum(["delegate", "solo"]),
  STACKS_BTC_REWARD_ADDRESS: z.string().min(8),
  STACKS_DELEGATE_TO: z.string().optional(),
  STACKS_DELEGATE_MICRO_STX_MAX: z.coerce.bigint().optional(),
  STACKS_BALANCE_RESERVE_MICRO_STX: z.coerce.bigint().optional().default(5_000_000n),
  STACKS_SOLO_CYCLES: z.coerce.number().int().min(1).max(12).optional().default(1),
  STACKS_SIGNING_MODE: z.enum(["hot", "export"]),
  STACKS_SECRET_KEY: z.string().min(8).optional(),
  /** Compressed secp256k1 pub key hex (33 bytes) for `export` unsigned txs (multisig flow). */
  STACKS_SENDER_PUBLIC_KEY: z.string().min(8).optional(),
  STACKS_KEEPER_DRY_RUN: boolish.optional().default(false),
});

export type StacksConfig = z.infer<typeof stacksSchema> & {
  hiroResolvedBase: string;
};

let cached: StacksConfig | null | undefined;

function defaultHiroBase(network: "mainnet" | "testnet") {
  return network === "mainnet" ? "https://api.hiro.so" : "https://api.testnet.hiro.so";
}

/** Returns null when Stacks automation is disabled (default). Never throws for missing optional vars. */
export function getStacksConfig(): StacksConfig | null {
  if (cached !== undefined) return cached;
  const raw = process.env;
  const enabled =
    String(raw.STACKS_ENABLED ?? "")
      .trim()
      .toLowerCase() === "1" ||
    String(raw.STACKS_ENABLED ?? "")
      .trim()
      .toLowerCase() === "true";
  if (!enabled) {
    cached = null;
    return null;
  }
  const parsed = stacksSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[stacks] Invalid STACKS_* env:", parsed.error.flatten());
    throw new Error(
      "STACKS_ENABLED is set but STACKS_* variables are invalid. See deploy/docs/stacks-stacking.md",
    );
  }
  const d = parsed.data;
  if (d.STACKS_MODE === "delegate" && !d.STACKS_DELEGATE_TO?.trim()) {
    throw new Error("STACKS_MODE=delegate requires STACKS_DELEGATE_TO (pool operator Stacks address).");
  }
  if (d.STACKS_SIGNING_MODE === "hot" && !d.STACKS_SECRET_KEY?.trim()) {
    throw new Error("STACKS_SIGNING_MODE=hot requires STACKS_SECRET_KEY.");
  }
  if (d.STACKS_SIGNING_MODE === "export" && !d.STACKS_SENDER_PUBLIC_KEY?.trim()) {
    throw new Error("STACKS_SIGNING_MODE=export requires STACKS_SENDER_PUBLIC_KEY (compressed pubkey hex).");
  }
  const hiroResolvedBase = (d.STACKS_HIRO_API_BASE ?? defaultHiroBase(d.STACKS_NETWORK)).replace(/\/$/, "");
  cached = { ...d, hiroResolvedBase };
  return cached;
}

export function resetStacksConfigCache() {
  cached = undefined;
}
