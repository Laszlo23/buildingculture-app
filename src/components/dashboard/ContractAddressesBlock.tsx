import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { explorerAddressUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Entry = { label: string; address: string | null | undefined };

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

type Props = {
  chainId: number;
  entries: Entry[];
};

export function ContractAddressesBlock({ chainId, entries }: Props) {
  const [open, setOpen] = useState(false);
  const valid = entries.filter(e => e.address && e.address.startsWith("0x") && e.address.length === 42);

  if (valid.length === 0) return null;

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/20">
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-between px-4 py-3 h-auto rounded-xl"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm font-medium">Contract addresses (BaseScan)</span>
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </Button>
      {open && (
        <ul className="px-4 pb-4 space-y-2 border-t border-border/40 pt-3">
          {valid.map(e => (
            <li key={e.label} className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-muted-foreground">{e.label}</span>
              <a
                href={explorerAddressUrl(chainId, e.address!)}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "font-mono text-xs inline-flex items-center gap-1 text-primary hover:underline",
                )}
              >
                {shortAddr(e.address!)}
                <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
