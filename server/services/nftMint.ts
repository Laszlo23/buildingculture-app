import { learningAchievementAbi } from "../../src/contracts/abis.ts";
import { getPublicClient, getWalletClient } from "../lib/chain.js";
import { getEnv } from "../lib/env.js";
import { contractAddresses } from "./addresses.ts";

const ZERO = "0x0000000000000000000000000000000000000000";

const ACHIEVEMENT = {
  rwa: 1,
  authenticity: 2,
  truth: 3,
  vaultPatron: 4,
} as const;

export function achievementTypeForRoute(routeId: "rwa" | "authenticity" | "truth"): number {
  return ACHIEVEMENT[routeId];
}

export function achievementTypeVaultPatron(): number {
  return ACHIEVEMENT.vaultPatron;
}

export function learningNftConfigured(): boolean {
  const a = getEnv().LEARNING_NFT_CONTRACT?.toLowerCase();
  return Boolean(a && a !== ZERO);
}

export async function mintAchievement(to: `0x${string}`, achievementType: number) {
  if (!learningNftConfigured()) {
    throw new Error("Learning NFT contract is not configured (set LEARNING_NFT_CONTRACT).");
  }
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  const { learningNft } = contractAddresses();
  const account = wallet.account;
  if (!account) throw new Error("Wallet account missing");

  const hash = await wallet.writeContract({
    address: learningNft,
    abi: learningAchievementAbi,
    functionName: "mint",
    args: [to, achievementType],
    chain: wallet.chain,
    account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash, status: receipt.status, chainId: getEnv().CHAIN_ID };
}

export async function readHasAchievement(holder: `0x${string}`, achievementType: number): Promise<boolean> {
  if (!learningNftConfigured()) return false;
  const publicClient = getPublicClient();
  const { learningNft } = contractAddresses();
  return publicClient.readContract({
    address: learningNft,
    abi: learningAchievementAbi,
    functionName: "hasAchievement",
    args: [holder, achievementType],
  }) as Promise<boolean>;
}
