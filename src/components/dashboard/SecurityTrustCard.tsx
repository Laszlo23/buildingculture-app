import { Shield, ExternalLink } from "lucide-react";
import { explorerAddressUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";

type Row = { label: string; detail: string; href: string | null; hrefLabel: string | null };

type Props = {
  chainId: number;
  /** Contract addresses; omit row if no address. */
  vault: string | null | undefined;
  strategyRegistry: string | null | undefined;
  dao: string | null | undefined;
  treasury: string | null | undefined;
};

const link = (chainId: number, addr: string) => explorerAddressUrl(chainId, addr);

export function SecurityTrustCard({ chainId, vault, strategyRegistry, dao, treasury }: Props) {
  const rows: Row[] = [
    {
      label: "Smart contract audit status",
      detail: "Use block explorers to verify deploy bytecode and Etherscan “contract” / audit tabs where published.",
      href: vault != null && vault ? link(chainId, vault) : null,
      hrefLabel: "Vault on explorer",
    },
    {
      label: "Multi-sig & treasury",
      detail: "Treasury and DAO executors are governed by the club; verify timelock / signers in contract UI.",
      href: treasury != null && treasury ? link(chainId, treasury) : null,
      hrefLabel: "Treasury",
    },
    {
      label: "Emergency controls",
      detail: "Check vault / registry roles for pausable modules and guardian address on the deployed contracts.",
      href: strategyRegistry != null && strategyRegistry ? link(chainId, strategyRegistry) : null,
      hrefLabel: "Registry",
    },
    {
      label: "Proof of reserves (oracle)",
      detail: "Full oracle feeds and reserve attestation are disclosed on the transparency page and roadmap.",
      href: dao != null && dao ? link(chainId, dao) : null,
      hrefLabel: "DAO",
    },
  ];
  return (
    <div className="glass-card p-5 sm:p-6 border border-border/50">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold">Security and transparency</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Serious DeFi: verify contracts, roles, and disclosures yourself — we surface direct explorer links, not hand-wavy
        “trust us” badges.
      </p>
      <ul className="space-y-3 text-sm">
        {rows.map((r) => (
          <li key={r.label} className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 border-b border-border/30 pb-3 last:border-0 last:pb-0">
            <div>
              <div className="font-medium text-foreground/95">{r.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5 pr-0 sm:pr-4">{r.detail}</div>
            </div>
            {r.href && (
              <Button variant="ghost" size="sm" className="h-8 text-xs text-primary shrink-0 self-start" asChild>
                <a href={r.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
                  {r.hrefLabel} <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
