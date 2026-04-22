import { formatUnits } from "viem";
import { governanceDaoAbi, strategyRegistryAbi, treasuryAbi, vaultAbi } from "../../src/contracts/abis.ts";
import { getPublicClient, getSignerAddress } from "../lib/chain.js";
import { getEnv } from "../lib/env.js";
import { contractAddresses } from "./addresses.ts";
import { fetchRegistryRecentEvents } from "./registryActivity.ts";

const ZERO = 0n;
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

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

export async function fetchPortfolio() {
  const publicClient = getPublicClient();
  const signer = getSignerAddress();
  const { vault, treasury, strategyRegistry, dao } = contractAddresses();
  const env = getEnv();

  const core = await publicClient.multicall({
    allowFailure: true,
    contracts: [
      {
        address: vault,
        abi: vaultAbi,
        functionName: "balanceOf",
        args: [signer],
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
        args: [signer],
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

  const balanceWei =
    balanceResult.status === "success" ? (balanceResult.result as bigint) : ZERO;
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

  /** Voting power: try getVotes(signer, latest) — optional */
  const blockNumber = await publicClient.getBlockNumber();
  const votingPower = await safeRead(() =>
    publicClient.readContract({
      address: dao,
      abi: governanceDaoAbi,
      functionName: "getVotes",
      args: [signer, blockNumber],
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
    address: signer,
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
  };
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
