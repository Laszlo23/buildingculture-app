import { Trophy, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { levels } from "@/data/club";

interface LevelProgressProps {
  current: string;
  xp: number;
  xpToNext: number;
  compact?: boolean;
}

export const LevelProgress = ({ current, xp, xpToNext, compact }: LevelProgressProps) => {
  const idx = levels.findIndex(l => l.name === current);
  const tier = levels[idx];
  const next = levels[idx + 1];
  const pct = (xp / xpToNext) * 100;

  return (
    <div className={cn("glass-card p-5 relative overflow-hidden", compact && "p-4")}>
      <div className="absolute inset-0 bg-gradient-glow opacity-30 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Wealth club tier</div>
              <div className="font-display font-semibold text-lg leading-tight">{current}</div>
              {tier?.yieldBoostDisplay != null && (
                <div className="text-[11px] text-primary font-medium mt-0.5">
                  Yield boost (UI): {tier.yieldBoostDisplay}
                </div>
              )}
            </div>
          </div>
          {next && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Next</div>
              <div className="text-sm font-medium flex items-center gap-1 text-muted-foreground">
                <Lock className="w-3 h-3" />
                {next.name}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="h-2 rounded-full bg-secondary/60 overflow-hidden relative">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-transparent via-primary-glow/40 to-transparent bg-[length:200%_100%] animate-shimmer"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs font-mono-num">
            <span className="text-primary font-medium">{xp.toLocaleString()} XP</span>
            <span className="text-muted-foreground">{xpToNext.toLocaleString()} XP</span>
          </div>
        </div>

        {!compact && next && (
          <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Unlocks at next level:</span>
            <span className="text-primary font-medium">{next.perks[0]}</span>
          </div>
        )}
      </div>
    </div>
  );
};
