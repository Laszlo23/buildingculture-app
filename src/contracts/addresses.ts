/**
 * Public addresses for display in the browser (no secrets).
 * Prefer loading from /api/config in production so a single source of truth stays on the server.
 */
/** Canonical USDC on Base mainnet (used as UI default; curve also exposes `usdc()`). */
export const BASE_MAINNET_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;

function trimAddr(v: string | undefined): string | undefined {
  const t = v?.trim();
  if (!t || t === "0x0000000000000000000000000000000000000000") return undefined;
  return t;
}

export function getClientContractAddresses() {
  return {
    vault: import.meta.env.VITE_VAULT_CONTRACT as string | undefined,
    treasury: import.meta.env.VITE_TREASURY_CONTRACT as string | undefined,
    dao: import.meta.env.VITE_DAO_CONTRACT as string | undefined,
    strategyRegistry: import.meta.env.VITE_STRATEGY_REGISTRY as string | undefined,
    chainId: Number(import.meta.env.VITE_CHAIN_ID || 8453),
    /** VillaPocBondingCurve — optional; enables Reserves buy UI */
    villaBondingCurve: trimAddr(import.meta.env.VITE_VILLA_BONDING_CURVE_ADDRESS as string | undefined),
    /** Optional override for explorer labels; else read from contract */
    villaBondingUsdc: trimAddr(import.meta.env.VITE_VILLA_BONDING_USDC_ADDRESS as string | undefined),
  };
}
