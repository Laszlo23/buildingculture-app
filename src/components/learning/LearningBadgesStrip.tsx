import { useQuery } from "@tanstack/react-query";
import { Award, Loader2 } from "lucide-react";
import { useConnection } from "wagmi";
import { chainApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const qk = (addr: string | undefined) => ["nft", "badges", addr] as const;

export function LearningBadgesStrip({ className }: { className?: string }) {
  const { address, status } = useConnection();
  const { data, isLoading } = useQuery({
    queryKey: qk(address),
    queryFn: () => chainApi.nftBadges(address!),
    enabled: status === "connected" && Boolean(address),
  });

  if (status !== "connected" || !address) {
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

  if (!data?.badges?.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
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
          <Award className="h-3.5 w-3.5 shrink-0" />
          <span>{b.name}</span>
          {b.minted ? (
            <span className="text-[10px] opacity-80">minted</span>
          ) : (
            <span className="text-[10px]">locked</span>
          )}
        </div>
      ))}
    </div>
  );
}
