import { formatGwei, formatUnits } from "viem";
import { getChain, getPublicClient } from "../lib/chain.js";
import { getEnv } from "../lib/env.js";
import { strategyRegistryAbi, treasuryAbi, vaultAbi } from "../../src/contracts/abis.ts";
import { contractAddresses } from "./addresses.ts";
import { fetchProposals } from "./governance.ts";

export type ProtocolPulseDto = {
  /** ISO time when the server finished assembling this snapshot (single “truth” moment). */
  fetchedAt: string;
  /** Wall-clock time for the RPC round-trip (multicall + block + proposals). */
  rpcLatencyMs: number;
  chainId: number;
  chainName: string;
  blockNumber: string;
  blockHash: `0x${string}` | null;
  blockTimestamp: string;
  blockAgeSeconds: number;
  baseFeeGwei: string | null;
  vaultTvl: number;
  daoTreasury: number;
  strategyCount: number;
  activeProposals: number;
  /** 0–100 “institutional pulse” — deterministic from reads, not a financial guarantee. */
  pulseScore: number;
  tagline: string;
};

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function computePulseScore(input: {
  rpcLatencyMs: number;
  blockAgeSeconds: number;
  strategyCount: number;
  readOk: boolean;
}): number {
  if (!input.readOk) return 0;
  let s = 55;
  if (input.rpcLatencyMs < 400) s += 15;
  else if (input.rpcLatencyMs < 1200) s += 10;
  else s += 5;
  if (input.blockAgeSeconds < 30) s += 18;
  else if (input.blockAgeSeconds < 120) s += 12;
  else s += 6;
  s += clamp(input.strategyCount, 0, 6) * 2;
  return Math.round(clamp(s, 0, 100));
}

export async function buildProtocolPulse(): Promise<ProtocolPulseDto> {
  const t0 = Date.now();
  const publicClient = getPublicClient();
  const env = getEnv();
  const { vault, treasury, strategyRegistry } = contractAddresses();
  const chain = getChain();
  const decimals = env.ASSET_DECIMALS;

  const block = await publicClient.getBlock({ blockTag: "latest" });
  const blockNumber = block.number;
  const nowSec = Math.floor(Date.now() / 1000);
  const blockTs = Number(block.timestamp);
  const blockAgeSeconds = Math.max(0, nowSec - blockTs);

  const baseFeeGwei =
    block.baseFeePerGas != null ? formatGwei(block.baseFeePerGas) : null;

  const multi = await publicClient.multicall({
    allowFailure: true,
    contracts: [
      { address: vault, abi: vaultAbi, functionName: "totalAssets", args: [] },
      { address: treasury, abi: treasuryAbi, functionName: "totalAssets", args: [] },
      { address: strategyRegistry, abi: strategyRegistryAbi, functionName: "strategyCount", args: [] },
    ],
  });

  const v0 = multi[0];
  const v1 = multi[1];
  const v2 = multi[2];

  const readOk = v0?.status === "success" && v1?.status === "success";
  const vaultWei = v0?.status === "success" ? (v0.result as bigint) : 0n;
  const treasWei = v1?.status === "success" ? (v1.result as bigint) : 0n;
  const nStrat = v2?.status === "success" ? Number(v2.result as bigint) : 0;

  const vaultTvl = Number(formatUnits(vaultWei, decimals));
  const daoTreasury = Number(formatUnits(treasWei, decimals));

  const proposals = await fetchProposals().catch(() => [] as { status: string }[]);
  const activeProposals = proposals.filter((p) => p.status === "active").length;

  const rpcLatencyMs = Date.now() - t0;
  const pulseScore = computePulseScore({
    rpcLatencyMs,
    blockAgeSeconds,
    strategyCount: nStrat,
    readOk,
  });

  return {
    fetchedAt: new Date().toISOString(),
    rpcLatencyMs,
    chainId: env.CHAIN_ID,
    chainName: chain.name,
    blockNumber: blockNumber.toString(),
    blockHash: block.hash ?? null,
    blockTimestamp: new Date(blockTs * 1000).toISOString(),
    blockAgeSeconds,
    baseFeeGwei,
    vaultTvl,
    daoTreasury,
    strategyCount: nStrat,
    activeProposals,
    pulseScore,
    tagline: "One RPC round-trip. One block height. The same read path your withdrawals use.",
    source: "api" as const,
  };
}
