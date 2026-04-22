import { formatGwei } from "viem";
import type { Block } from "viem";
import type { PortfolioDto, ProtocolPulseDto, ProposalDto, TreasuryDto } from "@/lib/api";

function chainNameFromId(chainId: number): string {
  if (chainId === 84532) return "Base Sepolia";
  if (chainId === 8453) return "Base";
  return `chain ${chainId}`;
}

/**
 * Reconstructs a {@link ProtocolPulseDto} in the browser when `GET /api/protocol/pulse` is down but
 * portfolio/treasury/proposal queries still succeed. Uses the wallet RPC for the latest block when available.
 */
export function buildClientProtocolPulse(input: {
  portfolio: PortfolioDto;
  treasury: TreasuryDto | undefined;
  proposals: ProposalDto[];
  block: Block | null | undefined;
  chainNameFromConfig?: string | null;
}): ProtocolPulseDto {
  const p = input.portfolio;
  const nowSec = Math.floor(Date.now() / 1000);
  const block = input.block;
  const blockNumber = block?.number != null ? block.number.toString() : "0";
  const blockTs = block?.timestamp != null ? Number(block.timestamp) : nowSec;
  const blockAgeSeconds = block != null && block.timestamp != null ? Math.max(0, nowSec - blockTs) : 0;
  const baseFeeGwei =
    block?.baseFeePerGas != null ? formatGwei(block.baseFeePerGas) : null;

  const nStrat = p.strategies?.length ?? 0;
  const active = input.proposals.filter((x) => x.status === "active").length;
  const tr = input.treasury;

  const readOk = Number.isFinite(p.vaultTotalAssets) && p.vaultTotalAssets >= 0;
  const rpcLatencyMs = 0;

  let s = 55;
  s += 6;
  if (blockAgeSeconds < 30) s += 18;
  else if (blockAgeSeconds < 120) s += 12;
  else s += 6;
  s += Math.min(6, nStrat) * 2;
  if (!readOk) s = 0;
  const pulseScore = Math.min(100, Math.round(s));

  const name = input.chainNameFromConfig?.trim() || chainNameFromId(p.chainId);

  return {
    fetchedAt: new Date().toISOString(),
    rpcLatencyMs,
    chainId: p.chainId,
    chainName: name,
    blockNumber,
    blockHash: block?.hash != null ? (String(block.hash) as `0x${string}`) : null,
    blockTimestamp: new Date(blockTs * 1000).toISOString(),
    blockAgeSeconds,
    baseFeeGwei,
    vaultTvl: p.vaultTotalAssets,
    daoTreasury: tr != null && tr.totalTreasury != null ? tr.totalTreasury : p.treasurySize,
    strategyCount: nStrat,
    activeProposals: active,
    pulseScore,
    tagline:
      "Hono bundle unavailable — this view uses your wallet’s latest block plus the portfolio API. Run `npm run dev` and keep RPC in .env for the full server-timed pulse.",
    source: "client",
  };
}
