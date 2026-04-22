import { governanceDaoAbi } from "../../src/contracts/abis.ts";
import { getPublicClient } from "../lib/chain.js";
import { getEnv } from "../lib/env.js";
import { contractAddresses } from "./addresses.ts";
import { proposalMeta } from "../data/proposal-meta.ts";

export async function fetchProposals() {
  const publicClient = getPublicClient();
  const { dao } = contractAddresses();
  const env = getEnv();
  const ids = env.PROPOSAL_IDS.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const voteCalls = ids.map((id) => ({
    address: dao,
    abi: governanceDaoAbi,
    functionName: "proposalVotes" as const,
    args: [BigInt(id)],
  }));

  const results = await publicClient.multicall({ allowFailure: true, contracts: voteCalls });

  return ids.map((id, i) => {
    const meta = proposalMeta[id] ?? {
      title: `Proposal #${id}`,
      category: "Governance",
      status: "active" as const,
    };
    const row = results[i];
    let forVotes = 0;
    let againstVotes = 0;
    let abstainVotes = 0;
    if (row?.status === "success" && row.result) {
      const [a, f, ab] = row.result as [bigint, bigint, bigint];
      const total = a + f + ab;
      if (total > 0n) {
        againstVotes = Math.round(Number((a * 100n) / total));
        forVotes = Math.round(Number((f * 100n) / total));
        abstainVotes = Math.round(Number((ab * 100n) / total));
      }
    }
    const isActive = meta.status === "active";
    return {
      id: `OSC-${id}`,
      proposalId: id,
      title: meta.title,
      category: meta.category,
      forVotes,
      againstVotes,
      abstainVotes,
      quorum: 65,
      endsIn: meta.endsIn ?? "—",
      status: isActive ? "active" : meta.status === "passed" ? "passed" : "defeated",
    };
  });
}
