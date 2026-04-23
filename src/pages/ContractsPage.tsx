import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useChainConfig } from "@/hooks/useChainData";
import { explorerAddressUrl } from "@/lib/api";
import { buildDeployedContractCatalog } from "@/lib/deployedContracts";
import { Button } from "@/components/ui/button";

export const ContractsPage = () => {
  const { data: chainConfig, isLoading, isError } = useChainConfig();
  const chainId = chainConfig?.chainId ?? 8453;
  const rows = buildDeployedContractCatalog(chainConfig?.contracts);

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="space-y-2">
        <Button variant="ghost" size="sm" className="rounded-xl -ml-2 mb-2" asChild>
          <Link to="/">← Dashboard</Link>
        </Button>
        <h1 className="font-display text-3xl font-semibold tracking-tight">On-chain contracts</h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Deployed Base addresses returned by <span className="font-mono text-xs">GET /api/config</span> (
          <span className="font-mono text-xs">contracts</span>
          ). Open each row on BaseScan to read verified bytecode, holders, and events. Mocks in{" "}
          <span className="font-mono text-xs">contracts/mocks/</span> are for tests only and are not listed here.
        </p>
        <p className="text-xs text-muted-foreground">
          Configure server <span className="font-mono">.env</span> — see <span className="font-mono">.env.example</span>.
          Villa POC may use <span className="font-mono">VILLA_POC_BONDING_CURVE</span> or{" "}
          <span className="font-mono">VITE_VILLA_BONDING_CURVE_ADDRESS</span>.
        </p>
      </header>

      {isLoading && <p className="text-sm text-muted-foreground">Loading config…</p>}
      {isError && (
        <p className="text-sm text-destructive">Could not load API config. Start the API and check VITE_API_URL.</p>
      )}

      <section className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/60">
          <h2 className="font-display font-semibold">Contract catalog</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {chainConfig?.chainName ?? "Base"} · chain id {chainId}
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="p-3 font-medium">Contract</th>
                <th className="p-3 font-medium">Solidity / note</th>
                <th className="p-3 font-medium min-w-[140px]">Address</th>
                <th className="p-3 font-medium w-28">Explorer</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key} className="border-b border-border/40 align-top">
                  <td className="p-3">
                    <div className="font-medium text-foreground">{row.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">{row.description}</div>
                  </td>
                  <td className="p-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{row.solidity}</td>
                  <td className="p-3 font-mono text-[11px] text-foreground break-all max-w-[200px] sm:max-w-none">
                    {row.address ?? (
                      <span className="text-muted-foreground italic">Not set / invalid in config</span>
                    )}
                  </td>
                  <td className="p-3">
                    {row.linkable && row.address ? (
                      <a
                        href={explorerAddressUrl(chainId, row.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline min-h-[44px] sm:min-h-0"
                      >
                        BaseScan
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3">
        For how portfolio metrics map to these contracts, see{" "}
        <Link to="/transparency" className="text-primary hover:underline">
          Transparency
        </Link>
        .
      </p>
    </div>
  );
};
