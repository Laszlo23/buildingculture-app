import { useState } from "react";
import { Link } from "react-router-dom";
import { Vote, Check, X, MinusCircle, Plus, Clock, Loader2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TransactionConfirmDialog } from "@/components/TransactionConfirmDialog";
import { cn } from "@/lib/utils";
import { usePortfolio, useProposals, useVoteMutation } from "@/hooks/useChainData";

const categoryColor = {
  "Real Estate": "border-gold/30 text-gold bg-gold/5",
  Treasury: "border-primary/30 text-primary bg-primary/5",
  Education: "border-info/30 text-info bg-info/5",
  Strategy: "border-warning/30 text-warning bg-warning/5",
  Governance: "border-border/60 text-muted-foreground bg-secondary/30",
};

export const DAOPage = () => {
  const { data: proposals, isLoading } = useProposals();
  const { data: portfolio } = usePortfolio();
  const voteMut = useVoteMutation();
  const [confirm, setConfirm] = useState<{
    proposalId: string;
    support: 0 | 1 | 2;
    label: string;
  } | null>(null);

  const govWeight = portfolio?.governanceWeight ?? 1;
  const active = (proposals ?? []).filter(p => p.status === "active");

  return (
    <div className="space-y-6">
      <TransactionConfirmDialog
        open={!!confirm}
        onOpenChange={open => !open && setConfirm(null)}
        title="Submit vote on-chain"
        description={
          confirm
            ? `Cast ${confirm.label} on proposal #${confirm.proposalId} via the server signer.`
            : ""
        }
        confirmLabel="Submit vote"
        isLoading={voteMut.isPending}
        onConfirm={() => {
          if (!confirm) return;
          voteMut.mutate(
            { proposalId: confirm.proposalId, support: confirm.support },
            { onSettled: () => setConfirm(null) },
          );
        }}
      />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">DAO Governance</h1>
          <p className="text-muted-foreground text-sm mt-1">Vote on treasury, strategies, real-asset acquisitions and risk parameters.</p>
          <p className="text-[11px] text-muted-foreground/90 mt-2 max-w-xl leading-relaxed">
            Member rewards (operator opt-in): completing Academy quizzes, minting credentials, vault patron milestones, and
            syncing your investor snapshot can increase on-chain{" "}
            <span className="text-foreground/85 font-medium">GovernanceDAO voting weight</span> — not an ERC-20 transfer;
            the club signer must be DAO owner. See <code className="text-[10px]">DAO_VOTING_REWARDS_ENABLED</code> in{" "}
            <code className="text-[10px]">.env.example</code>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass rounded-xl px-4 py-2.5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Voting power</div>
            <div className="font-mono-num font-semibold text-lg text-primary">{govWeight.toFixed(2)}x</div>
          </div>
          <Button className="rounded-xl bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow gap-2" disabled>
            <Plus className="w-4 h-4" /> New proposal
          </Button>
        </div>
      </header>

      <section
        className="rounded-2xl border border-border/60 bg-secondary/25 px-4 py-4 sm:px-5 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        aria-labelledby="treasury-poc-heading"
      >
        <div className="flex gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-gold" />
          </div>
          <div className="min-w-0 space-y-1">
            <h2 id="treasury-poc-heading" className="text-sm font-semibold text-foreground">
              Treasury acquisition POC
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Villa Ebreichsdorf: court-appraised lakeside asset near Vienna; DAO roadmap targets completion funding and a
              post-completion value estimate on{" "}
              <Link to="/reserves" className="text-primary hover:underline">
                Reserves
              </Link>
              . Figures are illustrative until wired to on-chain treasury flows.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="rounded-xl shrink-0 self-start sm:self-center" asChild>
          <Link to="/reserves#villa-ebreichsdorf">View dossier</Link>
        </Button>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active proposals", value: isLoading ? "…" : String(active.length), color: "text-primary" },
          { label: "Passed (epoch)", value: "—", color: "text-success" },
          { label: "Treasury votable", value: "—", color: "text-gold" },
          { label: "Quorum required", value: "65%", color: "text-info" },
        ].map(s => (
          <div key={s.label} className="glass-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div className={cn("font-display font-semibold text-2xl mt-1 font-mono-num", s.color)}>{s.value}</div>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Vote className="w-5 h-5 text-primary" />
          <h2 className="font-display font-semibold text-xl">Proposals</h2>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="space-y-3">
          {(proposals ?? []).map(p => {
            const total = p.forVotes + p.againstVotes + p.abstainVotes || 1;
            const isActive = p.status === "active";
            return (
              <div key={p.id} className="glass-card p-6 hover:border-primary/30 transition group">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-start gap-3 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground bg-secondary/60 px-2 py-1 rounded">{p.id}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px]",
                          categoryColor[p.category as keyof typeof categoryColor] ?? categoryColor.Governance,
                        )}
                      >
                        {p.category}
                      </Badge>
                      {isActive ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/30 text-primary text-[10px] font-medium">
                          <Clock className="w-3 h-3" /> Active · ends {p.endsIn}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-success/15 border border-success/30 text-success text-[10px] font-medium">
                          <Check className="w-3 h-3" /> Passed
                        </div>
                      )}
                    </div>
                    <h3 className="font-display font-semibold text-lg leading-snug group-hover:text-primary transition-colors">
                      {p.title}
                    </h3>

                    <div className="space-y-2 max-w-xl">
                      <div className="h-2 rounded-full bg-secondary/60 overflow-hidden flex">
                        <div className="h-full bg-success" style={{ width: `${(p.forVotes / total) * 100}%` }} />
                        <div className="h-full bg-destructive" style={{ width: `${(p.againstVotes / total) * 100}%` }} />
                        <div className="h-full bg-muted-foreground/40" style={{ width: `${(p.abstainVotes / total) * 100}%` }} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span className="text-success font-mono-num">For {p.forVotes}%</span>
                        <span className="text-destructive font-mono-num">Against {p.againstVotes}%</span>
                        <span className="text-muted-foreground font-mono-num">Abstain {p.abstainVotes}%</span>
                        <span className="text-muted-foreground ml-auto">Quorum {p.quorum}%</span>
                      </div>
                    </div>
                  </div>

                  {isActive && (
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-col h-auto py-3 rounded-xl border-success/30 hover:bg-success/10 hover:border-success"
                        disabled={voteMut.isPending}
                        onClick={() => setConfirm({ proposalId: p.proposalId, support: 1, label: "For" })}
                      >
                        <Check className="w-4 h-4 mb-1 text-success" />
                        <span className="text-xs">For</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-col h-auto py-3 rounded-xl border-destructive/30 hover:bg-destructive/10 hover:border-destructive"
                        disabled={voteMut.isPending}
                        onClick={() => setConfirm({ proposalId: p.proposalId, support: 0, label: "Against" })}
                      >
                        <X className="w-4 h-4 mb-1 text-destructive" />
                        <span className="text-xs">Against</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-col h-auto py-3 rounded-xl border-border/60"
                        disabled={voteMut.isPending}
                        onClick={() => setConfirm({ proposalId: p.proposalId, support: 2, label: "Abstain" })}
                      >
                        <MinusCircle className="w-4 h-4 mb-1 text-muted-foreground" />
                        <span className="text-xs">Abstain</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
