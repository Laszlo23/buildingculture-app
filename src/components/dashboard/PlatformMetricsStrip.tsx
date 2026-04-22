import { Landmark, TrendingUp, Users, Vault } from "lucide-react";

const fmtMoney = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

type Props = {
  vaultTvl: number;
  /** Label for second slot — protocol-wide yield is not always on-chain in API; keep honest. */
  yieldLabel: string;
  yieldSub: string;
  treasury: number;
  members: number;
  treasuryLoading: boolean;
  portfolioLoading: boolean;
};

export function PlatformMetricsStrip({
  vaultTvl,
  yieldLabel,
  yieldSub,
  treasury,
  members,
  treasuryLoading,
  portfolioLoading,
}: Props) {
  const membersDisplay = members > 0 ? members.toLocaleString() : "—";

  return (
    <div className="rounded-2xl border border-border/60 bg-secondary/20 px-4 py-4 lg:px-6">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">
        Onchain Savings Club · Protocol snapshot
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Vault className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">Total value locked (vault)</div>
            <div className="font-mono-num font-semibold text-lg">
              {portfolioLoading ? "…" : fmtMoney(vaultTvl)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-gold" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">{yieldLabel}</div>
            <div className="font-mono-num font-semibold text-lg">{yieldSub}</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center shrink-0">
            <Landmark className="w-4 h-4 text-info" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">DAO treasury</div>
            <div className="font-mono-num font-semibold text-lg">
              {treasuryLoading ? "…" : fmtMoney(treasury)}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-[11px] text-muted-foreground">Active investors (API)</div>
            <div className="font-mono-num font-semibold text-lg">{membersDisplay}</div>
            {members === 0 && (
              <div className="text-[10px] text-muted-foreground mt-0.5">Set when indexed</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
