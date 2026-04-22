import { formatEther } from "viem";
import { governanceDaoAbi } from "../../src/contracts/abis.ts";
import { getPublicClient, getWalletClient } from "../lib/chain.js";
import { getEnv } from "../lib/env.js";
import { getDb } from "../lib/db.js";
import { contractAddresses } from "./addresses.js";
import { fetchVaultSavingsForAddress } from "./portfolio.js";

function normAddr(a: string) {
  return a.toLowerCase();
}

export function hasDaoVotingReward(address: string, rewardKey: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 AS x FROM dao_voting_rewards WHERE address = ? AND reward_key = ?")
    .get(normAddr(address), rewardKey) as { x: number } | undefined;
  return Boolean(row);
}

function recordDaoVotingReward(address: string, rewardKey: string, txHash: string) {
  getDb()
    .prepare(
      "INSERT INTO dao_voting_rewards (address, reward_key, tx_hash, created_at) VALUES (?, ?, ?, ?)",
    )
    .run(normAddr(address), rewardKey, txHash, new Date().toISOString());
}

export type DaoVotingRewardResult =
  | { status: "disabled" }
  | { status: "skipped"; reason: "already_granted" | "below_min_vault" }
  | { status: "granted"; txHash: string; newWeight: string; rewardKey: string }
  | { status: "failed"; message: string; rewardKey: string };

/**
 * Increments GovernanceDAO.votingPower for `account` by `incrementWei` once per `rewardKey`.
 * Server wallet must be the DAO contract owner.
 */
export async function tryGrantDaoVotingReward(
  account: `0x${string}`,
  rewardKey: string,
  incrementWei: bigint,
): Promise<DaoVotingRewardResult> {
  const env = getEnv();
  if (!env.DAO_VOTING_REWARDS_ENABLED) {
    return { status: "disabled" };
  }
  const addr = normAddr(account) as `0x${string}`;
  if (hasDaoVotingReward(addr, rewardKey)) {
    return { status: "skipped", reason: "already_granted" };
  }

  const publicClient = getPublicClient();
  const wallet = getWalletClient();
  const { dao } = contractAddresses();
  const signer = wallet.account;
  if (!signer) {
    return { status: "failed", message: "Server signer not configured", rewardKey };
  }

  try {
    const current = (await publicClient.readContract({
      address: dao,
      abi: governanceDaoAbi,
      functionName: "votingPower",
      args: [addr],
    })) as bigint;
    const next = current + incrementWei;
    const hash = await wallet.writeContract({
      address: dao,
      abi: governanceDaoAbi,
      functionName: "setVotingPower",
      args: [addr, next],
      chain: wallet.chain,
      account: signer,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      return { status: "failed", message: "Transaction reverted", rewardKey };
    }
    recordDaoVotingReward(addr, rewardKey, hash);
    return {
      status: "granted",
      txHash: hash,
      newWeight: formatEther(next),
      rewardKey,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { status: "failed", message: msg, rewardKey };
  }
}

export async function tryGrantLearnRouteReward(
  account: `0x${string}`,
  routeId: "rwa" | "authenticity" | "truth",
): Promise<DaoVotingRewardResult> {
  const wei = BigInt(getEnv().DAO_REWARD_LEARN_WEI);
  return tryGrantDaoVotingReward(account, `learn:${routeId}`, wei);
}

/** Optional second bump when the learner mints the on-chain credential NFT for that route. */
export async function tryGrantLearnCredentialNftReward(
  account: `0x${string}`,
  routeId: "rwa" | "authenticity" | "truth",
): Promise<DaoVotingRewardResult> {
  const wei = BigInt(getEnv().DAO_REWARD_LEARN_WEI);
  return tryGrantDaoVotingReward(account, `learn_credential:${routeId}`, wei);
}

/** Member has at least min vault savings (same threshold as Vault Patron NFT). */
export async function tryGrantVaultMemberReward(account: `0x${string}`): Promise<DaoVotingRewardResult> {
  const env = getEnv();
  const savings = await fetchVaultSavingsForAddress(account);
  if (savings < env.VAULT_PATRON_MIN_DEPOSIT) {
    return { status: "skipped", reason: "below_min_vault" };
  }
  const wei = BigInt(env.DAO_REWARD_VAULT_MEMBER_WEI);
  return tryGrantDaoVotingReward(account, "vault_member", wei);
}

export async function tryGrantVaultPatronNftReward(account: `0x${string}`): Promise<DaoVotingRewardResult> {
  const wei = BigInt(getEnv().DAO_REWARD_VAULT_MEMBER_WEI);
  return tryGrantDaoVotingReward(account, "vault_patron_nft", wei);
}
