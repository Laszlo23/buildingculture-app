import { createConfig, http } from "wagmi";
import { arbitrum, base, baseSepolia, optimism } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { baseAccount, coinbaseWallet, injected } from "wagmi/connectors";

const alchemyKey = (import.meta.env.VITE_ALCHEMY_API_KEY as string | undefined)?.trim() ?? "";

const walletAppName = "Onchain Savings Club";

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
   * Order: Mini App host wallet → Base app embedded account → Coinbase Wallet SDK → browser injection.
   * Base app in-app browser needs `baseAccount()` (`@base-org/account`), not generic `injected()` alone.
   */
  connectors: [
    farcasterMiniApp(),
    baseAccount(),
    coinbaseWallet({
      appName: walletAppName,
      preference: "all",
    }),
    injected({ shimDisconnect: false }),
  ],
  transports: {
    [base.id]: transport(base.id),
    [baseSepolia.id]: transport(baseSepolia.id),
    [arbitrum.id]: transport(arbitrum.id),
    [optimism.id]: transport(optimism.id),
  },
});
