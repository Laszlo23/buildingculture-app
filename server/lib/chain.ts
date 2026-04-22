import {
  createPublicClient,
  createWalletClient,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base, baseSepolia } from "viem/chains";
import { getEnv, getHttpRpcUrl } from "./env.js";

const chains = {
  8453: base,
  84532: baseSepolia,
} as const;

let publicClient: PublicClient | null = null;
let walletClient: WalletClient | null = null;
let accountAddress: `0x${string}` | null = null;

export function getChain() {
  const { CHAIN_ID } = getEnv();
  const chain = chains[CHAIN_ID as keyof typeof chains];
  if (!chain) {
    throw new Error(`Unsupported CHAIN_ID ${CHAIN_ID}. Use 8453 (Base) or 84532 (Base Sepolia).`);
  }
  return chain;
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
