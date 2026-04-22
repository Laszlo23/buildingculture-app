/**
 * Static disclosure for strategy detail: registry index matches order in [src/data/club.ts](src/data/club.ts) `strategies`.
 * Optional `adapterAddress` can be filled after deployment; otherwise UI uses on-chain `strategyAdapter(id)` from portfolio.
 */
export const strategyRegistryIndexBySlug: Record<string, number> = {
  "real-estate": 0,
  "btc-mining": 1,
  "ai-trading": 2,
  liquidity: 3,
  staking: 4,
  art: 5,
  structured: 6,
};

export function disclosureForRegistryIndex(index: number): string {
  const lines: Record<number, string> = {
    0:
      "Real-asset sleeve: TVL in the registry may be issuer-reported or adapter-based until treasury holds on-chain fund tokens. See Reserves for property disclosure.",
    1: "Mining sleeve: figures are registry-weighted; verify hashrate / pool contracts when linked.",
    2: "Strategy index for quant / AI sleeve: confirm mandate contracts before relying on APY display.",
    3: "Liquidity sleeve: typically LP or vault positions — link per-deployment vault contracts when available.",
    4: "Staking sleeve: restaking or liquid staking — verify LST or protocol addresses.",
    5: "Art / collectibles sleeve: often off-chain custody with on-chain claims or fund exposure.",
    6: "Structured products sleeve: confirm note or vault contract per issuance.",
  };
  return lines[index] ?? "Verify the strategy adapter and underlying contracts on BaseScan before sizing exposure.";
}
