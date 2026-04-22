import { useMemo } from "react";
import { useAccount } from "wagmi";
import { Copy, Share2, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useReferralStats } from "@/hooks/useReferral";
import { cn } from "@/lib/utils";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

const origin = () =>
  typeof window !== "undefined" ? window.location.origin.replace(/\/$/, "") : "";

export function InviteEarnCard({ className }: { className?: string }) {
  const { address, isConnected } = useAccount();
  const { data, isLoading, isError } = useReferralStats(address);

  const link = useMemo(() => {
    if (!address) return "";
    return `${origin()}/invite/${address.toLowerCase()}`;
  }, [address]);

  const copy = () => {
    if (!link) return;
    void navigator.clipboard.writeText(link);
    toast.success("Referral link copied");
  };

  const share = async () => {
    if (!link) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Onchain Savings Club", text: "Join my savings club. Earn more yield together.", url: link });
      } else {
        void navigator.clipboard.writeText(link);
        toast.success("Link copied for sharing");
      }
    } catch {
      /* user cancelled */
    }
  };

  if (!isConnected) return null;

  return (
    <div className={cn("glass-card p-5 sm:p-6 border border-primary/15 relative overflow-hidden", className)}>
      <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary font-medium flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5" /> Invite and earn
            </p>
            <h3 className="font-display text-lg font-semibold mt-1">Invite friends. Earn more yield.</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-prose">
              When friends join and connect from your link, you climb the referral tier — yield boost in the UI; on-chain
              rules follow DAO votes.
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 text-xs" asChild>
            <Link to="/invites">Full leaderboard</Link>
          </Button>
        </div>

        {isError && <p className="text-sm text-destructive">Could not load referral stats. Is the API running?</p>}
        {isLoading && !data && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading…
          </div>
        )}

        {data && address && (
          <div className="space-y-4 mt-2">
            <div>
              <div className="text-[10px] uppercase text-muted-foreground">Your referral link</div>
              <div className="mt-1.5 font-mono text-sm break-all bg-secondary/50 rounded-lg px-3 py-2 border border-border/50">
                {link}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-secondary/30 border border-border/40 p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Friends joined</div>
                <div className="font-mono-num text-xl font-semibold">{data.invites}</div>
              </div>
              <div className="rounded-lg bg-secondary/30 border border-border/40 p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Yield boost (UI)</div>
                <div className="font-mono-num text-xl font-semibold text-gold">+{data.boostPct.toFixed(2)}%</div>
              </div>
              <div className="rounded-lg bg-secondary/30 border border-border/40 p-3">
                <div className="text-[10px] uppercase text-muted-foreground">Current tier</div>
                <Badge variant="outline" className="mt-1 border-primary/40 text-primary text-xs">
                  {data.tier.label}
                </Badge>
                <p className="text-[9px] text-muted-foreground mt-1.5">Club Builder → Strategist → Ambassador</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Next milestone: {data.milestone.next} friends</span>
                <span className="text-muted-foreground font-mono-num">
                  {data.milestone.pct < 0.1 ? 0 : data.milestone.pct.toFixed(0)}% there
                </span>
              </div>
              <Progress value={data.milestone.pct} className="h-1.5" />
            </div>
            <p className="text-[10px] text-muted-foreground">
              1+ invite → +0.25% · 5+ → +1% · 20+ Strategist track · 50+ DAO Ambassador (display tiers).
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copy} className="gap-1.5 rounded-xl">
                <Copy className="w-4 h-4" /> Copy link
              </Button>
              <Button type="button" variant="outline" onClick={share} className="gap-1.5 rounded-xl">
                <Share2 className="w-4 h-4" /> Share
              </Button>
            </div>
            {address && (
              <p className="text-[10px] text-muted-foreground font-mono">Member {shortAddr(address)}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
