import { parseAbiItem } from "viem";
import { getPublicClient } from "../lib/chain.js";
import { contractAddresses } from "./addresses.ts";

export type RegistryActivityRow =
  | {
      kind: "TvlUpdated";
      strategyId: string;
      blockNumber: string;
      txHash: string;
    }
  | {
      kind: "Allocated";
      strategyId: string;
      blockNumber: string;
      txHash: string;
    }
  | {
      kind: "StrategyAdapterSet";
      strategyId: string;
      adapter: string;
      blockNumber: string;
      txHash: string;
    };

/**
 * Recent StrategyRegistry events for transparency / automation log (limited block window).
 */
export async function fetchRegistryRecentEvents(limit = 24): Promise<RegistryActivityRow[]> {
  try {
    const publicClient = getPublicClient();
    const { strategyRegistry } = contractAddresses();
    const latest = await publicClient.getBlockNumber();
    const span = 30_000n;
    const fromBlock = latest > span ? latest - span : 0n;

    const logs = await publicClient.getLogs({
      address: strategyRegistry,
      events: [
        parseAbiItem("event TvlUpdated(uint256 indexed strategyId, uint256 tvl)"),
        parseAbiItem("event Allocated(uint256 indexed strategyId, uint256 bps)"),
        parseAbiItem("event StrategyAdapterSet(uint256 indexed strategyId, address adapter)"),
      ],
      fromBlock,
      toBlock: latest,
    });

    const rows: RegistryActivityRow[] = [];

    for (const log of logs) {
      const blockNumber = log.blockNumber?.toString() ?? "0";
      const txHash = log.transactionHash ?? "";
      if (log.eventName === "TvlUpdated" && log.args && typeof log.args === "object" && "strategyId" in log.args) {
        const a = log.args as { strategyId: bigint };
        rows.push({
          kind: "TvlUpdated",
          strategyId: a.strategyId.toString(),
          blockNumber,
          txHash,
        });
      } else if (log.eventName === "Allocated" && log.args && typeof log.args === "object" && "strategyId" in log.args) {
        const a = log.args as { strategyId: bigint };
        rows.push({
          kind: "Allocated",
          strategyId: a.strategyId.toString(),
          blockNumber,
          txHash,
        });
      } else if (
        log.eventName === "StrategyAdapterSet" &&
        log.args &&
        typeof log.args === "object" &&
        "strategyId" in log.args &&
        "adapter" in log.args
      ) {
        const a = log.args as { strategyId: bigint; adapter: `0x${string}` };
        rows.push({
          kind: "StrategyAdapterSet",
          strategyId: a.strategyId.toString(),
          adapter: a.adapter,
          blockNumber,
          txHash,
        });
      }
    }

    rows.sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber));
    return rows.slice(0, limit);
  } catch {
    return [];
  }
}
