import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WealthAchievementDto } from "@/lib/api";
import { Award, Lock } from "lucide-react";

const tierRing: Record<string, string> = {
  bronze: "border-amber-700/50 bg-amber-950/20",
  silver: "border-slate-400/50 bg-slate-900/30",
  gold: "border-yellow-500/50 bg-yellow-950/20",
  legend: "border-primary/60 bg-primary/10 shadow-glow",
};

export function AchievementBadges({ items }: { items: WealthAchievementDto[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((a) => (
        <Card
          key={a.id}
          className={cn(
            "relative overflow-hidden border p-4 transition-all",
            a.unlocked ? tierRing[a.tier ?? "bronze"] : "border-border/50 bg-secondary/10 opacity-60",
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                a.unlocked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {a.unlocked ? <Award className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{a.title}</span>
                {a.tier && a.unlocked && (
                  <Badge variant="outline" className="text-[9px] capitalize">
                    {a.tier}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-snug">{a.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
