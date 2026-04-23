import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, ClipboardList, Loader2, Sparkles } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  type LearningRouteId,
  learningRoutes,
} from "@/data/learningRoutes";
import { chainApi, explorerTxUrl, type NftMintWithDaoReward } from "@/lib/api";
import { qk } from "@/hooks/useChainData";
import {
  CredentialNftMintShowcase,
  type CredentialMintPhase,
} from "@/components/learning/CredentialNftMintShowcase";
import { OSC_LEARNING_NFT_IMAGE_URL } from "@/lib/nftCredentialArt";
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

  const { data: learningProgress } = useQuery({
    queryKey: ["learning", "progress", address] as const,
    queryFn: () => chainApi.getLearningProgress(address!),
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
    onSuccess: (data) => {
      toast.success("Quiz passed — you can claim your credential NFT.");
      if (data.daoVotingReward?.status === "granted") {
        toast.success("DAO member reward", {
          description: "Your governance voting weight was increased on-chain.",
        });
        void qc.invalidateQueries({ queryKey: qk.portfolio });
      }
      void qc.invalidateQueries({ queryKey: qkElig(address) });
      void qc.invalidateQueries({ queryKey: ["learning", "progress", address] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not record completion"),
  });

  const claimNft = useMutation({
    mutationFn: () =>
      chainApi.claimLearningNft({
        address: address!,
        routeId: config!.id,
      }),
    onSuccess: (data: NftMintWithDaoReward) => {
      toast.success("Credential minted", {
        description: data.txHash.slice(0, 10) + "…",
        action: {
          label: "BaseScan",
          onClick: () => window.open(explorerTxUrl(data.chainId, data.txHash), "_blank"),
        },
      });
      if (data.daoVotingReward?.status === "granted") {
        toast.success("DAO member reward", { description: "Governance voting weight increased on-chain." });
        void qc.invalidateQueries({ queryKey: qk.portfolio });
      }
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

  const mintPhase: CredentialMintPhase = minted ? "minted" : passed ? "eligible" : "preview";
  const completedAtIso = learningProgress?.routes?.[config.id]?.completedAt;
  const credentialDescription = `${config.subtitle} Soulbound Academy credential — educational use only; not financial or legal advice.`;

  return (
    <div className={cn("space-y-6", atQuiz ? "max-w-6xl" : "max-w-3xl")}>
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

      {/* Chapter + checkpoint — horizontal stepper */}
      <nav
        aria-label="Learning path progress"
        className="flex w-full items-center gap-0 overflow-x-auto pb-1 [scrollbar-width:thin]"
      >
        {config.chapters.map((_, i) => {
          const chapterComplete = chapterIdx > i || atQuiz || passed;
          const chapterCurrent = chapterIdx === i && !atQuiz;
          return (
            <Fragment key={`step-${i}`}>
              {i > 0 && (
                <div
                  aria-hidden
                  className={cn(
                    "h-0.5 min-w-[12px] flex-1 shrink rounded-full transition-colors",
                    chapterIdx > i || atQuiz || passed ? "bg-primary/45" : "bg-border/55",
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => setChapterIdx(i)}
                className="flex min-w-[76px] shrink-0 flex-col items-center gap-1 px-1 text-center motion-reduce:transition-none"
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border text-[11px] font-semibold transition-all motion-reduce:transition-none",
                    chapterComplete &&
                      "border-primary/50 bg-primary/15 text-primary shadow-[0_0_16px_-4px_hsl(var(--primary)/0.35)]",
                    chapterCurrent &&
                      "scale-105 border-primary bg-primary/25 text-primary ring-2 ring-primary/60 shadow-[0_0_22px_-2px_hsl(var(--primary)/0.45)] motion-reduce:scale-100",
                    !chapterComplete &&
                      !chapterCurrent &&
                      "border-border/70 bg-secondary/45 text-muted-foreground hover:border-primary/35",
                  )}
                >
                  {chapterComplete ? <Check className="h-4 w-4" strokeWidth={2.5} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "max-w-[92px] text-[10px] font-medium leading-tight",
                    chapterCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  Part {i + 1}
                </span>
              </button>
            </Fragment>
          );
        })}
        <div
          aria-hidden
          className={cn(
            "h-0.5 min-w-[12px] flex-1 shrink rounded-full transition-colors",
            atQuiz || passed ? "bg-primary/45" : "bg-border/55",
          )}
        />
        <button
          type="button"
          onClick={() => setChapterIdx(config.chapters.length)}
          className="flex min-w-[88px] shrink-0 flex-col items-center gap-1 px-1 text-center"
        >
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border transition-all motion-reduce:transition-none",
              passed &&
                "border-primary/50 bg-primary/15 text-primary shadow-[0_0_16px_-4px_hsl(var(--primary)/0.35)]",
              atQuiz &&
                !passed &&
                "scale-105 border-primary bg-primary/25 text-primary ring-2 ring-primary/60 shadow-[0_0_22px_-2px_hsl(var(--primary)/0.45)] motion-reduce:scale-100",
              !atQuiz &&
                !passed &&
                "border-border/70 bg-secondary/45 text-muted-foreground hover:border-primary/35",
            )}
          >
            {passed ? <Check className="h-4 w-4" strokeWidth={2.5} /> : <ClipboardList className="h-4 w-4" />}
          </span>
          <span
            className={cn(
              "max-w-[92px] text-[10px] font-medium leading-tight",
              atQuiz && !passed ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Checkpoint
          </span>
        </button>
      </nav>

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

      {atQuiz && config && (
        <CredentialNftMintShowcase
          phase={mintPhase}
          accent={config.accent}
          credentialName={config.nftName}
          tokenIdLabel={`OSC-${config.id.toUpperCase()}`}
          ownerAddress={address}
          completedAtIso={completedAtIso}
          description={credentialDescription}
          heroImageSrc={OSC_LEARNING_NFT_IMAGE_URL}
        />
      )}

      {atQuiz && (
        <section
          className={cn(
            "glass-card relative overflow-hidden p-6 space-y-6 rounded-2xl border transition-shadow duration-300",
            quizReady &&
              !passed &&
              "motion-safe:border-primary/45 motion-safe:shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_0_36px_-8px_hsl(var(--primary)/0.35)] motion-safe:animate-pulse-glow",
          )}
        >
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
