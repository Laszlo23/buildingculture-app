import { Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  totalMembers: number | undefined;
  /** Count of active strategies in the blended portfolio (for “people like you” copy). */
  strategyCount: number;
  loading?: boolean;
};

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

/**
 * Minimal club identity: membership scale + social proof, not another KPI grid.
 */
export function ClubMemberPulse({ totalMembers, strategyCount, loading }: Props) {
  const n = totalMembers ?? 0;
  const hasMembers = n > 0;
  const diverse = Math.max(1, Math.min(strategyCount, 8));

  return (
    <div
      className={cn(
        "border-t border-b border-border/40 bg-primary/[0.04] px-4 py-3 sm:px-5",
        "text-center sm:text-left",
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 max-w-4xl mx-auto">
        <p className="text-[11px] sm:text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
          <Users className="w-3.5 h-3.5 text-primary/80 shrink-0" aria-hidden />
          <span>
            {loading && "Loading member snapshot…"}
            {!loading && hasMembers && (
              <>
                <span className="text-foreground/90 font-medium tabular-nums">{fmt(n)}</span> members saving on-chain
                <span className="text-muted-foreground"> · </span>
                <span>pool size grows with deposits</span>
              </>
            )}
            {!loading &&
              !hasMembers &&
              "Member totals sync from on-chain data as the pool grows — early members are building the graph with us."}
          </span>
        </p>
        <p className="text-[10px] sm:text-[11px] text-muted-foreground/90 flex items-center justify-center sm:justify-end gap-1.5 sm:shrink-0">
          <Sparkles className="w-3 h-3 text-gold/80 shrink-0" aria-hidden />
          <span>
            People like you: <span className="text-foreground/80">most spread across {diverse}+ strategies</span>
          </span>
        </p>
      </div>
    </div>
  );
}
