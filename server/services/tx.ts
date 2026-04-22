import { erc20Abi } from "viem";
import {
  BaseError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError,
} from "viem";
import { governanceDaoAbi, strategyRegistryAbi, vaultAbi } from "../../src/contracts/abis.ts";
import { getPublicClient, getWalletClient } from "../lib/chain.js";
import { getEnv } from "../lib/env.js";
import { contractAddresses } from "./addresses.ts";

export function serializeError(err: unknown): { message: string; code?: string } {
  if (err instanceof UserRejectedRequestError) {
    return { message: "Transaction was rejected.", code: "USER_REJECTED" };
  }
  if (err instanceof InsufficientFundsError) {
    return { message: "Insufficient funds for gas.", code: "INSUFFICIENT_FUNDS" };
  }
  if (err instanceof ContractFunctionRevertedError) {
    return {
      message: err.shortMessage || err.message,
      code: "CONTRACT_REVERT",
    };
  }
  if (err instanceof BaseError) {
    return { message: err.shortMessage || err.message, code: "VIEM" };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: String(err) };
}

export async function sendVaultWithdraw(amountWei: bigint) {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  const { vault } = contractAddresses();
  const account = wallet.account;
  if (!account) throw new Error("Wallet account missing");

  const hash = await wallet.writeContract({
    address: vault,
    abi: vaultAbi,
    functionName: "withdraw",
    args: [amountWei],
    chain: wallet.chain,
    account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash, status: receipt.status, chainId: getEnv().CHAIN_ID };
}

export async function sendVaultClaimYield() {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  const { vault } = contractAddresses();
  const account = wallet.account;
  if (!account) throw new Error("Wallet account missing");

  const hash = await wallet.writeContract({
    address: vault,
    abi: vaultAbi,
    functionName: "claimYield",
    chain: wallet.chain,
    account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash, status: receipt.status, chainId: getEnv().CHAIN_ID };
}

/** Approve asset token then vault.deposit (two transactions). */
export async function depositWithApprove(amountWei: bigint) {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  const { vault, assetToken } = contractAddresses();
  const account = wallet.account;
  if (!account) throw new Error("Wallet account missing");

  if (assetToken === "0x0000000000000000000000000000000000000000") {
    const hash = await wallet.writeContract({
      address: vault,
      abi: vaultAbi,
      functionName: "deposit",
      args: [amountWei],
      chain: wallet.chain,
      account,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return {
      txHash: hash,
      status: receipt.status,
      approvalTxHash: null as string | null,
      chainId: getEnv().CHAIN_ID,
    };
  }

  const approveHash = await wallet.writeContract({
    address: assetToken,
    abi: erc20Abi,
    functionName: "approve",
    args: [vault, amountWei],
    chain: wallet.chain,
    account,
  });
  await publicClient.waitForTransactionReceipt({ hash: approveHash });

  const depositHash = await wallet.writeContract({
    address: vault,
    abi: vaultAbi,
    functionName: "deposit",
    args: [amountWei],
    chain: wallet.chain,
    account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash: depositHash });
  return {
    txHash: depositHash,
    status: receipt.status,
    approvalTxHash: approveHash,
    chainId: getEnv().CHAIN_ID,
  };
}

export async function allocateStrategy(strategyId: bigint, bps: bigint) {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  const { strategyRegistry } = contractAddresses();
  const account = wallet.account;
  if (!account) throw new Error("Wallet account missing");

  const hash = await wallet.writeContract({
    address: strategyRegistry,
    abi: strategyRegistryAbi,
    functionName: "allocate",
    args: [strategyId, bps],
    chain: wallet.chain,
    account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash, status: receipt.status, chainId: getEnv().CHAIN_ID };
}

export async function castVote(proposalId: bigint, support: 0 | 1 | 2) {
  const wallet = getWalletClient();
  const publicClient = getPublicClient();
  const { dao } = contractAddresses();
  const account = wallet.account;
  if (!account) throw new Error("Wallet account missing");

  const hash = await wallet.writeContract({
    address: dao,
    abi: governanceDaoAbi,
    functionName: "vote",
    args: [proposalId, support],
    chain: wallet.chain,
    account,
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return { txHash: hash, status: receipt.status, chainId: getEnv().CHAIN_ID };
}
