import { ExternalLink } from "lucide-react";
import { useStacksStackingStatus } from "@/hooks/useChainData";

function explorerAddressUrl(network: "mainnet" | "testnet", address: string) {
  const root = "https://explorer.hiro.so";
  const path = `/address/${encodeURIComponent(address)}`;
  return network === "mainnet" ? `${root}${path}` : `${root}${path}?chain=testnet`;
}

function microStxLabel(micro: string): string {
  try {
    const n = Number(BigInt(micro)) / 1e6;
    if (!Number.isFinite(n)) return micro;
    return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} STX`;
  } catch {
    return micro;
  }
}

type Props = {
  /** Tighter padding when embedded in dense layouts (e.g. dashboard). */
  compact?: boolean;
};

export function StacksStackingStrip({ compact }: Props) {
  const { data, isLoading, isError } = useStacksStackingStatus();

  if (isLoading) {
    return (
      <div
        className={`rounded-2xl border border-border/40 bg-secondary/10 text-xs text-muted-foreground ${compact ? "px-3 py-2" : "px-4 py-3"}`}
        aria-live="polite"
      >
        Loading Stacks stacking status…
      </div>
    );
  }

  if (isError || !data || data.enabled === false) {
    return null;
  }

  const shortAddr = `${data.address.slice(0, 4)}…${data.address.slice(-4)}`;
  const deleg = data.delegation;
  const stk = data.stacker;

  return (
    <div
      className={`rounded-2xl border border-border/50 bg-card/25 space-y-2 ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-sm font-semibold tracking-tight">Stacks PoX (DAO)</h3>
        <a
          href={explorerAddressUrl(data.network, data.address)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Explorer
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Read-only snapshot from <span className="font-mono">GET /api/stacks/stacking-status</span>. Reward cycle{" "}
        <span className="text-foreground font-medium">{data.rewardCycleId}</span> · network{" "}
        <span className="text-foreground font-medium">{data.network}</span> · mode{" "}
        <span className="text-foreground font-medium">{data.mode}</span>.
      </p>
      <dl className="grid gap-1.5 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted-foreground">Address</dt>
          <dd className="font-mono text-foreground truncate" title={data.address}>
            {shortAddr}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Liquid balance</dt>
          <dd className="text-foreground">{microStxLabel(data.balanceMicroStx)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Locked</dt>
          <dd className="text-foreground">{microStxLabel(data.lockedMicroStx)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Network min (µSTX)</dt>
          <dd className="font-mono text-foreground">{data.minAmountUstx}</dd>
        </div>
      </dl>
      {deleg.delegated && (
        <p className="text-xs text-foreground">
          Delegated{" "}
          {deleg.amountMicroStx != null ? (
            <span className="font-medium">{microStxLabel(deleg.amountMicroStx)}</span>
          ) : null}{" "}
          {deleg.delegateTo != null && (
            <>
              to <span className="font-mono text-[11px]">{deleg.delegateTo}</span>
            </>
          )}
          .
        </p>
      )}
      {stk.stacked && (
        <p className="text-xs text-foreground">
          Solo stacked
          {stk.unlockHeight != null ? (
            <>
              {" "}
              · unlock burn height <span className="font-mono">{stk.unlockHeight}</span>
            </>
          ) : null}
          .
        </p>
      )}
      {!deleg.delegated && !stk.stacked && (
        <p className="text-xs text-muted-foreground">Not currently delegated or solo-stacked for this address.</p>
      )}
    </div>
  );
}
