import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ExternalLink, HeartHandshake, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  walletConnected: boolean;
  savings: number;
};

const beginnerSteps = [
  "What is a wallet? It is your account on Base — an address only you control.",
  "Get a wallet: install Coinbase Wallet or use the Base app, or connect a browser wallet you already use.",
  "Buy crypto: purchase ETH or USDC on an exchange, then withdraw to your wallet on Base.",
  "Move funds to Base: send to your wallet address and pick the Base network when withdrawing.",
  "Deposit here: connect, open Vault, confirm one deposit transaction — yield routes after that.",
] as const;

/** Official onboarding — no custody claim; user chooses provider. */
const CREATE_WALLET_URL = "https://www.coinbase.com/wallet/get-started";

export function CryptoBeginnerBridge({ walletConnected, savings }: Props) {
  const show = !walletConnected || savings <= 0;
  if (!show) return null;

  return (
    <section
      className={cn(
        "rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.07] via-card/90 to-primary/[0.06]",
        "px-4 py-4 sm:px-5 sm:py-5 shadow-sm",
      )}
      aria-labelledby="crypto-beginner-bridge-title"
    >
      <div className="flex flex-wrap items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/35 bg-gold/10 text-gold">
          <HeartHandshake className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h2
              id="crypto-beginner-bridge-title"
              className="font-display text-base sm:text-lg font-semibold tracking-tight text-foreground"
            >
              New to crypto? We&apos;ll guide you.
            </h2>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              You can start in a few minutes. No trading knowledge required.
            </p>
          </div>

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
            <Button className="rounded-xl gap-2" asChild>
              <a href={CREATE_WALLET_URL} target="_blank" rel="noopener noreferrer">
                Create a wallet
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </a>
            </Button>
            <Button variant="outline" className="rounded-xl border-border/70 gap-1.5" asChild>
              <Link to="/learn">
                <BookOpen className="h-3.5 w-3.5" />
                Learn the basics
                <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
            <Button type="button" variant="secondary" className="rounded-xl gap-1.5" disabled title="Short walkthrough coming soon">
              <PlayCircle className="h-3.5 w-3.5 opacity-70" />
              Watch 2-min demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
