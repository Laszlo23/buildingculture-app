import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Landmark, LineChart, Shield, Sparkles, Telescope, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPageSeo } from "@/lib/pageSeo";
import { cn } from "@/lib/utils";

type Phase = {
  quarter: string;
  title: string;
  summary: string;
  icon: typeof Landmark;
  ctas: { label: string; to: string }[];
  accent: "gold" | "primary" | "info";
};

const phases: Phase[] = [
  {
    quarter: "Q2 2026",
    title: "Transparency & contracts surface",
    summary:
      "Make verified addresses, reserves narrative, and governance entry points obvious for every new member — fewer surprises, faster trust.",
    icon: Shield,
    accent: "primary",
    ctas: [
      { label: "Transparency", to: "/transparency" },
      { label: "Contracts", to: "/contracts" },
    ],
  },
  {
    quarter: "Q2–Q3 2026",
    title: "RWA storytelling that matches on-chain reality",
    summary:
      "Expand education on what tokenized exposure actually settles on-chain vs what remains in legal and operational layers — aligned with Academy routes.",
    icon: Landmark,
    accent: "gold",
    ctas: [
      { label: "Reserves", to: "/reserves" },
      { label: "Academy", to: "/academy" },
    ],
  },
  {
    quarter: "Q3 2026",
    title: "Strategy catalog + portfolio clarity",
    summary:
      "Sharpen how strategies are described next to live portfolio views — emphasis on sources, assumptions, and member-appropriate disclaimers.",
    icon: LineChart,
    accent: "info",
    ctas: [
      { label: "Strategies", to: "/strategies" },
      { label: "Portfolio", to: "/portfolio" },
    ],
  },
  {
    quarter: "Q3–Q4 2026",
    title: "AI-assisted workflows (not “magic alpha”)",
    summary:
      "Ship assistant experiences that help members ask better questions and navigate complexity — without implying guaranteed outcomes or hidden edge.",
    icon: Sparkles,
    accent: "primary",
    ctas: [
      { label: "Community", to: "/community" },
      { label: "Agents", to: "/agents" },
    ],
  },
  {
    quarter: "Q4 2026",
    title: "Governance depth & participation",
    summary:
      "Lower the friction to read proposals, understand quorum, and participate when members are ready — culture + tooling together.",
    icon: Vote,
    accent: "gold",
    ctas: [
      { label: "DAO", to: "/dao" },
      { label: "Blog", to: "/blog" },
    ],
  },
  {
    quarter: "2027+",
    title: "Research & partner rails",
    summary:
      "Selective integrations where custody, reporting, and member experience stay aligned with the club’s transparency-first posture.",
    icon: Telescope,
    accent: "info",
    ctas: [{ label: "Vault", to: "/vault" }],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
};

export function PlatformRoadmapPage() {
  useEffect(() => {
    return setPageSeo({
      title: "Platform roadmap — RWA, AI-assisted strategies, growth | Onchain Savings Club",
      description:
        "Product roadmap: transparency-first onboarding, RWA education, strategy and portfolio clarity, AI-assisted workflows, and governance depth. Plans are directional, not guarantees.",
      canonicalPath: "/roadmap",
    });
  }, []);

  return (
    <div className="space-y-12 max-w-4xl">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <LineChart className="w-3.5 h-3.5" />
          Platform roadmap
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Where we’re headed</h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Directional phases for transparency, RWA education, strategy clarity, AI-assisted workflows, and governance —
          not a promise of shipping dates for every sub-feature. Educational framing; not financial advice.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="rounded-xl" asChild>
            <Link to="/blog">Read the blog</Link>
          </Button>
          <Button size="sm" variant="secondary" className="rounded-xl" asChild>
            <Link to="/strategies/backtest-roadmap">Engineering backtest roadmap</Link>
          </Button>
        </div>
      </header>

      <motion.ol
        className="relative space-y-6 pl-0 sm:pl-4"
        variants={container}
        initial="hidden"
        animate="show"
        aria-label="Roadmap phases"
      >
        <div
          className="absolute left-[11px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/50 via-border to-transparent sm:left-[19px]"
          aria-hidden
        />
        {phases.map((phase, i) => {
          const Icon = phase.icon;
          return (
            <motion.li key={phase.title} variants={item} className="relative pl-10 sm:pl-14">
              <span
                className={cn(
                  "absolute left-0 top-1 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border shadow-sm",
                  phase.accent === "gold" && "border-gold/40 bg-gold/15 text-gold",
                  phase.accent === "primary" && "border-primary/40 bg-primary/15 text-primary",
                  phase.accent === "info" && "border-info/40 bg-info/15 text-info",
                )}
              >
                <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden />
              </span>
              <div className="glass-card rounded-2xl border border-border/60 p-5 sm:p-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  <span>{phase.quarter}</span>
                  <span className="text-border">·</span>
                  <span>Phase {i + 1}</span>
                </div>
                <h2 className="font-display text-lg sm:text-xl font-semibold tracking-tight">{phase.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{phase.summary}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {phase.ctas.map(c => (
                    <Button key={c.to} size="sm" variant="secondary" className="rounded-xl" asChild>
                      <Link to={c.to}>{c.label}</Link>
                    </Button>
                  ))}
                </div>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </div>
  );
}
