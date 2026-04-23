import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useConnectedPortfolio } from "@/hooks/useChainData";
import { explorerTxUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { StacksStackingStrip } from "@/components/dashboard/StacksStackingStrip";

const ROWS: Array<{ metric: string; source: string; detail: string }> = [
  {
    metric: "Total savings (your vault position)",
    source: "On-chain",
    detail: "Read via `SavingsVault.balanceOf(address)` in the API multicall (`GET /api/portfolio?address=` when connected).",
  },
  {
    metric: "Yield earned",
    source: "On-chain",
    detail: "`yieldEarned(account)` from the vault contract.",
  },
  {
    metric: "Treasury size",
    source: "On-chain",
    detail: "`ClubTreasury.totalAssets()` (or equivalent) from configured treasury address.",
  },
  {
    metric: "Vault TVL (aggregate)",
    source: "On-chain",
    detail: "`Vault.totalAssets()` — total assets under the vault contract.",
  },
  {
    metric: "Strategy allocation (bps)",
    source: "On-chain",
    detail: "`StrategyRegistry.allocationBps(strategyId)` — DAO/owner updates emit `Allocated`.",
  },
  {
    metric: "Strategy TVL",
    source: "Registry",
    detail:
      "`effectiveStrategyTvl(id)` uses a linked `IStrategyAdapter` when set; otherwise manual `strategyTvl` (owner-reported until adapters are wired).",
  },
  {
    metric: "Blended APY (dashboard header)",
    source: "Placeholder",
    detail: "API returns `0` until a verifiable APY source is wired on-chain.",
  },
  {
    metric: "Member count / treasury marketing figures",
    source: "Static / index",
    detail: "Some strips are placeholders until indexed from events or subgraph.",
  },
  {
    metric: "DAO real estate acquisition POC (Villa Ebreichsdorf)",
    source: "Club materials / roadmap",
    detail:
      "Funding targets, projected post-completion value, and tokenization copy on `/reserves` are narrative and design intent — not `ClubTreasury.totalAssets()` or other on-chain balances until a raise and legal closing are implemented.",
  },
  {
    metric: "Villa POC bonding curve (USDC → vEBR)",
    source: "On-chain when VITE_VILLA_BONDING_CURVE_ADDRESS is set",
    detail:
      "`VillaPocBondingCurve.buy(usdcBudget)` pulls USDC to the configured beneficiary and mints receipt tokens; not audited and unrelated to `ClubTreasury.totalAssets()`. If the env address is unset, no live curve is wired in this UI.",
  },
  {
    metric: "Solidity deployments (vault, treasury, DAO, registry, NFTs, villa POC)",
    source: "GET /api/config → contracts",
    detail:
      "The `/contracts` page lists every configured address with links to BaseScan. Server env may use `VILLA_POC_BONDING_CURVE` / `VILLA_POC_BONDING_USDC` or the mirrored `VITE_VILLA_*` keys.",
  },
];

export const TransparencyPage = () => {
  const { data: portfolio, isLoading } = useConnectedPortfolio();
  const chainId = portfolio?.chainId ?? 8453;
  const events = portfolio?.registryRecentEvents ?? [];
  const keeper = portfolio?.keeperStack;

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="space-y-2">
        <Button variant="ghost" size="sm" className="rounded-xl -ml-2 mb-2" asChild>
          <Link to="/">← Dashboard</Link>
        </Button>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Transparency</h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Where each number comes from, and a live feed of StrategyRegistry events so automation and manual updates stay
          inspectable on BaseScan.
        </p>
        <p className="text-sm">
          <Link to="/contracts" className="text-primary font-medium hover:underline">
            On-chain contract catalog
          </Link>{" "}
          <span className="text-muted-foreground">— every deployed club contract with BaseScan links.</span>
        </p>
        <p className="text-sm">
          <Link to="/ecosystem" className="text-primary font-medium hover:underline">
            Ecosystem thanks
          </Link>{" "}
          <span className="text-muted-foreground">
            — shout-outs to Ethereum, Base, L2 peers, Farcaster, and the open-source stacks we build on.
          </span>
        </p>
      </header>

      <section className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Automation & keepers</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {keeper?.note ??
            "Use a decentralized automation network so harvests and NAV updates are plain transactions, not hidden cron jobs."}
        </p>
        {keeper?.providers && (
          <p className="text-sm">
            <span className="text-muted-foreground">Suggested stacks: </span>
            {keeper.providers.join(" · ")}
          </p>
        )}
        <StacksStackingStrip />
      </section>

      <section className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60">
          <h2 className="font-display font-semibold">Data map</h2>
          <p className="text-xs text-muted-foreground mt-0.5">API `/api/portfolio` — how each field is sourced</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3 font-medium">Metric</th>
                <th className="p-3 font-medium">Source</th>
                <th className="p-3 font-medium min-w-[200px]">Detail</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(row => (
                <tr key={row.metric} className="border-b border-border/40 align-top">
                  <td className="p-3 text-foreground">{row.metric}</td>
                  <td className="p-3 whitespace-nowrap">{row.source}</td>
                  <td className="p-3 text-muted-foreground">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="glass-card p-6 space-y-3">
        <h2 className="font-display font-semibold text-lg">Registry activity (recent)</h2>
        <p className="text-xs text-muted-foreground">
          Parsed from `StrategyRegistry` logs (limited block window). {isLoading ? "Loading…" : `${events.length} events.`}
        </p>
        {events.length === 0 && !isLoading && (
          <p className="text-sm text-muted-foreground">No events in range, or RPC did not return logs.</p>
        )}
        <ul className="space-y-2 max-h-80 overflow-y-auto">
          {events.map((ev, i) => (
            <li
              key={`${ev.txHash}-${i}`}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-border/50 bg-secondary/20 px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-foreground">{ev.kind}</span>
                <span className="text-muted-foreground"> · strategy {ev.strategyId}</span>
                {"adapter" in ev && ev.adapter && (
                  <span className="block text-xs font-mono text-muted-foreground mt-0.5 truncate max-w-[280px]">
                    adapter: {ev.adapter}
                  </span>
                )}
                <span className="block text-[10px] text-muted-foreground">block {ev.blockNumber}</span>
              </div>
              {ev.txHash && (
                <a
                  href={explorerTxUrl(chainId, ev.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary shrink-0 min-h-[44px] sm:min-h-0"
                >
                  BaseScan
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
        Real-world assets: on-chain numbers reflect registry/treasury positions; land titles and SPVs remain in legal
        disclosure — see{" "}
        <Link to="/reserves" className="text-primary hover:underline">
          Reserves
        </Link>
        .
      </p>
    </div>
  );
};
