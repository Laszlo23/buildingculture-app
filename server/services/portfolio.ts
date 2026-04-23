import { formatUnits } from "viem";
import { governanceDaoAbi, strategyRegistryAbi, treasuryAbi, vaultAbi } from "../../src/contracts/abis.ts";
import { getPublicClient, getSignerAddress } from "../lib/chain.js";
import { getEnv } from "../lib/env.js";
import { contractAddresses } from "./addresses.ts";
import { fetchRegistryRecentEvents } from "./registryActivity.ts";

const ZERO = 0n;
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

/** Canonical USDC on Base mainnet — deployments using another ERC20 still work but confuse members who bridged “USDC” elsewhere. */
const BASE_MAINNET_USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";

async function safeRead<T>(
  fn: () => Promise<T>,
): Promise<{ ok: true; value: T } | { ok: false }> {
  try {
    const value = await fn();
    return { ok: true, value };
  } catch {
    return { ok: false };
  }
}

/** Full portfolio read for any wallet (public wealth / leaderboards). */
export async function fetchPortfolioForAddress(account: `0x${string}`) {
  const publicClient = getPublicClient();
  const { vault, treasury, strategyRegistry, dao, assetToken } = contractAddresses();
  const env = getEnv();
  const warnings: string[] = [];

  const vaultBytecode = await safeRead(() => publicClient.getBytecode({ address: vault }));
  if (!vaultBytecode.ok || !vaultBytecode.value || vaultBytecode.value === "0x") {
    warnings.push(
      "VAULT_CONTRACT has no bytecode on this RPC — double-check VAULT_CONTRACT and CHAIN_ID (portfolio reads may be zero).",
    );
  }

  if (
    env.CHAIN_ID === 8453 &&
    assetToken.toLowerCase() !== ZERO_ADDR.toLowerCase() &&
    assetToken.toLowerCase() !== BASE_MAINNET_USDC.toLowerCase()
  ) {
    warnings.push(
      "This vault uses a custom ERC20 asset (see GET /api/config → assetToken), not canonical Base USDC. Only that token’s deposits into this SavingsVault count toward your balance here.",
    );
  }

  const core = await publicClient.multicall({
    allowFailure: true,
    contracts: [
      {
        address: vault,
        abi: vaultAbi,
        functionName: "balanceOf",
        args: [account],
      },
      {
        address: vault,
        abi: vaultAbi,
        functionName: "totalAssets",
        args: [],
      },
      {
        address: vault,
        abi: vaultAbi,
        functionName: "yieldEarned",
        args: [account],
      },
      {
        address: treasury,
        abi: treasuryAbi,
        functionName: "totalAssets",
        args: [],
      },
    ],
  });

  const balanceResult = core[0];
  const totalAssetsVaultResult = core[1];
  const yieldResult = core[2];
  const treasuryResult = core[3];

  let balanceWei =
    balanceResult.status === "success" ? (balanceResult.result as bigint) : ZERO;
  if (balanceResult.status !== "success") {
    const fb = await safeRead(() =>
      publicClient.readContract({
        address: vault,
        abi: vaultAbi,
        functionName: "balanceOf",
        args: [account],
      }),
    );
    if (fb.ok) {
      balanceWei = fb.value as bigint;
    } else {
      warnings.push(
        "Could not read vault balanceOf (multicall and direct read failed). Check VAULT_CONTRACT, ABI match, and RPC health.",
      );
    }
  }
  const totalAssetsVault =
    totalAssetsVaultResult.status === "success"
      ? (totalAssetsVaultResult.result as bigint)
      : ZERO;
  const yieldWei =
    yieldResult.status === "success" ? (yieldResult.result as bigint) : ZERO;
  const treasuryWei =
    treasuryResult.status === "success"
      ? (treasuryResult.result as bigint)
      : ZERO;

  /** Voting power: try getVotes(account, latest) — optional */
  const blockNumber = await publicClient.getBlockNumber();
  const votingPower = await safeRead(() =>
    publicClient.readContract({
      address: dao,
      abi: governanceDaoAbi,
      functionName: "getVotes",
      args: [account, blockNumber],
    }),
  );

  const strategyCountRes = await safeRead(() =>
    publicClient.readContract({
      address: strategyRegistry,
      abi: strategyRegistryAbi,
      functionName: "strategyCount",
    }),
  );
  const nStrategies = strategyCountRes.ok ? Number(strategyCountRes.value as bigint) : 7;

  const strategyIds = Array.from({ length: Math.min(nStrategies, 12) }, (_, i) => BigInt(i));

  const allocCalls = strategyIds.map((id) => ({
    address: strategyRegistry,
    abi: strategyRegistryAbi,
    functionName: "allocationBps" as const,
    args: [id],
  }));

  const manualTvlCalls = strategyIds.map((id) => ({
    address: strategyRegistry,
    abi: strategyRegistryAbi,
    functionName: "strategyTvl" as const,
    args: [id],
  }));

  const adapterCalls = strategyIds.map((id) => ({
    address: strategyRegistry,
    abi: strategyRegistryAbi,
    functionName: "strategyAdapter" as const,
    args: [id],
  }));

  const effectiveTvlCalls = strategyIds.map((id) => ({
    address: strategyRegistry,
    abi: strategyRegistryAbi,
    functionName: "effectiveStrategyTvl" as const,
    args: [id],
  }));

  const [allocResults, manualTvlResults, adapterResults, effectiveTvlResults, registryRecentEvents] =
    await Promise.all([
      publicClient.multicall({ allowFailure: true, contracts: allocCalls }),
      publicClient.multicall({ allowFailure: true, contracts: manualTvlCalls }),
      publicClient.multicall({ allowFailure: true, contracts: adapterCalls }),
      publicClient.multicall({ allowFailure: true, contracts: effectiveTvlCalls }),
      fetchRegistryRecentEvents(24),
    ]);

  const strategies = strategyIds.map((id, i) => {
    const allocBps =
      allocResults[i]?.status === "success"
        ? Number(allocResults[i].result as bigint)
        : 0;

    let tvlWei = ZERO;
    if (effectiveTvlResults[i]?.status === "success") {
      tvlWei = effectiveTvlResults[i].result as bigint;
    } else if (manualTvlResults[i]?.status === "success") {
      tvlWei = manualTvlResults[i].result as bigint;
    }

    const adapterRaw =
      adapterResults[i]?.status === "success"
        ? (adapterResults[i].result as string)
        : ZERO_ADDR;
    const hasAdapter =
      typeof adapterRaw === "string" &&
      adapterRaw.length > 0 &&
      adapterRaw.toLowerCase() !== ZERO_ADDR.toLowerCase();

    return {
      id: id.toString(),
      allocationBps: allocBps,
      tvl: formatUnits(tvlWei, env.ASSET_DECIMALS),
      tvlSource: hasAdapter ? ("adapter" as const) : ("manual" as const),
      adapterAddress: hasAdapter ? adapterRaw : null,
    };
  });

  const decimals = env.ASSET_DECIMALS;
  const totalSavings = Number(formatUnits(balanceWei, decimals));
  const yieldEarned = Number(formatUnits(yieldWei, decimals));
  const treasurySize = Number(formatUnits(treasuryWei, decimals));
  const vaultTvl = Number(formatUnits(totalAssetsVault, decimals));

  const govWeight = votingPower.ok
    ? Number(formatUnits(votingPower.value as bigint, 18)) || 1
    : 1;

  const metricSources = {
    totalSavings: "on-chain" as const,
    yieldEarned: "on-chain" as const,
    treasurySize: "on-chain" as const,
    vaultTotalAssets: "on-chain" as const,
    blendedApy: "placeholder" as const,
    governanceWeight: votingPower.ok ? ("on-chain" as const) : ("fallback" as const),
    strategyAllocationBps: "on-chain" as const,
    /** Manual owner feed or `adapter.totalAssets()` when wired — see per-strategy `tvlSource`. */
    strategyTvl: "registry" as const,
  };

  const keeperStack = {
    providers: ["Chainlink Automation", "Gelato"] as const,
    note:
      "Schedule harvests, NAV updates, and registry syncs with a dedicated keeper; every execution is a normal transaction you can trace on BaseScan.",
  };

  return {
    address: account,
    totalSavings,
    yieldEarned,
    treasurySize,
    vaultTotalAssets: vaultTvl,
    blendedApy: 0,
    governanceWeight: Math.min(Math.max(govWeight, 0.1), 100),
    strategies,
    chainId: env.CHAIN_ID,
    metricSources,
    registryRecentEvents,
    keeperStack,
    warnings,
  };
}

export async function fetchPortfolio() {
  return fetchPortfolioForAddress(getSignerAddress());
}

/** Vault `balanceOf` for an arbitrary address (e.g. Vault Patron NFT eligibility). */
export async function fetchVaultSavingsForAddress(account: `0x${string}`) {
  const publicClient = getPublicClient();
  const { vault } = contractAddresses();
  const env = getEnv();
  const balanceWei = await publicClient.readContract({
    address: vault,
    abi: vaultAbi,
    functionName: "balanceOf",
    args: [account],
  });
  return Number(formatUnits(balanceWei as bigint, env.ASSET_DECIMALS));
}
