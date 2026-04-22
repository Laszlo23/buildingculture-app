/**
 * Public addresses for display in the browser (no secrets).
 * Prefer loading from /api/config in production so a single source of truth stays on the server.
 */
export function getClientContractAddresses() {
  return {
    vault: import.meta.env.VITE_VAULT_CONTRACT as string | undefined,
    treasury: import.meta.env.VITE_TREASURY_CONTRACT as string | undefined,
    dao: import.meta.env.VITE_DAO_CONTRACT as string | undefined,
    strategyRegistry: import.meta.env.VITE_STRATEGY_REGISTRY as string | undefined,
    chainId: Number(import.meta.env.VITE_CHAIN_ID || 8453),
  };
}
