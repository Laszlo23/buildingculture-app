import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useConnection } from "wagmi";
import { Check, Lock, BookOpen, GraduationCap, Trophy, ArrowRight, Sparkles, TrainFront } from "lucide-react";
import { academyPaths } from "@/data/club";
import { learningRouteList, type LearningRouteId } from "@/data/learningRoutes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { chainApi } from "@/lib/api";
import { learningNftImageUrlForRoute } from "@/lib/nftCredentialArt";

const colorClass = {
  primary: "border-primary/30 text-primary",
  info: "border-info/30 text-info",
  gold: "border-gold/30 text-gold",
};

const journeyAccent = {
  primary: {
    hover: "hover:shadow-[0_0_44px_-12px_hsl(var(--primary)/0.4)] hover:-translate-y-0.5",
    doneRing: "ring-2 ring-primary/35 shadow-[0_0_32px_-8px_hsl(var(--primary)/0.25)]",
    doneBg: "bg-gradient-to-br from-primary/12 via-primary/[0.06] to-transparent",
  },
  info: {
    hover: "hover:shadow-[0_0_44px_-12px_hsl(var(--info)/0.35)] hover:-translate-y-0.5",
    doneRing: "ring-2 ring-sky-400/30 shadow-[0_0_32px_-8px_hsl(200_90%_50%/0.2)]",
    doneBg: "bg-gradient-to-br from-sky-500/10 via-info/[0.06] to-transparent",
  },
  gold: {
    hover: "hover:shadow-[0_0_44px_-12px_hsl(var(--gold)/0.4)] hover:-translate-y-0.5",
    doneRing: "ring-2 ring-amber-400/35 shadow-[0_0_32px_-8px_hsl(42_92%_50%/0.22)]",
    doneBg: "bg-gradient-to-br from-amber-500/12 via-gold/[0.06] to-transparent",
  },
} as const;

function StoryPathRing({ done, total }: { done: number; total: number }) {
  const r = 20;
  const stroke = 3;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0;
  const dash = (pct / 100) * c;
  return (
    <div className="flex items-center gap-3 shrink-0">
      <div className="relative h-[52px] w-[52px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r={r} fill="none" className="stroke-border/70" strokeWidth={stroke} />
          <circle
            cx="24"
            cy="24"
            r={r}
            fill="none"
            className="stroke-primary motion-safe:transition-[stroke-dashoffset] duration-700"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="font-mono-num text-[11px] font-bold text-primary">{total > 0 ? Math.round(pct) : 0}%</span>
        </div>
      </div>
      <div className="text-left min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Story paths</div>
        <div className="font-mono-num text-sm font-semibold text-foreground">
          {done}/{total}
        </div>
        <div className="text-[10px] text-muted-foreground">credentials</div>
      </div>
    </div>
  );
}

