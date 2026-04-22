import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const alchemyKey = (import.meta.env.VITE_ALCHEMY_API_KEY as string | undefined)?.trim() ?? "";

function transport(chainId: number) {
  if (!alchemyKey) return http();
  const host = chainId === 84532 ? "base-sepolia" : "base-mainnet";
  return http(`https://${host}.g.alchemy.com/v2/${alchemyKey}`);
}

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  /** shimDisconnect false: fewer prompts; some wallets stall on wallet_requestPermissions */
  connectors: [injected({ shimDisconnect: false })],
  transports: {
    [base.id]: transport(base.id),
    [baseSepolia.id]: transport(baseSepolia.id),
  },
});
