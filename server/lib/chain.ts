import {
  createPublicClient,
  createWalletClient,
  defineChain,
  http,
  type Chain,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { getEnv, getHttpRpcUrl } from "./env.js";

const builtInChains: Record<number, Chain> = {
  8453: base,
  84532: baseSepolia,
};

let publicClient: PublicClient | null = null;
let walletClient: WalletClient | null = null;
let accountAddress: `0x${string}` | null = null;
let cachedCustomChain: Chain | null = null;
let cachedCustomChainId: number | null = null;

/** Base, Base Sepolia, or a minimal chain profile from env for other EVM `CHAIN_ID`s (multichain). */
export function getChain(): Chain {
  const env = getEnv();
  const id = env.CHAIN_ID;
  const known = builtInChains[id];
  if (known) return known;

  if (cachedCustomChain && cachedCustomChainId === id) return cachedCustomChain;

  const rpcUrl = getHttpRpcUrl();
  const name = env.CHAIN_NAME?.trim() || `Chain ${id}`;
  const symbol = env.CHAIN_NATIVE_SYMBOL?.trim() || "ETH";
  const explorer = env.CHAIN_EXPLORER_URL?.trim();

  cachedCustomChain = defineChain({
    id,
    name,
    nativeCurrency: { name: symbol, symbol, decimals: 18 },
    rpcUrls: { default: { http: [rpcUrl] } },
    blockExplorers: explorer
      ? { default: { name: "Explorer", url: explorer } }
      : undefined,
  });
  cachedCustomChainId = id;
  return cachedCustomChain;
}

export function getPublicClient(): PublicClient {
  if (publicClient) return publicClient;
  const rpcUrl = getHttpRpcUrl();
  publicClient = createPublicClient({
    chain: getChain(),
    transport: http(rpcUrl),
  });
  return publicClient;
}

export function getWalletClient(): WalletClient {
  if (walletClient) return walletClient;
  const env = getEnv();
  const rpcUrl = getHttpRpcUrl();
  const account = privateKeyToAccount(env.PRIVATE_KEY as `0x${string}`);
  accountAddress = account.address;
  walletClient = createWalletClient({
    account,
    chain: getChain(),
    transport: http(rpcUrl),
  });
  return walletClient;
}

export function getSignerAddress(): `0x${string}` {
  if (accountAddress) return accountAddress;
  getWalletClient();
  return accountAddress!;
}
