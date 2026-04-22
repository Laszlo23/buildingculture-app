import { Link } from "react-router-dom";
import { Check, Lock, BookOpen, GraduationCap, Trophy, ArrowRight } from "lucide-react";
import { academyPaths } from "@/data/club";
import { learningRouteList } from "@/data/learningRoutes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const colorClass = {
  primary: "border-primary/30 text-primary",
  info: "border-info/30 text-info",
  gold: "border-gold/30 text-gold",
};

export const AcademyPage = () => {
  const totalDone = academyPaths.flatMap(p => p.modules).filter(m => m.done).length;
  const totalModules = academyPaths.flatMap(p => p.modules).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Web3 Academy</h1>
          <p className="text-muted-foreground text-sm mt-1">Learn, earn XP, unlock advanced strategies.</p>
        </div>
        <div className="flex items-center gap-2 glass rounded-xl px-4 py-2.5">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-sm">Progress</span>
          <span className="font-mono-num font-semibold">{totalDone}/{totalModules}</span>
        </div>
      </header>

      {/* Hero card */}
      <section className="glass-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-30" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-medium">
              <GraduationCap className="w-3.5 h-3.5" /> Season 3 · Live now
            </div>
            <h2 className="font-display text-2xl font-semibold">Learn Web3 wealth building, earn rewards</h2>
            <p className="text-muted-foreground text-sm max-w-xl">
              Complete learning paths to earn OSC rewards, XP, and unlock access to higher-yield vaults reserved for educated members.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <div className="font-mono-num font-bold text-xl text-primary">12</div>
              <div className="text-[10px] text-muted-foreground">Modules</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <div className="font-mono-num font-bold text-xl text-gold">2.1K</div>
              <div className="text-[10px] text-muted-foreground">Max XP</div>
            </div>
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
              <div className="font-mono-num font-bold text-xl text-info">50K</div>
              <div className="text-[10px] text-muted-foreground">OSC pool</div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Story journeys · earn credentials</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Three short narratives with a checkpoint quiz. Pass to unlock a soulbound learning NFT minted by the club server (gas sponsored).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {learningRouteList.map(route => (
            <Link
              key={route.id}
              to={route.path}
              className={cn(
                "glass-card p-5 flex flex-col gap-3 border transition hover:border-primary/40 group",
                route.accent === "gold" && "hover:shadow-[0_0_40px_-10px_hsl(var(--gold)/0.35)]",
                route.accent === "info" && "hover:shadow-[0_0_40px_-10px_hsl(var(--info)/0.35)]",
                route.accent === "primary" && "hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.35)]",
              )}
            >
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">NFT · {route.nftName}</div>
              <div className="font-display font-semibold text-lg leading-tight">{route.title}</div>
              <p className="text-sm text-muted-foreground flex-1">{route.subtitle}</p>
              <div className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                Start journey <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {academyPaths.map((path, idx) => (
          <div key={path.level} className="glass-card p-6 space-y-4 relative overflow-hidden group">
            <div className={cn(
              "absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity",
              path.color === "gold" && "bg-gold/30",
              path.color === "info" && "bg-info/30",
              path.color === "primary" && "bg-primary/30",
            )} />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] font-medium", colorClass[path.color as keyof typeof colorClass])}>
                  <BookOpen className="w-3 h-3" /> {path.level}
                </div>
                <div className="text-xs text-muted-foreground font-mono-num">
                  {path.modules.filter(m => m.done).length}/{path.modules.length}
                </div>
              </div>

              <div className="space-y-2">
                {path.modules.map((m, i) => (
                  <div key={i} className={cn(
                    "p-3 rounded-xl border bg-secondary/30 flex items-center gap-3 transition",
                    m.done ? "border-primary/30" : "border-border/60 hover:border-primary/30"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      m.done ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}>
                      {m.done ? <Check className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-tight">{m.name}</div>
                      <div className="text-[11px] text-muted-foreground">{m.duration}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-gold font-mono-num font-semibold">+{m.reward}</div>
                      <div className="text-[10px] text-muted-foreground">XP</div>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" className="w-full rounded-xl border-border/60">
                {path.modules.every(m => m.done) ? "Path complete" : "Continue learning"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
