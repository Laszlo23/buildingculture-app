import { getEnv } from "../lib/env.js";

export function contractAddresses() {
  const e = getEnv();
  return {
    vault: e.VAULT_CONTRACT as `0x${string}`,
    treasury: e.TREASURY_CONTRACT as `0x${string}`,
    dao: e.DAO_CONTRACT as `0x${string}`,
    strategyRegistry: e.STRATEGY_REGISTRY as `0x${string}`,
    assetToken: (e.ASSET_TOKEN ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
    assetDecimals: e.ASSET_DECIMALS,
    learningNft: (e.LEARNING_NFT_CONTRACT ?? "0x0000000000000000000000000000000000000000") as `0x${string}`,
  };
}
