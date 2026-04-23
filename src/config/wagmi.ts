import { createConfig, http } from "wagmi";
import { arbitrum, base, baseSepolia, optimism } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected } from "wagmi/connectors";

const alchemyKey = (import.meta.env.VITE_ALCHEMY_API_KEY as string | undefined)?.trim() ?? "";

function transport(chainId: number) {
  if (!alchemyKey) return http();
  if (chainId === 84532) return http(`https://base-sepolia.g.alchemy.com/v2/${alchemyKey}`);
  if (chainId === 8453) return http(`https://base-mainnet.g.alchemy.com/v2/${alchemyKey}`);
  return http();
}

/** Base family + L2s we deploy DAO/vault flows to; match server `CHAIN_ID` / `VITE_CHAIN_ID`. */
export const wagmiConfig = createConfig({
  chains: [base, baseSepolia, arbitrum, optimism],
  /**
   * Farcaster first: inside Warpcast / Farcaster Mini Apps the host wallet uses
   * the Mini App connector; injected covers normal browsers and extension wallets.
   */
  connectors: [farcasterMiniApp(), injected({ shimDisconnect: false })],
  transports: {
    [base.id]: transport(base.id),
    [baseSepolia.id]: transport(baseSepolia.id),
    [arbitrum.id]: transport(arbitrum.id),
    [optimism.id]: transport(optimism.id),
  },
});
