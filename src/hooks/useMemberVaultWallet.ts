import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits, maxUint256, parseUnits } from "viem";
import { readContract, waitForTransactionReceipt, writeContract } from "viem/actions";
import { base, baseSepolia } from "wagmi/chains";
import {
  useChainId,
  useConnection,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWalletClient,
} from "wagmi";
import { toast } from "sonner";
import { vaultAbi } from "@/contracts/abis";
import { explorerTxUrl } from "@/lib/api";
import { erc20MinimalAbi } from "@/lib/erc20MinimalAbi";
import { qk, useChainConfig } from "@/hooks/useChainData";

const ZERO = "0x0000000000000000000000000000000000000000";

function isValidVaultAddr(a: string | null | undefined): a is `0x${string}` {
  return !!a && /^0x[a-fA-F0-9]{40}$/i.test(a);
}

function isNativeAssetToken(a: string | null | undefined): boolean {
  if (!a || !/^0x[a-fA-F0-9]{40}$/i.test(a)) return true;
  return a.toLowerCase() === ZERO;
}

function chainById(id: number) {
  return id === baseSepolia.id ? baseSepolia : base;
}

function toastTx(chainId: number, txHash: string, label: string) {
  const url = explorerTxUrl(chainId, txHash);
  toast.success(label, {
    description: `${txHash.slice(0, 10)}…${txHash.slice(-8)}`,
    duration: 8000,
    action: {
      label: "BaseScan",
      onClick: () => window.open(url, "_blank", "noopener,noreferrer"),
    },
  });
}

export type MemberVaultWalletPending = "approve" | "deposit" | "withdraw" | "claim" | null;

/**
 * Wallet-signed vault flows (approve + deposit, withdraw, claimYield).
 * When the API reports no ERC-20 asset (native vault), on-chain deposits from the browser are not supported here.
 */
