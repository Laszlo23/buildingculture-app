import { ExternalLink, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SocialXUserDto } from "@/lib/api";
import { cn } from "@/lib/utils";

export function XProfileCard({
  user,
  className,
}: {
  user: SocialXUserDto;
  className?: string;
}) {
  const href = `https://x.com/${encodeURIComponent(user.username)}`;
  const metrics = [
    user.followersCount != null ? `${formatCount(user.followersCount)} followers` : null,
    user.followingCount != null ? `${formatCount(user.followingCount)} following` : null,
    user.tweetCount != null ? `${formatCount(user.tweetCount)} posts` : null,
  ].filter(Boolean);

  return (
    <div className={cn("rounded-xl border border-border/60 bg-secondary/20 overflow-hidden", className)}>
      <div className="flex gap-3 p-4">
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt=""
            className="h-14 w-14 rounded-full object-cover border border-border/60 shrink-0"
            width={56}
            height={56}
          />
        ) : (
          <div className="h-14 w-14 rounded-full bg-muted shrink-0" />
        )}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold truncate">{user.name}</span>
            {user.verified ? <BadgeCheck className="w-4 h-4 text-sky-500 shrink-0" aria-label="Verified" /> : null}
          </div>
          <div className="text-xs text-muted-foreground">@{user.username}</div>
          {user.description ? (
            <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{user.description}</p>
          ) : null}
          {metrics.length > 0 ? (
            <p className="text-[10px] text-muted-foreground font-mono-num pt-1">{metrics.join(" · ")}</p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-4 pb-4">
        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-8">
          <a href={href} target="_blank" rel="noopener noreferrer">
            Open on X
            <ExternalLink className="w-3.5 h-3.5 ml-1.5 inline" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${Math.round(n / 1000)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
