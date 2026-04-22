import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { FarcasterUserDto } from "@/lib/api";
import { cn } from "@/lib/utils";

type Props = {
  user: FarcasterUserDto;
  className?: string;
  onUseLink?: (url: string) => void;
};

export function FarcasterProfileCard({ user, className, onUseLink }: Props) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-secondary/20 overflow-hidden flex flex-col sm:flex-row gap-4 p-4",
        className,
      )}
    >
      {user.pfpUrl && (
        <img
          src={user.pfpUrl}
          alt=""
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-border/50 shrink-0"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-[10px]">
            Farcaster
          </Badge>
          <a
            href={user.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-display font-semibold text-lg text-primary hover:underline truncate"
          >
            @{user.username}
          </a>
        </div>
        {user.displayName && user.displayName !== user.username && (
          <p className="text-sm text-muted-foreground">{user.displayName}</p>
        )}
        {user.bio && <p className="text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">{user.bio}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" className="rounded-lg gap-1" asChild>
            <a href={user.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" /> Open Warpcast
            </a>
          </Button>
          {onUseLink && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-lg"
              onClick={() => onUseLink(user.url)}
            >
              Save link in profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function FarcasterHandlePill({
  user,
  className,
}: {
  user: FarcasterUserDto;
  className?: string;
}) {
  return (
    <a
      href={user.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "text-[11px] font-medium text-primary hover:underline tabular-nums",
        className,
      )}
    >
      @{user.username}
    </a>
  );
}
