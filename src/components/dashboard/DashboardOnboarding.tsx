import { Link } from "react-router-dom";
import { CheckCircle2, Circle, ExternalLink, PlayCircle } from "lucide-react";
import { OnboardingVideoDialog } from "@/components/onboarding/OnboardingVideoDialog";
import { Button } from "@/components/ui/button";
import { BASE_APP_INVITE_URL } from "@/config/onboarding";
import { cn } from "@/lib/utils";

type Props = {
  walletConnected: boolean;
  hasDeposit: boolean;
  hasYield: boolean;
};

const steps = [
  { key: "wallet", label: "Connect wallet", href: undefined as string | undefined },
  { key: "deposit", label: "Deposit to vault", href: "/vault?tab=deposit" as string | undefined },
  { key: "earn", label: "Earn yield from strategies", href: "/strategies" as string | undefined },
] as const;

export function DashboardOnboarding({ walletConnected, hasDeposit, hasYield }: Props) {
  const done = [walletConnected, hasDeposit, hasYield];
  const completedCount = done.filter(Boolean).length;
  const pct = (completedCount / 3) * 100;

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-lg">Start earning in 3 steps</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect, fund the vault, and let DAO-governed strategies work for you.
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-3">
            <OnboardingVideoDialog>
              <Button type="button" variant="link" className="h-auto p-0 text-xs text-primary gap-1.5">
                <PlayCircle className="h-3.5 w-3.5 shrink-0" />
                Watch 2-min onboarding
              </Button>
            </OnboardingVideoDialog>
            <span className="text-muted-foreground/50 hidden sm:inline" aria-hidden>
              ·
            </span>
            <Button variant="link" className="h-auto p-0 text-xs text-primary gap-1" asChild>
              <a href={BASE_APP_INVITE_URL} target="_blank" rel="noopener noreferrer">
                Get Base app
                <ExternalLink className="h-3 w-3 opacity-80" />
              </a>
            </Button>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Progress</div>
          <div className="font-mono-num font-semibold text-primary">{completedCount}/3</div>
        </div>
      </div>

      <div className="h-2 rounded-full bg-secondary/60 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-primary transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ol className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((step, i) => {
          const isDone = done[i];
          return (
            <li
              key={step.key}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border",
                isDone ? "border-primary/40 bg-primary/5" : "border-border/60 bg-secondary/20",
              )}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Step {i + 1}</div>
                <div className="text-sm font-medium leading-snug">{step.label}</div>
                {step.href && !isDone && (
                  <Button variant="link" className="h-auto p-0 text-xs text-primary" asChild>
                    <Link to={step.href}>Go</Link>
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
