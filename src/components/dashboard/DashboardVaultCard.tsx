import { Link } from "react-router-dom";
import { Wallet, TrendingUp, PiggyBank, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const fmtMoney = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type Props = {
  vaultBalance: number;
  yieldEarned: number;
  claimableLabel: string;
  portfolioLoading: boolean;
  onClaimYield: () => void;
  claimPending: boolean;
};

export function DashboardVaultCard({
  vaultBalance,
  yieldEarned,
  claimableLabel,
  portfolioLoading,
  onClaimYield,
  claimPending,
}: Props) {
  return (
    <div className="glass-card p-6 lg:p-8 relative overflow-hidden border-primary/25">
      <div className="absolute inset-0 bg-gradient-glow opacity-25 pointer-events-none" />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            Member vault
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Your on-chain savings hub</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            One vault routes deposits across DAO strategies. Balances reflect the connected API wallet position.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 lg:gap-8 w-full lg:w-auto">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              <Wallet className="w-3 h-3" /> Vault balance
            </div>
            <div className="font-mono-num text-xl font-semibold">
              {portfolioLoading ? "…" : fmtMoney(vaultBalance)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              <TrendingUp className="w-3 h-3" /> Yield earned
            </div>
            <div className="font-mono-num text-xl font-semibold text-gold">
              {portfolioLoading ? "…" : fmtMoney(yieldEarned)}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              <PiggyBank className="w-3 h-3" /> Claimable
            </div>
            <div className="font-mono-num text-xl font-semibold text-primary">
              {portfolioLoading ? "…" : claimableLabel}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:flex-col lg:min-w-[200px]">
          <Button className="rounded-xl bg-gradient-primary text-primary-foreground shadow-glow gap-2" asChild>
            <Link to="/vault?tab=deposit">
              <Wallet className="w-4 h-4" /> Deposit
            </Link>
          </Button>
          <Button variant="outline" className="rounded-xl border-border/80 gap-2" asChild>
            <Link to="/vault?tab=withdraw">Withdraw</Link>
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex w-full">
                  <Button variant="secondary" className="rounded-xl w-full" disabled type="button">
                    Auto-compound
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-xs">
                  Coming soon — compounding will be governed by DAO parameters. No contract action yet.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="outline"
            className="rounded-xl gap-2"
            onClick={onClaimYield}
            disabled={claimPending}
          >
            {claimPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Claim yield
          </Button>
        </div>
      </div>
    </div>
  );
}
