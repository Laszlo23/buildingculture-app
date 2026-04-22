import { Link } from "react-router-dom";
import { Loader2, Trophy } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLeaderboardQuery } from "@/hooks/useWealth";
import { InvestorAddressLink } from "@/components/wealth/InvestorAddressLink";
import type { LeaderboardRowDto } from "@/lib/api";

function fmtUsd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function BoardTable({ title, rows, valueKey }: { title: string; rows: LeaderboardRowDto[]; valueKey: keyof LeaderboardRowDto }) {
  return (
    <div className="glass-card border border-border/60 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3 bg-secondary/20">
        <Trophy className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold">{title}</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">#</TableHead>
            <TableHead>Wallet</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.slice(0, 20).map((row, i) => (
            <TableRow key={`${title}-${row.address}-${i}`}>
              <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
              <TableCell>
                <InvestorAddressLink address={row.address} />
              </TableCell>
              <TableCell className="text-right font-mono-num">
                {typeof row[valueKey] === "number" && valueKey !== "address"
                  ? valueKey === "strategyRoiPct"
                    ? `${(row[valueKey] as number).toFixed(1)}%`
                    : valueKey === "votesCast"
                      ? String(row[valueKey] as number)
                      : fmtUsd(row[valueKey] as number)
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
          {!rows.length && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-8">
                No public snapshots yet. Open any wallet&apos;s{" "}
                <Link to="/portfolio" className="text-primary underline">
                  portfolio
                </Link>{" "}
                or an <span className="text-primary">/investor/0x…</span> page while the API can read on-chain data to
                seed snapshots.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export function LeaderboardPage() {
  const { data, isLoading, isError, error } = useLeaderboardQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading leaderboards…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-md text-sm text-destructive">
        {error instanceof Error ? error.message : "Failed to load leaderboard"}
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      <header className="space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight flex items-center gap-3">
          <Trophy className="h-9 w-9 text-primary shrink-0" />
          Leaderboards
        </h1>
        <p className="text-muted-foreground text-sm max-w-2xl">
          Rankings from server-side wealth snapshots (updated when public profiles are viewed or snapshots are posted).
          Wallets with <strong>public wealth profile</strong> off are excluded.
        </p>
        <p className="text-xs text-muted-foreground">Indexed wallets: {data.meta.count}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        <BoardTable title="Top investors" rows={data.topInvestors} valueKey="vaultUsd" />
        <BoardTable title="Top yield earners" rows={data.topYieldEarners} valueKey="yieldUsd" />
        <BoardTable title="Top strategists (ROI %)" rows={data.topStrategists} valueKey="strategyRoiPct" />
        <BoardTable title="Top DAO voters (proxy)" rows={data.topDaoVoters} valueKey="votesCast" />
      </div>
    </div>
  );
}
