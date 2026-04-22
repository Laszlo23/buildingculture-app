import { ExternalLink } from "lucide-react";
import { explorerAddressUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

type Entry = { label: string; address: string | null | undefined };

type Props = {
  chainId: number;
  entries: Entry[];
  className?: string;
  /** Smaller padding on very narrow screens */
  compact?: boolean;
};

export function VerifyOnChainStrip({ chainId, entries, className, compact }: Props) {
  const valid = entries.filter(e => e.address && e.address.startsWith("0x") && e.address.length === 42);

  if (valid.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-secondary/25",
        compact ? "p-3 sm:p-4" : "p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verify on-chain</p>
          <p className="text-sm text-foreground mt-0.5">Open core contracts on BaseScan — numbers above read from these addresses.</p>
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {valid.map(e => (
          <li key={e.label}>
            <a
              href={explorerAddressUrl(chainId, e.address!)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-background/40 px-3 py-2.5 text-sm hover:border-primary/40 transition-colors min-h-[44px]"
            >
              <span className="text-muted-foreground">{e.label}</span>
              <span className="font-mono text-xs text-primary inline-flex items-center gap-1">
                {e.address!.slice(0, 6)}…{e.address!.slice(-4)}
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
