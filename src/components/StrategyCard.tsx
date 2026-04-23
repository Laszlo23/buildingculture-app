import { Link } from "react-router-dom";
import { getStrategyNarrative } from "@/data/strategyNarratives";
import { cn } from "@/lib/utils";
import {
  Building2, Bitcoin, Brain, Droplets, Layers, Palette, Boxes,
  TrendingUp, ArrowRight
} from "lucide-react";
import { RiskBadge } from "./RiskBadge";
import { Button } from "@/components/ui/button";

const iconMap = { Building2, Bitcoin, Brain, Droplets, Layers, Palette, Boxes };

const colorMap = {
  primary: { bg: "bg-primary/10", text: "text-primary", border: "hover:border-primary/40", glow: "from-primary/20" },
  gold: { bg: "bg-gold/10", text: "text-gold", border: "hover:border-gold/40", glow: "from-gold/20" },
  info: { bg: "bg-info/10", text: "text-info", border: "hover:border-info/40", glow: "from-info/20" },
  warning: { bg: "bg-warning/10", text: "text-warning", border: "hover:border-warning/40", glow: "from-warning/20" },
};

interface StrategyCardProps {
  strategy: {
    id: string;
    name: string;
    type: string;
    icon: string;
    apy: number;
    risk: string;
    riskScore: number;
    allocation: number;
    tvl: number;
    description: string;
    color: string;
    reservesLink?: string;
  };
}

export const StrategyCard = ({ strategy }: StrategyCardProps) => {
  const Icon = iconMap[strategy.icon as keyof typeof iconMap] ?? Building2;
  const c = colorMap[strategy.color as keyof typeof colorMap];
  const narrative = getStrategyNarrative(strategy.id);

  // Mini sparkline points
  const points = Array.from({ length: 24 }, (_, i) =>
    50 - Math.sin(i / 3 + strategy.allocation) * 15 - i * 0.8
  );
  const path = points.map((y, i) => `${i === 0 ? "M" : "L"} ${(i / 23) * 100} ${y}`).join(" ");

  return (
    <div className={cn("glass-card p-5 transition-all duration-300 group relative overflow-hidden", c.border)}>
      <div className={cn("absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-50 group-hover:opacity-90 transition-opacity bg-gradient-to-br", c.glow, "to-transparent")} />

      <div className="relative space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", c.bg, c.text)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base leading-tight">{strategy.name}</h3>
              <span className="text-xs text-muted-foreground">{strategy.type}</span>
              {narrative?.hook ? (
                <p className={cn("mt-1 text-[11px] font-semibold leading-snug", c.text)}>{narrative.hook}</p>
              ) : null}
            </div>
          </div>
          <RiskBadge risk={strategy.risk} score={strategy.riskScore} />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{strategy.description}</p>

        {strategy.reservesLink && (
          <Link
            to={strategy.reservesLink}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            See reserves
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}

        {/* Sparkline */}
        <div className="h-12 -mx-1">
          <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${strategy.id}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={`hsl(var(--${strategy.color === 'gold' ? 'gold' : strategy.color === 'info' ? 'info' : strategy.color === 'warning' ? 'warning' : 'primary'}))`} stopOpacity="0.4" />
                <stop offset="100%" stopColor={`hsl(var(--${strategy.color === 'gold' ? 'gold' : strategy.color === 'info' ? 'info' : strategy.color === 'warning' ? 'warning' : 'primary'}))`} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${path} L 100 60 L 0 60 Z`} fill={`url(#grad-${strategy.id})`} />
            <path d={path} fill="none" stroke={`hsl(var(--${strategy.color === 'gold' ? 'gold' : strategy.color === 'info' ? 'info' : strategy.color === 'warning' ? 'warning' : 'primary'}))`} strokeWidth="1.5" />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/60">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">APY</div>
            <div className={cn("font-mono-num font-semibold text-lg flex items-center gap-1", c.text)}>
              {strategy.apy.toFixed(1)}%
              <TrendingUp className="w-3 h-3" />
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Allocation</div>
            <div className="font-mono-num font-semibold text-lg">{strategy.allocation}%</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">TVL</div>
            <div className="font-mono-num font-semibold text-lg">${(strategy.tvl / 1_000_000).toFixed(2)}M</div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 font-semibold"
          asChild
        >
          <Link to={`/strategies/${strategy.id}`}>
            Read the story
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
};