export const AcademyPage = () => {
  const { address } = useConnection();
  const { data: learningProgress } = useQuery({
    queryKey: ["learning", "progress", address] as const,
    queryFn: () => chainApi.getLearningProgress(address!),
    enabled: Boolean(address && /^0x[a-fA-F0-9]{40}$/i.test(address)),
  });

  const storyDone = learningRouteList.filter(
    r => learningProgress?.routes?.[r.id as LearningRouteId] != null,
  ).length;
  const totalStories = learningRouteList.length;

  const totalDone = academyPaths.flatMap(p => p.modules).filter(m => m.done).length;
  const totalModules = academyPaths.flatMap(p => p.modules).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Web3 Academy</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Learn, earn XP, unlock advanced strategies.{" "}
            <Link to="/learn" className="text-primary font-medium hover:underline underline-offset-4">
              All learning paths on the platform →
            </Link>
          </p>
        </div>
        <div
          className={cn(
            "flex items-center gap-4 rounded-2xl border border-primary/20 px-4 py-3",
            "bg-gradient-to-br from-secondary/60 via-card/90 to-primary/[0.06]",
            "[box-shadow:var(--shadow-card),0_0_36px_-12px_hsl(var(--primary)/0.15)]",
          )}
        >
          <StoryPathRing done={address ? storyDone : 0} total={totalStories} />
          <div className="h-10 w-px bg-border/60 hidden sm:block" aria-hidden />
          <div className="flex items-center gap-2 min-w-0">
            <Trophy className="w-4 h-4 text-gold shrink-0 motion-safe:animate-pulse" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Modules</div>
              <div className="font-mono-num font-semibold text-sm">
                {totalDone}/{totalModules}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero — animated backdrop */}
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/[0.08]",
          "shadow-[0_0_0_1px_hsl(var(--primary)/0.1),inset_0_1px_0_0_hsl(var(--primary)/0.06)]",
        )}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div
            className={cn(
              "absolute inset-[-15%] opacity-55 motion-reduce:hidden",
              "bg-[length:200%_200%] animate-onboarding-aurora",
            )}
            style={{
              backgroundImage:
                "linear-gradient(118deg, hsl(var(--primary) / 0.35) 0%, transparent 40%, hsl(var(--gold) / 0.22) 52%, transparent 70%, hsl(170 80% 45% / 0.28) 88%, transparent 100%)",
            }}
          />
          <div
            className={cn(
              "absolute -left-[15%] -top-[30%] h-[85%] w-[55%] rounded-full bg-primary/20 blur-[64px] motion-reduce:hidden animate-onboarding-drift-a",
            )}
          />
          <div
            className={cn(
              "absolute -bottom-[25%] -right-[10%] h-[70%] w-[50%] rounded-full bg-gold/15 blur-[56px] motion-reduce:hidden animate-onboarding-drift-b",
            )}
          />
          <div className="absolute inset-0 hidden motion-reduce:block bg-gradient-mesh opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
        </div>

        <div className="relative glass rounded-2xl border border-white/10 p-8 backdrop-blur-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 border border-primary/35 text-primary text-xs font-medium shadow-[0_0_20px_hsl(var(--primary)/0.15)]">
                <GraduationCap className="w-3.5 h-3.5" /> Season 3 · Live now
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-gradient-primary leading-tight">
                Train hard. Mint proof.
              </h2>
              <p className="text-muted-foreground text-sm max-w-xl leading-relaxed">
                Crush bite-size journeys, slam the quizzes, and flex soulbound credentials on Base — receipts that you
                did the work, not just the hype. XP, rewards, and sharper vault access follow the grind.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { v: "12", l: "Modules", cls: "text-primary" },
                { v: "2.1K", l: "Max XP", cls: "text-gold" },
                { v: "50K", l: "OSC pool", cls: "text-info" },
              ].map(cell => (
                <div
                  key={cell.l}
                  className="p-3 rounded-xl border border-border/50 bg-background/40 backdrop-blur-sm hover:border-primary/25 transition-colors"
                >
                  <div className={cn("font-mono-num font-bold text-xl", cell.cls)}>{cell.v}</div>
                  <div className="text-[10px] text-muted-foreground">{cell.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Story runs · soulbound receipts</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Three tight narratives + checkpoint quiz. Pass to mint your route art on-chain (gas sponsored). Truth
          Navigator is the finale — finish RWA + Authenticity first, then claim the chapter-three piece.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {learningRouteList.map(route => {
            const done = address ? learningProgress?.routes?.[route.id as LearningRouteId] != null : false;
            const acc = journeyAccent[route.accent];
            return (
              <Link
                key={route.id}
                to={route.path}
                className={cn(
                  "glass-card p-5 flex flex-col gap-3 border transition-all duration-300 group relative overflow-hidden",
                  acc.hover,
                  done
                    ? cn(acc.doneRing, acc.doneBg, "border-primary/40")
                    : "border-border/60 hover:border-primary/35",
                )}
              >
                {!done && (
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                      route.accent === "gold" && "bg-gradient-to-br from-gold/5 to-transparent",
                      route.accent === "info" && "bg-gradient-to-br from-sky-500/8 to-transparent",
                      route.accent === "primary" && "bg-gradient-to-br from-primary/8 to-transparent",
                    )}
                  />
                )}
                <div className="relative flex items-start gap-3">
                  <img
                    src={learningNftImageUrlForRoute(route.id)}
                    alt=""
                    className="h-11 w-11 shrink-0 rounded-lg object-cover border border-border/60 shadow-sm"
                    decoding="async"
                  />
                  <div className="min-w-0 flex-1 text-xs font-medium uppercase tracking-wider text-muted-foreground flex flex-wrap items-center justify-between gap-2">
                    <span>NFT · {route.nftName}</span>
                  {done ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/35 bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      Credential saved
                    </span>
                  ) : null}
                  </div>
                </div>
                <div className="relative font-display font-semibold text-lg leading-tight">{route.title}</div>
                <p className="relative text-sm text-muted-foreground flex-1">{route.subtitle}</p>
                <div className="relative inline-flex items-center gap-1 text-sm text-primary font-medium">
                  {done ? "Review" : "Start journey"}{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform motion-reduce:transform-none" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Bonus read · multichain lore</h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          No quiz or credential — a narrative tour from Bitcoin through XRP, Polygon, BNB Smart Chain, zkSync,
          Arbitrum, Optimism, and how Layer 2 communities feel like transit lines. Educational only.
        </p>
        <Link
          to="/learn/chain-relay"
          className={cn(
            "glass-card flex flex-col sm:flex-row sm:items-center gap-4 p-5 border transition-all duration-300 group overflow-hidden relative",
            "border-gold/30 bg-gradient-to-br from-gold/[0.07] via-card/80 to-primary/[0.05]",
            "hover:border-gold/45 hover:shadow-[0_0_40px_-12px_hsl(var(--gold)/0.28)] hover:-translate-y-0.5 motion-reduce:hover:transform-none",
          )}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold shadow-[0_0_24px_hsl(var(--gold)/0.2)]">
            <TrainFront className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="font-display font-semibold text-lg leading-tight">The Great Relay</div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              From the first block to today&apos;s L2 parade — names, vibes, and the champion energy that keeps the
              relay moving.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary shrink-0">
            Read story
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform motion-reduce:transform-none" />
          </span>
        </Link>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {academyPaths.map(path => (
          <div key={path.level} className="glass-card p-6 space-y-4 relative overflow-hidden group">
            <div
              className={cn(
                "absolute -top-12 -right-12 w-40 h-40 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity motion-reduce:transition-none",
                path.color === "gold" && "bg-gold/30",
                path.color === "info" && "bg-info/30",
                path.color === "primary" && "bg-primary/30",
              )}
            />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] font-medium",
                    colorClass[path.color as keyof typeof colorClass],
                  )}
                >
                  <BookOpen className="w-3 h-3" /> {path.level}
                </div>
                <div className="text-xs text-muted-foreground font-mono-num">
                  {path.modules.filter(m => m.done).length}/{path.modules.length}
                </div>
              </div>

              <div className="space-y-2">
                {path.modules.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-3 rounded-xl border flex items-center gap-3 transition",
                      m.done
                        ? "border-primary/35 bg-primary/[0.07] shadow-[inset_3px_0_0_0_hsl(var(--primary)/0.5)]"
                        : "border-border/60 bg-secondary/30 hover:border-primary/30",
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                        m.done ? "bg-primary text-primary-foreground shadow-glow" : "bg-secondary text-muted-foreground",
                      )}
                    >
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
