import type { ReactNode } from "react";
import { Calendar, Hash, Package, Sparkles, UserRound, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export type CredentialMintPhase = "preview" | "eligible" | "minted";

type Accent = "gold" | "info" | "primary";

const accentMeta: Record<
  Accent,
  { label: string; titleFrom: string; iconRing: string; eyebrow: string }
> = {
  gold: {
    label: "text-amber-400/95",
    titleFrom: "from-white via-amber-100/95 to-amber-200/80",
    iconRing: "bg-amber-500/15 text-amber-400 border-amber-400/25",
    eyebrow: "text-amber-400/90",
  },
  info: {
    label: "text-sky-400/95",
    titleFrom: "from-white via-sky-100/90 to-cyan-300/75",
    iconRing: "bg-sky-500/15 text-sky-300 border-sky-400/25",
    eyebrow: "text-sky-400/90",
  },
  primary: {
    label: "text-primary",
    titleFrom: "from-white via-emerald-100/90 to-primary/85",
    iconRing: "bg-primary/15 text-primary border-primary/30",
    eyebrow: "text-primary/90",
  },
};

function shortAddr(a: string | undefined) {
  if (!a || !/^0x[a-fA-F0-9]{40}$/i.test(a)) return "—";
  const x = a.toLowerCase();
  return `${x.slice(0, 6)}…${x.slice(-4)}`;
}

function fmtMinted(iso: string | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

type MetaRowProps = { icon: ReactNode; label: string; value: string; iconClass: string };

function MetaRow({ icon, label, value, iconClass }: MetaRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0">
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border",
          iconClass,
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/90 font-medium">{label}</div>
        <div className="font-mono-num text-sm text-foreground/95 truncate">{value}</div>
      </div>
    </div>
  );
}

export type CredentialNftMintShowcaseProps = {
  phase: CredentialMintPhase;
  accent: Accent;
  /** Display name e.g. "RWA Scholar" */
  credentialName: string;
  collectionName?: string;
  /** Shown as token id row e.g. OSC-RWA */
  tokenIdLabel: string;
  ownerAddress?: string;
  completedAtIso?: string;
  description: string;
  heroImageSrc?: string;
  className?: string;
};

/**
 * Premium two-column credential showcase for the Academy mint flow.
 * Omit `heroImageSrc` for a text-and-gradient hero (no artwork in `public/`).
 */
export function CredentialNftMintShowcase({
  phase,
  accent,
  credentialName,
  collectionName = "OSC Learning credentials",
  tokenIdLabel,
  ownerAddress,
  completedAtIso,
  description,
  heroImageSrc,
  className,
}: CredentialNftMintShowcaseProps) {
  const a = accentMeta[accent];
  const phaseLabel =
    phase === "minted"
      ? "Minted on-chain"
      : phase === "eligible"
        ? "Ready to mint"
        : "Preview — unlock with quiz";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/[0.08]",
        "bg-gradient-to-br from-[hsl(222_45%_7%)] via-[hsl(222_42%_5%)] to-[hsl(220_50%_4%)]",
        "shadow-[0_0_0_1px_hsl(var(--primary)/0.12),0_24px_80px_-24px_hsl(220_60%_2%/0.85),inset_0_1px_0_0_hsl(150_20%_96%/0.04)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 20% 0%, hsl(var(--primary) / 0.2), transparent 55%),
            radial-gradient(ellipse 60% 40% at 85% 100%, hsl(200 90% 50% / 0.12), transparent 50%)`,
        }}
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-0 lg:min-h-[420px]">
        {/* Visual column */}
        <div className="relative min-h-[280px] lg:min-h-full border-b border-white/[0.06] lg:border-b-0 lg:border-r lg:border-white/[0.06]">
          {heroImageSrc ? (
            <img
              src={heroImageSrc}
              alt={`${credentialName} credential artwork`}
              className="absolute inset-0 h-full w-full object-cover object-center opacity-95"
              decoding="async"
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 overflow-hidden" aria-hidden>
              <div
                className="absolute inset-0 opacity-90"
                style={{
                  backgroundImage: `radial-gradient(ellipse 70% 55% at 30% 20%, hsl(var(--primary) / 0.28), transparent 60%),
                    radial-gradient(ellipse 50% 45% at 80% 80%, hsl(270 60% 45% / 0.2), transparent 55%),
                    linear-gradient(165deg, hsl(222 42% 12%) 0%, hsl(222 45% 6%) 45%, hsl(220 50% 4%) 100%)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="font-display font-bold uppercase tracking-tighter text-white/[0.07] select-none"
                  style={{ fontSize: "clamp(3.5rem, 16vw, 9rem)" }}
                  aria-hidden
                >
                  {credentialName.trim().slice(0, 1) || "·"}
                </span>
              </div>
            </div>
          )}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[hsl(222_47%_5%/0.92)] via-[hsl(222_40%_8%/0.35)] to-transparent"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[hsl(222_47%_5%/0.55)] via-transparent to-[hsl(222_47%_5%/0.25)]" aria-hidden />

          <div className="relative flex h-full min-h-[inherit] flex-col justify-between p-6 sm:p-8">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-white/75">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded border border-white/20 bg-white/5 text-[9px]">
                ⬡
              </span>
              A future we build together
            </div>

            <div className="space-y-4">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  "border-cyan-400/35 bg-[hsl(222_45%_8%/0.75)] text-cyan-100/95 backdrop-blur-md",
                  "shadow-[0_0_24px_hsl(190_90%_50%/0.2)]",
                )}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" aria-hidden />
                OSC credential · {credentialName}
              </div>
              <p className="max-w-sm text-xs text-white/65 leading-relaxed">
                {phase === "preview" && "Pass the checkpoint to unlock a soulbound credential minted by the club."}
                {phase === "eligible" && "You cleared the quiz — one signature mints your on-chain credential."}
                {phase === "minted" && "This path is saved on-chain. Your voting weight may update if member rewards are enabled."}
              </p>
            </div>
          </div>
        </div>

        {/* Info column */}
        <div className="flex flex-col justify-center p-6 sm:p-8 lg:py-10 space-y-6">
          <div className="space-y-2">
            <p className={cn("text-[11px] font-semibold uppercase tracking-[0.25em]", a.eyebrow)}>Onchain Savings Club</p>
            <h2
              className={cn(
                "font-display text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-br bg-clip-text text-transparent",
                a.titleFrom,
              )}
            >
              {credentialName}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your membership. Your future.{" "}
              <span className="text-violet-300/95 font-medium">Onchain.</span>
            </p>
          </div>

          <div
            className={cn(
              "rounded-2xl border border-white/[0.08] bg-[hsl(220_35%_8%/0.55)] backdrop-blur-xl px-4 py-2",
              "shadow-[inset_0_1px_0_0_hsl(150_20%_96%/0.05)]",
            )}
          >
            <MetaRow
              icon={<Package className="w-4 h-4 text-violet-300" />}
              label="Collection"
              value={collectionName}
              iconClass="border-violet-400/25 bg-violet-500/10"
            />
            <MetaRow
              icon={<Hash className="w-4 h-4 text-cyan-300" />}
              label="Token id"
              value={tokenIdLabel}
              iconClass="border-cyan-400/25 bg-cyan-500/10"
            />
            <MetaRow
              icon={<UserRound className="w-4 h-4 text-amber-300" />}
              label="Owner"
              value={shortAddr(ownerAddress)}
              iconClass="border-amber-400/25 bg-amber-500/10"
            />
            <MetaRow
              icon={<Calendar className="w-4 h-4 text-sky-300" />}
              label="Checkpoint"
              value={
                phase === "minted"
                  ? completedAtIso
                    ? fmtMinted(completedAtIso)
                    : "On-chain"
                  : phase === "eligible"
                    ? "Eligible now"
                    : "Not yet passed"
              }
              iconClass="border-sky-400/25 bg-sky-500/10"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-400/90">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>

          <div
            className={cn(
              "flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/[0.06] px-4 py-3",
              "shadow-[0_0_32px_-8px_hsl(42_92%_50%/0.15)]",
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/30 bg-amber-500/10">
              <Shield className="w-5 h-5 text-amber-400" aria-hidden />
            </div>
            <div className="min-w-0 space-y-0.5">
              <div className="text-sm font-semibold text-amber-100/95 tracking-tight">{credentialName}</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {phase === "minted"
                  ? "Exclusive access marker on-chain. Educational credential — not a security or investment product."
                  : "Early learner impact. Mint after quiz to lock your progress on-chain."}
              </p>
              <div className="pt-1">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    phase === "minted" && "border-primary/35 bg-primary/10 text-primary",
                    phase === "eligible" && "border-cyan-400/35 bg-cyan-500/10 text-cyan-200",
                    phase === "preview" && "border-border/60 bg-secondary/40 text-muted-foreground",
                  )}
                >
                  {phaseLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
