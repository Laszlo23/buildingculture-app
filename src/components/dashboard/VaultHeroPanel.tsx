import { Link } from "react-router-dom";
import { Wallet, Loader2, Sparkles, ArrowLeftRight, PiggyBank, Repeat } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { userStats } from "@/data/club";
import heroMesh from "@/assets/hero-mesh.jpg";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SITE_TAGLINE } from "@/lib/siteTagline";

const fmtMoney = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Props = {
  vaultBalance: number;
  /** Lifetime yield — shown once, secondary to est. yearly. */
  yieldEarned: number;
  blendedApy: number;
  estYearlyYield: number;
  portfolioLoading: boolean;
  onClaimYield: () => void;
  claimPending: boolean;
  /** Set when nested inside {@link ProtocolCoreFrame} — avoids competing frames/borders. */
  embeddedInFrame?: boolean;
};

export function VaultHeroPanel({
  vaultBalance,
  yieldEarned,
  blendedApy,
  estYearlyYield,
  portfolioLoading,
  onClaimYield,
  claimPending,
  embeddedInFrame = false,
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden glass",
        embeddedInFrame
          ? "rounded-none border-0 shadow-none"
          : "rounded-3xl border border-primary/25",
      )}
    >
      <img
        src={heroMesh}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/85 to-background/95" />
      <div className="relative px-5 sm:px-8 lg:px-10 py-8 lg:py-10">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3 text-center">
          <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary text-xs">
            <Sparkles className="w-3 h-3 mr-1" /> Onchain Savings Club
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal">
            {userStats.level} member
          </Badge>
        </div>

        <h1 className="text-center font-display text-2xl sm:text-3xl font-semibold tracking-tight">Your vault</h1>
        <p className="text-center text-sm text-gradient-primary font-medium mt-2 max-w-md mx-auto leading-relaxed">
          {SITE_TAGLINE}
        </p>
        <p className="text-center text-xs text-muted-foreground/80 mt-1.5 max-w-lg mx-auto">
          Deposit. Earn yield. Automatically diversified.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-center">
          <div className="rounded-2xl bg-secondary/30 border border-border/50 p-4 sm:p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Vault balance</div>
            <div className="font-mono-num text-2xl sm:text-3xl font-semibold">
              {portfolioLoading ? "…" : fmtMoney(vaultBalance)}
            </div>
          </div>
          <div className="rounded-2xl bg-secondary/30 border border-border/50 p-4 sm:p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Blended APY</div>
            <div className="font-mono-num text-2xl sm:text-3xl font-semibold text-primary">
              {portfolioLoading ? "…" : `${blendedApy.toFixed(1)}%`}
            </div>
          </div>
          <div className="rounded-2xl bg-secondary/30 border border-border/50 p-4 sm:p-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Estimated yield (1y)</div>
            <div className="font-mono-num text-2xl sm:text-3xl font-semibold text-gold">
              {portfolioLoading ? "…" : fmtMoney(estYearlyYield)}
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          Lifetime yield: <span className="font-mono-num text-foreground/90">{portfolioLoading ? "…" : fmtMoney(yieldEarned)}</span>
        </p>

        <div className="mt-8 flex flex-col items-center gap-4">
          <Button
            size="lg"
            asChild
            className="w-full sm:w-auto min-w-[min(100%,20rem)] h-14 sm:h-16 text-base sm:text-lg font-semibold rounded-2xl px-12 sm:px-16 bg-gradient-primary text-primary-foreground shadow-[0_0_48px_-10px_hsl(152_76%_50%/0.55)] border border-primary/30 hover:opacity-95 gap-2.5"
          >
            <Link to="/vault?tab=deposit">
              <Wallet className="w-5 h-5" /> Deposit into vault
            </Link>
          </Button>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button size="sm" variant="outline" asChild className="rounded-xl border-border/60 gap-1.5 h-9">
              <Link to="/vault?tab=withdraw">
                <ArrowLeftRight className="w-3.5 h-3.5" /> Withdraw
              </Link>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onClaimYield}
              disabled={claimPending}
              className="rounded-xl gap-1.5 h-9"
            >
              {claimPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PiggyBank className="w-3.5 h-3.5" />}
              Claim yield
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button size="sm" variant="secondary" className="rounded-xl gap-1.5 h-9" disabled type="button">
                      <Repeat className="w-3.5 h-3.5" /> Auto-compound
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs">Coming via DAO-governed parameters.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      {!embeddedInFrame && (
        <div className="relative border-t border-border/40 py-2 text-center text-[10px] text-muted-foreground">
          Club pulse and protocol readout are grouped below your vault
        </div>
      )}
    </motion.section>
  );
}
