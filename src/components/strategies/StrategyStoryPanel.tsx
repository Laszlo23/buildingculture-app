import { motion } from "framer-motion";
import { BookOpen, Check, Lightbulb, Sparkles, X } from "lucide-react";
import { Link } from "react-router-dom";
import type { StrategyNarrative } from "@/data/strategyNarratives";
import { cn } from "@/lib/utils";

type ColorKey = "gold" | "info" | "primary" | "warning";

const accentStyles: Record<ColorKey, { ring: string; pro: string; glow: string }> = {
  gold: {
    ring: "from-gold/40 via-amber-500/20 to-transparent",
    pro: "border-gold/25 bg-gold/[0.06]",
    glow: "shadow-[0_0_60px_-20px_hsl(var(--gold)/0.35)]",
  },
  info: {
    ring: "from-sky-400/35 via-info/20 to-transparent",
    pro: "border-info/25 bg-info/[0.06]",
    glow: "shadow-[0_0_60px_-20px_hsl(200_90%_50%/0.25)]",
  },
  primary: {
    ring: "from-primary/45 via-emerald-500/15 to-transparent",
    pro: "border-primary/25 bg-primary/[0.06]",
    glow: "shadow-[0_0_60px_-20px_hsl(var(--primary)/0.3)]",
  },
  warning: {
    ring: "from-warning/40 via-orange-500/15 to-transparent",
    pro: "border-warning/25 bg-warning/[0.06]",
    glow: "shadow-[0_0_60px_-20px_hsl(var(--warning)/0.28)]",
  },
};

const fade = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

type Props = {
  narrative: StrategyNarrative;
  color: string;
};

export function StrategyStoryPanel({ narrative, color }: Props) {
  const c = accentStyles[(color as ColorKey) in accentStyles ? (color as ColorKey) : "primary"];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/[0.08] p-6 sm:p-8",
          "bg-gradient-to-br from-card/95 via-card/80 to-secondary/30",
          c.glow,
        )}
      >
        <div
          className={cn("pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-90", c.ring)}
          aria-hidden
        />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            <BookOpen className="h-3.5 w-3.5" />
            Story mode
          </div>
          <p className="font-display text-lg sm:text-xl font-semibold leading-snug text-gradient-primary">
            {narrative.tagline}
          </p>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            {narrative.story.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.section
        variants={fade}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="rounded-2xl border border-border/60 bg-secondary/20 p-6 sm:p-7 space-y-3"
      >
        <h2 className="font-display text-lg font-semibold flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          {narrative.roiTitle}
        </h2>
        <div className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
          {narrative.roiBody.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/90 border-t border-border/50 pt-3">
          Educational framing only — not personalized advice. Cross-check anything material on{" "}
          <Link to="/transparency" className="text-primary font-medium hover:underline">
            Transparency
          </Link>{" "}
          and in{" "}
          <Link to="/academy" className="text-primary font-medium hover:underline">
            Academy
          </Link>
          .
        </p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.section
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className={cn("rounded-2xl border p-5 sm:p-6 space-y-3", c.pro)}
        >
          <h3 className="font-display text-base font-semibold text-success flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            Pros
          </h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
            {narrative.pros.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success/80" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          variants={fade}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="rounded-2xl border border-destructive/20 bg-destructive/[0.04] p-5 sm:p-6 space-y-3"
        >
          <h3 className="font-display text-base font-semibold text-destructive/90 flex items-center gap-2">
            <X className="h-4 w-4 shrink-0" />
            Cons
          </h3>
          <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
            {narrative.cons.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive/60" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>

      <motion.aside
        variants={fade}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-primary/35 p-5 sm:p-6",
          "bg-gradient-to-br from-primary/[0.12] via-gold/[0.08] to-transparent",
        )}
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/20 blur-2xl" aria-hidden />
        <div className="relative flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/20 text-gold border border-gold/30">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">Pro tip</p>
            <p className="text-sm sm:text-base text-foreground/95 leading-relaxed font-medium">{narrative.proTip}</p>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
