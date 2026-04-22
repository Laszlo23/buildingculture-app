import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type LearningRouteId,
  learningRoutes,
} from "@/data/learningRoutes";
import { chainApi, explorerTxUrl, type TxResult } from "@/lib/api";
import { useConnection } from "wagmi";

const qkElig = (addr: string | undefined) => ["nft", "eligibility", addr] as const;

export function LearningRoutePage() {
  const { routeId } = useParams<{ routeId: string }>();
  const config = routeId && routeId in learningRoutes ? learningRoutes[routeId as LearningRouteId] : null;
  const { address, status } = useConnection();
  const qc = useQueryClient();

  const [chapterIdx, setChapterIdx] = useState(0);
  const [selections, setSelections] = useState<number[]>(() =>
    config ? config.quiz.map(() => -1) : [],
  );

  useEffect(() => {
    if (!routeId || !(routeId in learningRoutes)) return;
    const cfg = learningRoutes[routeId as LearningRouteId];
    setChapterIdx(0);
    setSelections(cfg.quiz.map(() => -1));
  }, [routeId]);

  const { data: elig } = useQuery({
    queryKey: qkElig(address),
    queryFn: () => chainApi.nftEligibility(address!),
    enabled: Boolean(address),
  });

  const routeElig = elig?.routes?.[config?.id ?? "rwa"];

  const completeQuiz = useMutation({
    mutationFn: () =>
      chainApi.learningComplete({
        address: address!,
        routeId: config!.id,
        answers: selections,
      }),
    onSuccess: () => {
      toast.success("Quiz passed — you can claim your credential NFT.");
      void qc.invalidateQueries({ queryKey: qkElig(address) });
    },
    onError: (e: Error) => toast.error(e.message || "Could not record completion"),
  });

  const claimNft = useMutation({
    mutationFn: () =>
      chainApi.claimLearningNft({
        address: address!,
        routeId: config!.id,
      }),
    onSuccess: (data: TxResult) => {
      toast.success("Credential minted", {
        description: data.txHash.slice(0, 10) + "…",
        action: {
          label: "BaseScan",
          onClick: () => window.open(explorerTxUrl(data.chainId, data.txHash), "_blank"),
        },
      });
      void qc.invalidateQueries({ queryKey: qkElig(address) });
    },
    onError: (e: Error) => toast.error(e.message || "Mint failed"),
  });

  const accentClass = useMemo(() => {
    if (!config) return "border-primary/30 text-primary";
    if (config.accent === "gold") return "border-gold/40 text-gold";
    if (config.accent === "info") return "border-info/40 text-info";
    return "border-primary/30 text-primary";
  }, [config]);

  if (!config) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">This learning path does not exist.</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/academy">Back to Academy</Link>
        </Button>
      </div>
    );
  }

  const atQuiz = chapterIdx >= config.chapters.length;
  const quizReady = selections.every(s => s >= 0);
  const passed = routeElig?.completed;
  const minted = routeElig?.mintedOnChain;
  const canClaim = routeElig?.canMint;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild className="rounded-xl -ml-2">
          <Link to="/academy">
            <ArrowLeft className="w-4 h-4 mr-1" /> Academy
          </Link>
        </Button>
        <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] font-medium", accentClass)}>
          <Sparkles className="w-3 h-3" /> Journey
        </div>
      </div>

      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight">{config.title}</h1>
        <p className="text-muted-foreground text-sm">{config.subtitle}</p>
        <p className="text-xs text-muted-foreground border-l-2 border-border pl-3 py-1">
          Educational content only — not financial, legal, or investment advice.
        </p>
      </header>

      {/* Chapter stepper */}
      <div className="flex flex-wrap gap-2">
        {config.chapters.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setChapterIdx(i)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-lg border transition",
              chapterIdx === i
                ? "bg-primary/15 border-primary/40 text-primary"
                : "bg-secondary/40 border-border/60 text-muted-foreground hover:border-primary/30",
            )}
          >
            Part {i + 1}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setChapterIdx(config.chapters.length)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-lg border transition",
            atQuiz
              ? "bg-primary/15 border-primary/40 text-primary"
              : "bg-secondary/40 border-border/60 text-muted-foreground hover:border-primary/30",
          )}
        >
          Checkpoint
        </button>
      </div>

      {!atQuiz && (
        <section className="glass-card p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">{config.chapters[chapterIdx]?.title}</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            {config.chapters[chapterIdx]?.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              disabled={chapterIdx === 0}
              onClick={() => setChapterIdx(i => Math.max(0, i - 1))}
            >
              Back
            </Button>
            <Button size="sm" className="rounded-xl" onClick={() => setChapterIdx(i => i + 1)}>
              {chapterIdx < config.chapters.length - 1 ? "Next" : "Continue to quiz"}
            </Button>
          </div>
        </section>
      )}

      {atQuiz && (
        <section className="glass-card p-6 space-y-6">
          <h2 className="font-display text-lg font-semibold">Checkpoint quiz</h2>
          <div className="space-y-6">
            {config.quiz.map((q, qi) => (
              <div key={qi} className="space-y-3">
                <div className="text-sm font-medium leading-snug">
                  {qi + 1}. {q.prompt}
                </div>
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={cn(
                        "flex items-start gap-2 text-sm p-3 rounded-xl border cursor-pointer transition",
                        selections[qi] === oi
                          ? "border-primary/50 bg-primary/10"
                          : "border-border/60 bg-secondary/20 hover:border-primary/30",
                      )}
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        checked={selections[qi] === oi}
                        onChange={() =>
                          setSelections(prev => {
                            const next = [...prev];
                            next[qi] = oi;
                            return next;
                          })
                        }
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2 border-t border-border/60">
            <WalletConnectButton />
            {status === "connected" && address && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="rounded-xl"
                  disabled={!quizReady || completeQuiz.isPending}
                  onClick={() => completeQuiz.mutate()}
                >
                  {completeQuiz.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit answers"}
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl"
                  disabled={!canClaim || claimNft.isPending || !elig?.learningNftConfigured}
                  onClick={() => claimNft.mutate()}
                >
                  {claimNft.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `Claim ${config.nftName}`}
                </Button>
              </div>
            )}
          </div>

          {passed && (
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Quiz passed for this wallet.
            </div>
          )}
          {minted && (
            <div className="text-sm text-muted-foreground">
              On-chain credential already minted for this route.
            </div>
          )}
          {elig && !elig.learningNftConfigured && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Server has no LEARNING_NFT_CONTRACT configured — minting is disabled until deployment.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
