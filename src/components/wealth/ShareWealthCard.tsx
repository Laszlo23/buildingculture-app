import { useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { chainApi, type WealthDto } from "@/lib/api";
import { learningNftImageUrlForAchievementType } from "@/lib/nftCredentialArt";
import { SITE_TAGLINE } from "@/lib/siteTagline";
import { WealthLineChart } from "./WealthLineChart";
import { cn } from "@/lib/utils";

type Props = {
  data: WealthDto;
  shortAddress: string;
  className?: string;
};

export function ShareWealthCard({ data, shortAddress, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { data: nftBadges } = useQuery({
    queryKey: ["nft", "badges", data.address] as const,
    queryFn: () => chainApi.nftBadges(data.address),
  });
  const mintedCredentials = (nftBadges?.badges ?? []).filter(b => b.minted);

  const exportPng = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    try {
      const dataUrl = await toPng(el, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#0a0f0d",
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `osc-wealth-${shortAddress.replace(/…/g, "-")}.png`;
      a.click();
      toast.success("Card downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not render image");
    }
  }, [shortAddress]);

  const alias = data.profile.wealthDisplayName?.trim() || shortAddress;
  const level = data.level.label;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" className="rounded-xl gap-2" onClick={() => void exportPng()}>
          <Download className="h-4 w-4" />
          Share my wealth journey (PNG)
        </Button>
        <p className="text-[10px] text-muted-foreground self-center">
          Optimized for X / Farcaster. Snapshot uses current graph range.
        </p>
      </div>

      <div
        ref={ref}
        className="relative w-full max-w-[720px] overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-background via-background to-primary/10 p-6 space-y-4"
        style={{ aspectRatio: "16 / 10" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 20%, hsl(var(--primary)) 0%, transparent 45%), radial-gradient(circle at 80% 60%, hsl(142 76% 36%) 0%, transparent 40%)",
          }}
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logosavingsclub.png" alt="" className="h-10 w-auto object-contain shrink-0" width={120} height={46} />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-widest text-primary font-semibold">Onchain Savings Club</p>
              <p className="text-[9px] font-medium text-primary/85 leading-snug mt-0.5 line-clamp-2">{SITE_TAGLINE}</p>
              <p className="font-display text-lg font-semibold truncate mt-1">{alias}</p>
              <p className="text-xs text-muted-foreground font-mono">{shortAddress}</p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <div className="rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-center">
              <p className="text-[9px] uppercase text-muted-foreground">Level</p>
              <p className="text-sm font-semibold text-primary">{level}</p>
            </div>
            {mintedCredentials.length > 0 && (
              <div className="flex flex-col items-end gap-1">
                <p className="text-[8px] uppercase tracking-wide text-muted-foreground">Minted</p>
                <div className="flex flex-row-reverse flex-wrap justify-end gap-1">
                  {mintedCredentials.map(b => (
                    <div
                      key={b.id}
                      title={b.name}
                      className="h-8 w-8 overflow-hidden rounded-lg border border-primary/35 bg-secondary/30 shadow-sm"
                    >
                      <img
                        src={learningNftImageUrlForAchievementType(b.achievementType)}
                        alt={b.name}
                        className="h-full w-full object-cover"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-secondary/40 border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Vault balance</p>
            <p className="text-xl font-mono-num font-semibold text-foreground">
              {data.portfolio.totalSavings.toLocaleString(undefined, {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <div className="rounded-xl bg-secondary/40 border border-border/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase">Total yield</p>
            <p className="text-xl font-mono-num font-semibold text-success">
              +{data.portfolio.yieldEarned.toLocaleString(undefined, {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </div>
        <div className="relative h-40 rounded-xl border border-border/40 bg-black/20 overflow-hidden">
          <WealthLineChart data={data.series.slice(-14)} />
        </div>
        <div className="relative flex items-center gap-2 text-[10px] text-muted-foreground">
          <Share2 className="h-3 w-3 text-primary" />
          <span>app.buildingculture.capital · Public wealth graph</span>
        </div>
      </div>
    </div>
  );
}
