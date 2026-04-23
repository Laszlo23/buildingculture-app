import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Clock,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  PlayCircle,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { getBinanceReferralUrl } from "@/config/referrals";
import { explorerAddressUrl } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  walletConnected: boolean;
  savings: number;
  portfolioLoading: boolean;
  chainId?: number;
  vaultAddress?: string | null;
};

const beginnerSteps = [
  "What is a wallet? It is your account on Base — an address only you control.",
  "Get a wallet: install Coinbase Wallet or use the Base app, or connect a browser wallet you already use.",
  "Buy crypto: purchase ETH or USDC on an exchange, then withdraw to your wallet on Base.",
  "Move funds to Base: send to your wallet address and pick the Base network when withdrawing.",
  "Deposit here: connect, open Vault, confirm one deposit transaction — yield routes after that.",
] as const;

const vaultSteps = ["Connect wallet", "Add funds (ETH or USDC)", "Deposit into the vault"] as const;

const CREATE_WALLET_URL = "https://www.coinbase.com/wallet/get-started";

export function DashboardBeginnerCard({
  walletConnected,
  savings,
  portfolioLoading,
  chainId = 8453,
  vaultAddress,
}: Props) {
  const show = !walletConnected || savings <= 0;
  if (!show) return null;

  const binanceUrl = getBinanceReferralUrl();

  return (
    <section
      className={cn(
        "glass-card relative overflow-hidden rounded-2xl",
        "border-primary/35 [box-shadow:var(--shadow-card),0_0_48px_-10px_hsl(var(--primary)/0.28),0_0_0_1px_hsl(var(--primary)/0.12),inset_0_1px_0_0_hsl(var(--primary)/0.08)]",
      )}
      aria-labelledby="dashboard-beginner-title"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl" aria-hidden>
        <div
          className={cn(
            "absolute inset-[-20%] opacity-70 motion-reduce:hidden",
            "bg-[length:200%_200%] animate-onboarding-aurora",
          )}
          style={{
            backgroundImage:
              "linear-gradient(118deg, hsl(var(--primary) / 0.42) 0%, transparent 38%, hsl(var(--gold) / 0.28) 52%, transparent 68%, hsl(170 80% 45% / 0.32) 85%, transparent 100%)",
          }}
        />
        <div
          className={cn(
            "absolute -left-[20%] -top-[40%] h-[95%] w-[65%] rounded-full",
            "bg-primary/25 blur-[72px] motion-reduce:hidden animate-onboarding-drift-a will-change-transform",
          )}
        />
        <div
          className={cn(
            "absolute -bottom-[35%] -right-[15%] h-[85%] w-[55%] rounded-full",
            "bg-gold/20 blur-[64px] motion-reduce:hidden animate-onboarding-drift-b will-change-transform",
          )}
        />
        <div
          className={cn(
            "absolute left-[30%] top-[20%] h-[50%] w-[45%] rounded-full",
            "bg-[hsl(var(--primary-glow)/0.18)] blur-[56px] motion-reduce:hidden animate-onboarding-drift-c will-change-transform",
          )}
        />
        <div className="absolute inset-0 grid-bg opacity-[0.14] motion-reduce:opacity-[0.08]" />
        <div className="absolute inset-0 bg-gradient-to-b from-card/20 via-transparent to-card/75" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-80" />
        <div className="absolute inset-0 hidden motion-reduce:block bg-gradient-mesh opacity-40" />
      </div>

      <div className="relative px-5 py-5 sm:px-6 sm:py-6 space-y-6">
        <div className="flex flex-wrap items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/35 flex items-center justify-center shrink-0 shadow-[0_0_24px_hsl(var(--primary)/0.25)] backdrop-blur-sm">
            <Sparkles className="w-5 h-5 text-primary motion-safe:animate-pulse" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2
              id="dashboard-beginner-title"
              className="font-display text-lg sm:text-xl font-semibold tracking-tight text-gradient-primary"
            >
              New here? Start your first on-chain savings
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Short wallet primer below, then connect and make one vault deposit when you are ready.
              {!walletConnected ? (
                <>
                  {" "}
                  Until you connect, vault numbers may reflect the club API account on Base, not your personal wallet.
                </>
              ) : null}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gold/20 bg-gradient-to-br from-gold/[0.06] via-card/50 to-primary/[0.04] px-4 py-4 space-y-3">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold">
              <HeartHandshake className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="font-display text-sm font-semibold text-foreground">Wallet and Base in five steps</p>
              <ol className="space-y-2">
                {beginnerSteps.map((text, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-sm text-foreground/90 leading-snug">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary/90 border border-border/60 text-[11px] font-semibold text-primary font-mono-num">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{text}</span>
                  </li>
                ))}
              </ol>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 pt-1">
                <Button className="rounded-xl gap-2" size="sm" asChild>
                  <a href={CREATE_WALLET_URL} target="_blank" rel="noopener noreferrer">
                    Create a wallet
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" />
                  </a>
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl border-border/70 gap-1.5" asChild>
                  <Link to="/learn">
                    <BookOpen className="h-3.5 w-3.5" />
                    Learn the basics
                    <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                  </Link>
                </Button>
                <Button type="button" variant="secondary" size="sm" className="rounded-xl gap-1.5" disabled title="Short walkthrough coming soon">
                  <PlayCircle className="h-3.5 w-3.5 opacity-70" />
                  Watch 2-min demo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {walletConnected && portfolioLoading ? (
          <p className="text-xs text-muted-foreground">Checking your vault balance…</p>
        ) : null}

        {walletConnected && !portfolioLoading && savings <= 0 && vaultAddress ? (
          <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border/70 pl-3">
            Still zero? The app calls the API with your connected address. Use the same wallet you deposited from, stay
            on Base, then verify on{" "}
            <a
              href={explorerAddressUrl(chainId, vaultAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              BaseScan (SavingsVault)
            </a>{" "}
            (Read contract → <span className="font-mono text-[11px]">balanceOf</span>).
          </p>
        ) : null}

        <div className="space-y-2.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Then in the app</p>
          <ol className="space-y-2.5">
            {vaultSteps.map((label, i) => (
              <li key={label} className="flex gap-3 items-start">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary/80 border border-border/60 text-xs font-semibold text-primary font-mono-num">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground/90 pt-0.5 leading-snug">{label}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5 shrink-0 text-primary/80" />
          <span>Setup takes about 2–3 minutes.</span>
        </div>

        <div
          className={cn(
            "rounded-xl border border-primary/30 bg-primary/[0.06] px-3.5 py-3 sm:px-4 space-y-2",
            "text-xs sm:text-sm text-muted-foreground leading-relaxed",
          )}
        >
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 shrink-0 mt-0.5 text-primary" aria-hidden />
            <div className="space-y-1.5">
              <p className="font-medium text-foreground/95">Your keys, your crypto</p>
              <p>
                Your funds stay in your wallet until you confirm a deposit. Moving savings into the vault requires a
                transaction you sign — the app cannot spend your assets without that approval.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 pt-1">
          {!walletConnected ? (
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <WalletConnectButton disconnectedPrimary disconnectedLabel="Start saving →" />
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
            Create or top up a Binance account using the club referral link. Promotions and eligibility vary by region.
            The DAO may earn a referral benefit if you sign up through this link.
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
    </section>
  );
}
