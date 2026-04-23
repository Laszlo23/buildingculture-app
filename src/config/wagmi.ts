import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected } from "wagmi/connectors";

const alchemyKey = (import.meta.env.VITE_ALCHEMY_API_KEY as string | undefined)?.trim() ?? "";

function transport(chainId: number) {
  if (!alchemyKey) return http();
  const host = chainId === 84532 ? "base-sepolia" : "base-mainnet";
  return http(`https://${host}.g.alchemy.com/v2/${alchemyKey}`);
}

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  /**
   * Farcaster first: inside Warpcast / Farcaster Mini Apps the host wallet uses
   * the Mini App connector; injected covers normal browsers and extension wallets.
   */
  connectors: [farcasterMiniApp(), injected({ shimDisconnect: false })],
  transports: {
    [base.id]: transport(base.id),
    [baseSepolia.id]: transport(baseSepolia.id),
  },
});
