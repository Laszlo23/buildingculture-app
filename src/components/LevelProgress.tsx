import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { levels } from "@/data/club";

interface LevelProgressProps {
  current: string;
  xp: number;
  xpToNext: number;
  compact?: boolean;
}

const tierShell: Record<number, string> = {
  0: "border-border/55",
  1: "border-sky-400/30 shadow-[0_0_28px_-12px_hsl(200_85%_50%/0.22)]",
  2: "border-violet-400/35 shadow-[0_0_28px_-12px_hsl(270_65%_55%/0.2)]",
  3: "border-amber-400/35 shadow-[0_0_32px_-10px_hsl(38_90%_50%/0.22)]",
  4: "border-amber-300/45 shadow-[0_0_40px_-8px_hsl(45_95%_55%/0.28)]",
};

const tierOrb: Record<number, string> = {
  0: "bg-gradient-primary",
  1: "bg-gradient-to-br from-sky-400 to-primary",
  2: "bg-gradient-to-br from-violet-500 to-primary",
  3: "bg-gradient-to-br from-amber-500 to-primary",
  4: "bg-gradient-to-br from-amber-300 via-gold to-amber-600",
};

export const LevelProgress = ({ current, xp, xpToNext, compact }: LevelProgressProps) => {
  const idx = Math.max(0, levels.findIndex(l => l.name === current));
  const tier = levels[idx];
  const next = levels[idx + 1];
  const pct = (xp / xpToNext) * 100;
  const shell = tierShell[idx] ?? tierShell[0];
  const orb = tierOrb[idx] ?? tierOrb[0];

  return (
    <div
      className={cn(
        "glass-card relative overflow-hidden p-5 ring-1 ring-white/[0.06]",
        compact && "p-4",
        shell,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-glow opacity-25" />
      <div className="relative">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-glow",
                orb,
              )}
            >
              <Trophy className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Member tier</div>
              <div className="font-display text-lg font-semibold leading-tight">{current}</div>
              {tier?.yieldBoostDisplay != null && (
                <div className="mt-0.5 text-[11px] font-medium text-primary">
                  Yield boost (UI): {tier.yieldBoostDisplay}
                </div>
              )}
            </div>
          </div>
          {next && (
            <div className="w-full shrink-0 rounded-xl border border-primary/30 bg-primary/[0.07] px-3 py-2.5 sm:max-w-[220px] sm:text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Next tier</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-base font-semibold sm:justify-end">
                <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {next.name}
              </div>
              <ul className="mt-2 space-y-0.5 text-left text-[11px] leading-snug text-muted-foreground sm:text-right">
                {next.perks.slice(0, 2).map(perk => (
                  <li key={perk} className="line-clamp-2">
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="relative h-2 overflow-hidden rounded-full bg-secondary/60">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-primary-glow/40 to-transparent bg-[length:200%_100%] motion-reduce:animate-none animate-shimmer",
                "motion-reduce:via-primary-glow/25",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-mono-num text-xs">
            <span className="font-medium text-primary">{xp.toLocaleString()} XP</span>
            <span className="text-muted-foreground">{xpToNext.toLocaleString()} XP</span>
          </div>
        </div>

        {!compact && next && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-4 text-xs">
            <span className="text-muted-foreground">Tier threshold</span>
            <span className="font-mono-num font-medium text-foreground">
              {next.min.toLocaleString()} XP → {next.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
