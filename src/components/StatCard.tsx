import { cn } from "@/lib/utils";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  /** Short provenance hint, e.g. "On-chain" / "UI placeholder" */
  sourceHint?: string;
  delta?: number;
  icon?: LucideIcon;
  accent?: "primary" | "gold" | "info" | "warning";
  className?: string;
}

const accentMap = {
  primary: "from-primary/20 to-transparent text-primary",
  gold: "from-gold/20 to-transparent text-gold",
  info: "from-info/20 to-transparent text-info",
  warning: "from-warning/20 to-transparent text-warning",
};

export const StatCard = ({
  label,
  value,
  sub,
  sourceHint,
  delta,
  icon: Icon,
  accent = "primary",
  className,
}: StatCardProps) => (
  <div className={cn(
    "glass-card relative overflow-hidden p-5 group hover:border-primary/30 transition-all duration-300",
    className
  )}>
    <div className={cn("absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br blur-2xl opacity-60 group-hover:opacity-100 transition-opacity", accentMap[accent])} />
    <div className="relative space-y-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
          {label}
          {sourceHint && (
            <span className="ml-1.5 font-normal normal-case text-[10px] px-1.5 py-0.5 rounded-md bg-secondary/80 text-muted-foreground">
              {sourceHint}
            </span>
          )}
        </span>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br", accentMap[accent])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="font-display font-mono-num text-3xl font-semibold tracking-tight">
        {value}
      </div>
      <div className="flex items-center gap-2 text-xs">
        {delta !== undefined && (
          <span className={cn(
            "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md font-mono-num font-medium",
            delta >= 0 ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
          )}>
            {delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(delta).toFixed(2)}%
          </span>
        )}
        {sub && <span className="text-muted-foreground">{sub}</span>}
      </div>
    </div>
  </div>
);
