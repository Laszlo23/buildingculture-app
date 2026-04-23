import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code2, ExternalLink, Heart, Layers, Sparkles } from "lucide-react";
import { chainPartners, openSourceShouts } from "@/data/ecosystemPartners";
import { Button } from "@/components/ui/button";
import { setPageSeo } from "@/lib/pageSeo";
import { cn } from "@/lib/utils";

const accentCard: Record<string, string> = {
  eth: "border-indigo-400/25 bg-gradient-to-br from-indigo-500/10 via-card to-transparent hover:border-indigo-400/40",
  base: "border-primary/30 bg-gradient-to-br from-primary/12 via-card to-transparent hover:border-primary/45",
  arb: "border-sky-400/25 bg-gradient-to-br from-sky-500/10 via-card to-transparent hover:border-sky-400/40",
  op: "border-red-400/20 bg-gradient-to-br from-red-500/10 via-card to-transparent hover:border-red-400/35",
  poly: "border-violet-400/25 bg-gradient-to-br from-violet-500/10 via-card to-transparent hover:border-violet-400/40",
  fc: "border-purple-400/25 bg-gradient-to-br from-purple-500/10 via-card to-transparent hover:border-purple-400/40",
  neutral: "border-border/60 bg-secondary/20 hover:border-primary/30",
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 28 } },
};

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export function EcosystemPage() {
  useEffect(() => {
    return setPageSeo({
      title: "Ecosystem partners & thanks — chains, L2s, builders | Onchain Savings Club",
      description:
        "Thank you to Ethereum, Base, Arbitrum, Optimism, Polygon, Farcaster, and the open-source stacks we build on. Community credit page — not a commercial partnership list.",
      canonicalPath: "/ecosystem",
    });
  }, []);

  return (
    <div className="space-y-12 max-w-5xl">
      <header className="space-y-4 relative">
        <Button variant="ghost" size="sm" className="rounded-xl -ml-2 mb-1" asChild>
          <Link to="/">← Dashboard</Link>
        </Button>
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Heart className="w-3.5 h-3.5" />
          Thank you
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight relative">
          Chains, L2s & the builders behind the curtain
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed relative">
          This club sits on open protocols and public goods energy. Nothing here is a paid endorsement — it is a sincere
          high-five to the teams who maintain the rails we ride, the rollups we deploy beside, and the libraries that keep
          our TypeScript honest when Solidity gets feisty.
        </p>
      </header>

      <section aria-labelledby="chains-heading" className="space-y-4">
        <div className="flex items-end gap-3">
          <Layers className="w-5 h-5 text-primary shrink-0" />
          <div>
            <h2 id="chains-heading" className="font-display text-xl font-semibold tracking-tight">
              Networks we love building with
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Multichain is a direction — today the app often defaults to Base; these are peers we respect on the map.
            </p>
          </div>
        </div>

        <motion.ul
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {chainPartners.map(p => (
            <motion.li key={p.id} variants={item}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "group flex h-full flex-col rounded-2xl border p-5 sm:p-6 transition-all duration-300",
                  "shadow-sm hover:shadow-md hover:-translate-y-0.5 motion-reduce:hover:translate-y-0",
                  accentCard[p.accent] ?? accentCard.neutral,
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">{p.thanks}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                </div>
                <span className="mt-4 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80">
                  {p.url.replace(/^https?:\/\//, "").split("/")[0]}
                </span>
              </a>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      <section
        aria-labelledby="oss-heading"
        className="rounded-2xl border border-border/60 bg-gradient-to-br from-secondary/40 via-card/90 to-primary/[0.04] p-6 sm:p-8 space-y-5"
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-gold" />
          <h2 id="oss-heading" className="font-display text-xl font-semibold tracking-tight">
            Open-source & tooling
          </h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          Shipping a vault UI without standing on giants would be rude. These projects saved us weeks and prevented at
          least a few embarrassing tweets.
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {openSourceShouts.map(s => (
            <li
              key={s.label}
              className="rounded-xl border border-border/50 bg-background/50 px-4 py-3 hover:border-primary/25 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-sm font-semibold">{s.label}</span>
                {s.url ? (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs font-medium inline-flex items-center gap-1 shrink-0"
                  >
                    Site <ExternalLink className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{s.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <aside className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gold/30 bg-gold/[0.06] px-5 py-4 sm:px-6">
        <Sparkles className="w-8 h-8 text-gold shrink-0" />
        <p className="text-sm text-foreground/90 leading-relaxed">
          <strong className="text-foreground">To every anon maintainer</strong> fixing typos in docs, answering Discord at
          3 a.m., and keeping testnets alive: you are the real layer zero. We will keep linking to explorers, publishing
          env keys we mean, and trying not to waste your work on vibes-only marketing.
        </p>
      </aside>

      <p className="text-[11px] text-muted-foreground leading-relaxed pb-4">
        Product and project names are trademarks of their respective owners. This page is community gratitude only, not an
        official partnership announcement unless separately disclosed.
      </p>
    </div>
  );
}
