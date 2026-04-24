import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useConnection } from "wagmi";
import { chainApi } from "@/lib/api";
import { learningNftImageUrlForAchievementType } from "@/lib/nftCredentialArt";
import { cn } from "@/lib/utils";

function normalizeAddress(a: string | undefined): string | undefined {
  if (!a) return undefined;
  const t = a.trim();
  if (!t) return undefined;
  const lower = t.toLowerCase();
  if (lower.startsWith("0x") && /^0x[a-f0-9]{40}$/.test(lower)) return lower;
  if (/^[a-f0-9]{40}$/.test(lower)) return `0x${lower}`;
  return undefined;
}

const qk = (addr: string | undefined) => ["nft", "badges", addr] as const;

export type LearningBadgesStripProps = {
  className?: string;
  /** Load badges for this wallet (e.g. public `/investor/0x…` page). When omitted, uses the connected wallet. */
  viewerAddress?: string;
  /** When there are no rows yet, show a short hint instead of hiding (profile nudge). */
  showEmptyHint?: boolean;
};

export function LearningBadgesStrip({ className, viewerAddress, showEmptyHint }: LearningBadgesStripProps) {
  const { address: connected, status } = useConnection();
  const target = normalizeAddress(viewerAddress) ?? (status === "connected" ? normalizeAddress(connected) : undefined);

  const { data, isLoading } = useQuery({
    queryKey: qk(target),
    queryFn: () => chainApi.nftBadges(target!),
    enabled: Boolean(target),
  });

  if (!target) {
    if (viewerAddress) return null;
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        Connect a wallet to see learning credentials.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" /> Loading credentials…
      </div>
    );
  }

  if (!data?.badges?.length) {
    if (!showEmptyHint) return null;
    return (
      <p className={cn("text-sm text-muted-foreground", className)}>
        No credential NFTs yet — finish{" "}
        <Link to="/academy" className="text-primary underline underline-offset-2">
          Academy
        </Link>{" "}
        journeys to mint soulbound receipts on Base.
      </p>
    );
  }

  const noneMinted = data.badges.every(b => !b.minted);

  return (
    <div className={cn("space-y-2", className)}>
      {showEmptyHint && noneMinted && (
        <p className="text-xs text-muted-foreground">
          Nothing minted on-chain yet — crush the Academy quizzes to unlock your soulbound art.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
      {data.badges.map(b => (
        <div
          key={b.id}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-shadow",
            b.minted
              ? "border border-transparent bg-gradient-to-br from-primary/18 via-primary/8 to-primary/5 text-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.35),0_6px_18px_-8px_hsl(var(--primary)/0.25)]"
              : "border border-dashed border-muted-foreground/40 bg-secondary/25 text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "relative h-8 w-8 shrink-0 overflow-hidden rounded-md border bg-secondary/40",
              b.minted ? "border-primary/35" : "border-muted-foreground/25 opacity-50",
            )}
          >
            <img
              src={learningNftImageUrlForAchievementType(b.achievementType)}
              alt=""
              role="presentation"
              className="h-full w-full object-cover"
              decoding="async"
            />
          </span>
          <span>{b.name}</span>
          {b.minted ? (
            <span className="text-[10px] opacity-80">minted</span>
          ) : (
            <span className="text-[10px]">locked</span>
          )}
        </div>
      ))}
      </div>
    </div>
  );
}
