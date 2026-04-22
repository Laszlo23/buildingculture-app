import { useMemo } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Trophy, ArrowLeft } from "lucide-react";
import { explorerAddressUrl } from "@/lib/api";
import { useChainConfig } from "@/hooks/useChainData";
import { useReferralInvitesLeaderboard } from "@/hooks/useReferral";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const badge = (t: string) => {
  if (t?.includes("Ambassador")) return "default" as const;
  if (t?.includes("Strategist") && t !== "—") return "secondary" as const;
  if (t?.includes("Builder")) return "outline" as const;
  return "outline" as const;
};

export const InvitesPage = () => {
  const { data: chainCfg } = useChainConfig();
  const { data, isLoading, isError } = useReferralInvitesLeaderboard(30);
  const chainId = chainCfg?.chainId ?? 8453;
  const rows = data?.rows ?? [];
  const empty = !isLoading && !isError && rows.length === 0;

  const sub = useMemo(
    () =>
      "This month, invite competition runs on the server referral index (permanent invite links). " +
      "Wealth TVL leaderboards are separate; growth stats here are invite-only.",
    [],
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-1">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold" />
            Referral leaderboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Top inviters · growth loop · tier badges (Club Builder, Strategist, Ambassador)</p>
        </div>
        <Button variant="ghost" asChild>
          <Link to="/" className="gap-1 text-muted-foreground">
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </Link>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-3 py-0.5">{sub}</p>

      <div className="glass-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-medium flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> This season — top inviters
            </h2>
            <p className="text-[11px] text-muted-foreground">Wallet · invites · boost earned (UI display)</p>
          </div>
        </div>
        {isLoading && <div className="p-6 text-sm text-muted-foreground">Loading…</div>}
        {isError && <div className="p-6 text-sm text-destructive">Could not load. Start the API (`npm run dev`) and try again.</div>}
        {empty && (
          <p className="p-6 text-sm text-muted-foreground">
            No referred members recorded yet. Share your invite from the dashboard when you connect a wallet.
          </p>
        )}
        {rows.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead className="text-right">Invites</TableHead>
                  <TableHead className="text-right">Yield boost</TableHead>
                  <TableHead className="text-right">Tier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => {
                  const scan = explorerAddressUrl(chainId, r.address);
                  return (
                    <TableRow key={r.address}>
                      <TableCell className="font-mono text-muted-foreground">#{i + 1}</TableCell>
                      <TableCell>
                        <a href={scan} className="font-mono text-sm text-primary hover:underline" target="_blank" rel="noreferrer">
                          {short(r.address)}
                        </a>
                      </TableCell>
                      <TableCell className="text-right font-mono-num">{r.invites}</TableCell>
                      <TableCell className="text-right font-mono-num">+{r.boostPct.toFixed(2)}%</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={badge(r.tier)} className="text-[10px]">
                          {r.tier}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