export function useMemberVaultWallet() {
  const qc = useQueryClient();
  const { data: chainConfig } = useChainConfig();
  const { address, status } = useConnection();
  const chainId = useChainId();
  const { switchChainAsync } = useSwitchChain();

  const expectedChainId = chainConfig?.chainId ?? 8453;
  const targetChain = useMemo(() => chainById(expectedChainId), [expectedChainId]);
  const publicClient = usePublicClient({ chainId: expectedChainId });
  /** Prefer `useWalletClient` + `viem/actions` so writes work across connectors (some clients omit `.writeContract`). */
  const { data: walletClient } = useWalletClient({ chainId: expectedChainId });

  const vaultAddr = isValidVaultAddr(chainConfig?.contracts?.vault) ? chainConfig!.contracts.vault : undefined;
  const rawAsset = chainConfig?.contracts?.assetToken;
  const erc20Asset =
    rawAsset && isValidVaultAddr(rawAsset) && !isNativeAssetToken(rawAsset) ? (rawAsset as `0x${string}`) : undefined;
  const nativeVault = !erc20Asset;
  const decimals = chainConfig?.assetDecimals ?? 6;

  const [pending, setPending] = useState<MemberVaultWalletPending>(null);

  const wrongChain = status === "connected" && chainId !== expectedChainId;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: erc20Asset,
    abi: erc20MinimalAbi,
    functionName: "allowance",
    args: address && vaultAddr && erc20Asset ? [address as `0x${string}`, vaultAddr] : undefined,
    chainId: expectedChainId,
    query: { enabled: !!address && !!vaultAddr && !!erc20Asset },
  });

  const { data: walletTokenBalance, refetch: refetchWalletBalance } = useReadContract({
    address: erc20Asset,
    abi: erc20MinimalAbi,
    functionName: "balanceOf",
    args: address && erc20Asset ? [address as `0x${string}`] : undefined,
    chainId: expectedChainId,
    query: { enabled: !!address && !!erc20Asset },
  });

  const invalidateAfterVaultTx = useCallback(() => {
    void qc.invalidateQueries({ queryKey: qk.portfolio });
    void qc.invalidateQueries({ queryKey: qk.treasury });
    void qc.invalidateQueries({ queryKey: qk.pulse });
  }, [qc]);

  const switchToAppChain = useCallback(async () => {
    try {
      await switchChainAsync?.({ chainId: expectedChainId });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not switch network");
    }
  }, [expectedChainId, switchChainAsync]);

  const depositFromWallet = useCallback(
    async (amountStr: string): Promise<boolean> => {
      if (!walletClient || !address || !vaultAddr || !erc20Asset) {
        if (!walletClient) toast.error("Wallet not ready — try again in a moment.");
        return false;
      }
      if (wrongChain) {
        await switchToAppChain();
        toast.info("After switching to Base, confirm deposit again.");
        return false;
      }
      let amountWei: bigint;
      try {
        amountWei = parseUnits(amountStr.trim() || "0", decimals);
      } catch {
        toast.error("Invalid amount");
        return false;
      }
      if (amountWei <= 0n) {
        toast.error("Amount must be greater than zero");
        return false;
      }

      /** On-chain allowance — avoids skipping approve when React Query still has `undefined`. */
      let allowOnChain = allowance ?? 0n;
      if (publicClient) {
        try {
          allowOnChain = await readContract(publicClient, {
            address: erc20Asset,
            abi: erc20MinimalAbi,
            functionName: "allowance",
            args: [address as `0x${string}`, vaultAddr],
          });
        } catch {
          allowOnChain = allowance ?? 0n;
        }
      }

      const needApprove = allowOnChain < amountWei;
      try {
        if (needApprove) {
          setPending("approve");
          const approveHash = await writeContract(walletClient, {
            address: erc20Asset,
            abi: erc20MinimalAbi,
            functionName: "approve",
            args: [vaultAddr, maxUint256],
            chain: targetChain,
            account: address as `0x${string}`,
          });
          if (publicClient) await waitForTransactionReceipt(publicClient, { hash: approveHash });
          await refetchAllowance();
          if (publicClient) {
            allowOnChain = await readContract(publicClient, {
              address: erc20Asset,
              abi: erc20MinimalAbi,
              functionName: "allowance",
              args: [address as `0x${string}`, vaultAddr],
            });
            if (allowOnChain < amountWei) {
              toast.error("Allowance still below deposit amount. Wait a few seconds and try again.");
              return false;
            }
          }
        }

        setPending("deposit");
        const depositHash = await writeContract(walletClient, {
          address: vaultAddr,
          abi: vaultAbi,
          functionName: "deposit",
          args: [amountWei],
          chain: targetChain,
          account: address as `0x${string}`,
        });
        if (publicClient) await waitForTransactionReceipt(publicClient, { hash: depositHash });
        invalidateAfterVaultTx();
        await refetchWalletBalance();
        toastTx(expectedChainId, depositHash, "Deposit confirmed");
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Deposit failed");
        return false;
      } finally {
        setPending(null);
      }
    },
    [
      address,
      allowance,
      decimals,
      erc20Asset,
      expectedChainId,
      invalidateAfterVaultTx,
      publicClient,
      refetchAllowance,
      refetchWalletBalance,
      switchToAppChain,
      targetChain,
      vaultAddr,
      walletClient,
      wrongChain,
    ],
  );

  const withdrawFromWallet = useCallback(
    async (amountStr: string): Promise<boolean> => {
      if (!walletClient || !address || !vaultAddr) {
        if (!walletClient) toast.error("Wallet not ready — try again in a moment.");
        return false;
      }
      if (wrongChain) {
        await switchToAppChain();
        toast.info("After switching to Base, confirm withdraw again.");
        return false;
      }
      let amountWei: bigint;
      try {
        amountWei = parseUnits(amountStr.trim() || "0", decimals);
      } catch {
        toast.error("Invalid amount");
        return false;
      }
      if (amountWei <= 0n) {
        toast.error("Amount must be greater than zero");
        return false;
      }

      setPending("withdraw");
      try {
        const hash = await writeContract(walletClient, {
          address: vaultAddr,
          abi: vaultAbi,
          functionName: "withdraw",
          args: [amountWei],
          chain: targetChain,
          account: address as `0x${string}`,
        });
        if (publicClient) await waitForTransactionReceipt(publicClient, { hash });
        invalidateAfterVaultTx();
        toastTx(expectedChainId, hash, "Withdraw confirmed");
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Withdraw failed");
        return false;
      } finally {
        setPending(null);
      }
    },
    [
      address,
      decimals,
      expectedChainId,
      invalidateAfterVaultTx,
      publicClient,
      switchToAppChain,
      targetChain,
      vaultAddr,
      walletClient,
      wrongChain,
    ],
  );

  const claimYieldFromWallet = useCallback(async (): Promise<boolean> => {
    if (!walletClient || !address || !vaultAddr) {
      if (!walletClient) toast.error("Wallet not ready — try again in a moment.");
      return false;
    }
    if (wrongChain) {
      await switchToAppChain();
      toast.info("After switching to Base, confirm claim again.");
      return false;
    }
    setPending("claim");
    try {
      const hash = await writeContract(walletClient, {
        address: vaultAddr,
        abi: vaultAbi,
        functionName: "claimYield",
        args: [],
        chain: targetChain,
        account: address as `0x${string}`,
      });
      if (publicClient) await waitForTransactionReceipt(publicClient, { hash });
      invalidateAfterVaultTx();
      toastTx(expectedChainId, hash, "Yield claimed");
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Claim failed");
      return false;
    } finally {
      setPending(null);
    }
  }, [
    address,
    expectedChainId,
    invalidateAfterVaultTx,
    publicClient,
    switchToAppChain,
    targetChain,
    vaultAddr,
    walletClient,
    wrongChain,
  ]);

  const walletBalanceDisplay = useMemo(() => {
    if (walletTokenBalance == null) return "0";
    try {
      return formatUnits(walletTokenBalance as bigint, decimals);
    } catch {
      return "0";
    }
  }, [decimals, walletTokenBalance]);

  const connected = status === "connected" && !!address;
  const canUseVaultWallet = connected && !!vaultAddr;
  const canWalletDeposit = canUseVaultWallet && !!erc20Asset && !nativeVault;

  return {
    expectedChainId,
    targetChain,
    wrongChain,
    switchToAppChain,
    vaultAddr,
    erc20Asset,
    nativeVault,
    decimals,
    allowance,
    refetchAllowance,
    walletTokenBalance: walletTokenBalance as bigint | undefined,
    walletBalanceDisplay,
    refetchWalletBalance,
    pending,
    depositFromWallet,
    withdrawFromWallet,
    claimYieldFromWallet,
    connected,
    canUseVaultWallet,
    canWalletDeposit,
  };
}
