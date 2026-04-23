import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Bot,
  FileText,
  GraduationCap,
  Landmark,
  Library,
  LineChart,
  Shield,
  Sparkles,
  Users,
  Vote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setPageSeo } from "@/lib/pageSeo";
import { learningRouteList } from "@/data/learningRoutes";

type Way = {
  title: string;
  blurb: string;
  to: string;
  icon: typeof Library;
  accent: "primary" | "gold" | "info";
};

const ways: Way[] = [
  {
    title: "Web3 Academy",
    blurb: "Structured modules, XP, and seasonal tracks — start or continue your core curriculum.",
    to: "/academy",
    icon: GraduationCap,
    accent: "primary",
  },
  {
    title: "Platform roadmap",
    blurb: "Directional phases for transparency, RWA education, and strategy clarity — read before you treat the UI as a promise.",
    to: "/roadmap",
    icon: Sparkles,
    accent: "gold",
  },
  {
    title: "Insights blog",
    blurb: "Longer notes on RWA framing, yield literacy, AI-assisted workflows, and transparency-first onboarding.",
    to: "/blog",
    icon: BookOpen,
    accent: "info",
  },
  {
    title: "AI agents",
    blurb: "Ask questions in plain language — use as a guide, not a substitute for your own research and risk checks.",
    to: "/agents",
    icon: Bot,
    accent: "primary",
  },
  {
    title: "Strategies catalog",
    blurb: "Read how each strategy is described next to live data — education alongside allocation context.",
    to: "/strategies",
    icon: LineChart,
    accent: "gold",
  },
  {
    title: "Reserves & real assets",
    blurb: "Understand how reserves and property narrative tie back to what you can verify on-chain vs off-chain.",
    to: "/reserves",
    icon: Landmark,
    accent: "info",
  },
  {
    title: "Transparency & contracts",
    blurb: "Verified addresses, disclosures, and links to explorers — the club’s “show your work” layer.",
    to: "/transparency",
    icon: Shield,
    accent: "primary",
  },
  {
    title: "DAO & governance",
    blurb: "Read proposals, quorum, and how participation works before you vote or delegate.",
    to: "/dao",
    icon: Vote,
    accent: "gold",
  },
  {
    title: "Community",
    blurb: "Learn from other members, office hours, and shared context — peer learning counts.",
    to: "/community",
    icon: Users,
    accent: "info",
  },
];

const accentRing = {
  primary: "border-primary/35 bg-primary/[0.07] hover:border-primary/50",
  gold: "border-gold/35 bg-gold/[0.06] hover:border-gold/50",
  info: "border-info/35 bg-info/[0.06] hover:border-info/50",
} as const;

export function LearnPage() {
  useEffect(() => {
    return setPageSeo({
      title: "Learning hub — education paths on the platform | Onchain Savings Club",
      description:
        "Every way to learn on the club: Academy modules, story journeys with quizzes, blog, AI agents, strategies, reserves, transparency, DAO, and community. Educational only — not financial advice.",
      canonicalPath: "/learn",
    });
  }, []);

  return (
    <div className="space-y-10 max-w-5xl">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Library className="w-3.5 h-3.5" />
          Learning hub
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">You&apos;re never too old to learn something new</h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Whether you&apos;re new to on-chain savings or revisiting a topic, use these paths in any order. Nothing here is
          personalized investment advice — it&apos;s education and transparency so you can ask better questions.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" className="rounded-xl" asChild>
            <Link to="/academy">
              Open Academy <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
          <Button size="sm" variant="secondary" className="rounded-xl" asChild>
            <Link to="/blog">Read the blog</Link>
          </Button>
        </div>
      </header>

      <section className="space-y-3" aria-labelledby="ways-heading">
        <h2 id="ways-heading" className="font-display text-lg font-semibold">
          Ways to learn on the platform
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Pick what fits your mood: deep modules, quick stories, long-form articles, or reading the rails next to your
          portfolio.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ways.map(way => {
            const Icon = way.icon;
            return (
              <Link
                key={way.title}
                to={way.to}
                className={cn(
                  "glass-card rounded-2xl border p-5 flex flex-col gap-3 transition-all duration-200 group",
                  accentRing[way.accent],
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border",
                      way.accent === "primary" && "border-primary/30 bg-primary/10 text-primary",
                      way.accent === "gold" && "border-gold/30 bg-gold/10 text-gold",
                      way.accent === "info" && "border-info/30 bg-info/10 text-info",
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display font-semibold text-base leading-tight">{way.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{way.blurb}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Go
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform motion-reduce:transform-none" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="journeys-heading">
        <h2 id="journeys-heading" className="font-display text-lg font-semibold">
          Story journeys (credential paths)
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Each journey is a few chapters plus a short quiz. Start any topic — you can pause and return later.
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {learningRouteList.map(route => (
            <li key={route.id}>
              <Link
                to={route.path}
                className="flex h-full flex-col rounded-xl border border-border/60 bg-secondary/20 p-4 hover:border-primary/35 hover:bg-secondary/35 transition-colors"
              >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {route.nftName}
                </span>
                <span className="font-display font-semibold text-sm mt-1">{route.title}</span>
                <span className="text-xs text-muted-foreground mt-2 flex-1 leading-relaxed">{route.subtitle}</span>
                <span className="text-xs text-primary font-medium mt-3 inline-flex items-center gap-1">
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/[0.08] via-card/80 to-gold/[0.05] p-6 sm:p-8"
        aria-labelledby="contracts-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="inline-flex items-center gap-2 text-primary">
              <FileText className="w-4 h-4 shrink-0" />
              <h2 id="contracts-heading" className="font-display font-semibold text-lg">
                Read the deployment manifest
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              When you&apos;re ready to go deeper than marketing copy, the contracts page lists ABIs and addresses so you
              can verify what the UI is talking about.
            </p>
          </div>
          <Button className="rounded-xl shrink-0" asChild>
            <Link to="/contracts">View contracts</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
