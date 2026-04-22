import { Link } from "react-router-dom";
import { ArrowRight, Clock, GraduationCap, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { getBinanceReferralUrl } from "@/config/referrals";
import { cn } from "@/lib/utils";

type Props = {
  walletConnected: boolean;
  /** Vault / savings balance from portfolio (same units as dashboard). */
  savings: number;
  portfolioLoading: boolean;
};

const steps = [
  "Connect wallet",
  "Add funds (ETH or USDC)",
  "Deposit into the vault",
] as const;

export function VaultBeginnerOnboarding({ walletConnected, savings, portfolioLoading }: Props) {
  const show = !walletConnected || savings <= 0;
  if (!show) return null;

  const binanceUrl = getBinanceReferralUrl();

  return (
    <section
      id="beginner-vault-onboarding"
      className="glass-card overflow-hidden border-primary/20 shadow-[0_0_0_1px_hsl(var(--primary)/0.08)]"
      aria-labelledby="beginner-vault-title"
    >
      <div className="relative px-5 py-5 sm:px-6 sm:py-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-gold/5 pointer-events-none" />
        <div className="relative space-y-4">
          <div className="flex flex-wrap items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h2 id="beginner-vault-title" className="font-display text-lg sm:text-xl font-semibold tracking-tight">
                Start your first on-chain savings
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                New to crypto? Follow these steps to begin.
              </p>
            </div>
          </div>

          {walletConnected && portfolioLoading ? (
            <p className="text-xs text-muted-foreground">Checking your vault balance…</p>
          ) : null}

          <ol className="space-y-2.5">
            {steps.map((label, i) => (
              <li key={label} className="flex gap-3 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/80 border border-border/60 text-xs font-semibold text-primary font-mono-num">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/90 pt-0.5 leading-snug">{label}</span>
              </li>
            ))}
          </ol>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5 shrink-0 text-primary/80" />
            <span>Setup takes about 2–3 minutes.</span>
          </div>

          <p className="flex items-start gap-2 text-xs text-muted-foreground border-l-2 border-primary/35 pl-3 py-0.5">
            <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/70" />
            <span>Your funds stay in your wallet until you deposit.</span>
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-1">
            {!walletConnected ? (
              <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                <WalletConnectButton disconnectedPrimary />
              </div>
            ) : (
              <Button className="rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow gap-2" asChild>
                <Link to="/vault?tab=deposit">
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
            <Button variant="outline" className="rounded-xl border-border/70" asChild>
              <Link to="/academy">Learn how it works</Link>
            </Button>
          </div>

          <p className="text-xs pt-1">
            <GraduationCap className="w-3.5 h-3.5 inline-block mr-1.5 text-gold align-text-bottom" />
            <span className="text-muted-foreground">New to DeFi? </span>
            <Link to="/academy" className="text-primary font-medium hover:underline">
              Start with Academy
            </Link>
          </p>

          <div
            className={cn(
              "rounded-xl border border-border/50 bg-secondary/25 px-3 py-3 space-y-1.5",
              "text-[11px] sm:text-xs text-muted-foreground leading-relaxed",
            )}
          >
            <div className="font-medium text-foreground/85 text-xs">Fund via exchange (optional)</div>
            <p>
              Create or top up a Binance account using the club referral link. Promotions and eligibility vary by
              region. The DAO may earn a referral benefit if you sign up through this link.
            </p>
            <a
              href={binanceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary font-medium hover:underline"
            >
              Open Binance referral offer
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
