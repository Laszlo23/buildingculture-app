import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Leaf } from "lucide-react";
import type { RealAssetEntry } from "@/data/realAssets";
import { publicAssetSrc } from "@/data/realAssets";
import { cn } from "@/lib/utils";

type Props = {
  asset: RealAssetEntry;
  sectionIndex: number;
  onOpenImage: (payload: { src: string; alt: string }) => void;
};

function highlightRows(asset: RealAssetEntry) {
  const labels = asset.highlightFactLabels ?? [];
  if (labels.length === 0) return [];
  return asset.factSheet.filter(row => labels.includes(row.label));
}

export function PropertyBackingSection({ asset, sectionIndex, onOpenImage }: Props) {
  const [failed, setFailed] = useState<Record<string, true>>({});
  const heroSrc = asset.imagePaths[0];
  const galleryPaths = asset.imagePaths.slice(1);

  const chips = useMemo(() => highlightRows(asset), [asset]);

  const markFailed = (path: string) => () => setFailed(prev => ({ ...prev, [path]: true }));

  const renderThumb = (src: string, index: number, opts?: { hero?: boolean }) => {
    const encoded = publicAssetSrc(src);
    const alt = `${asset.title} · photo ${index + 1}`;
    if (failed[src]) {
      return (
        <div
          className={cn(
            "flex items-center justify-center bg-secondary/40 text-muted-foreground text-xs text-center px-2 border border-border/50",
            opts?.hero ? "min-h-[280px] rounded-2xl" : "aspect-video rounded-xl",
          )}
        >
          Image unavailable
        </div>
      );
    }
    return (
      <button
        type="button"
        onClick={() => onOpenImage({ src: encoded, alt })}
        className={cn(
          "group overflow-hidden border border-border/60 bg-secondary/20 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ring-offset-2 ring-offset-background rounded-xl relative",
          opts?.hero ? "block w-full min-h-[280px] sm:min-h-[340px]" : "aspect-video w-full",
        )}
      >
        <img
          src={encoded}
          alt={alt}
          loading={opts?.hero ? "eager" : "lazy"}
          className={cn(
            "w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]",
            opts?.hero ? "absolute inset-0 h-full min-h-[280px]" : "",
          )}
          onError={markFailed(src)}
        />
        {opts?.hero && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent pointer-events-none" />
        )}
        <span className="sr-only">Open larger view</span>
      </button>
    );
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: sectionIndex * 0.06 }}
      className="glass-card overflow-hidden"
    >
      <div className="relative">
        {heroSrc ? (
          <div className="relative">
            {renderThumb(heroSrc, 0, { hero: true })}
            <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8 pointer-events-none z-10">
              <div className="space-y-3 max-w-3xl">
                <p className="text-xs font-medium uppercase tracking-wider text-primary/90">{asset.location}</p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground drop-shadow-sm">
                  {asset.shortTitle}
                </h2>
                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {chips.map(row => (
                      <span
                        key={row.label}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3 py-1 text-xs backdrop-blur-sm"
                      >
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="font-mono-num text-foreground">{row.value}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 border-b border-border/60">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{asset.location}</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight mt-1">{asset.title}</h2>
          </div>
        )}
      </div>

      <div className="p-6 lg:p-8 space-y-6">
        <div className="space-y-1">
          {heroSrc ? (
            <h3 className="font-display text-lg font-semibold sr-only">{asset.title}</h3>
          ) : null}
          {!heroSrc && <h2 className="font-display text-xl font-semibold">{asset.title}</h2>}
          {asset.caveat && (
            <p className="text-xs text-amber-600 dark:text-amber-400 border-l-2 border-amber-500/50 pl-3 mt-2">
              {asset.caveat}
            </p>
          )}
        </div>

        {galleryPaths.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Gallery</h3>
            <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
              {galleryPaths.map((src, i) => (
                <div key={src} className="shrink-0 w-[min(100%,280px)] sm:w-auto snap-center">
                  {renderThumb(src, i + 1)}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Tap an image to open a larger view.</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground leading-relaxed">{asset.summary}</p>

        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary" /> Fact sheet
          </h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {asset.factSheet.map(row => (
              <div key={row.label} className="flex justify-between gap-4 border-b border-border/40 pb-2">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="font-mono-num text-right">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h3 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-gold" /> Green print
          </h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            {asset.greenPrint.map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-border/60 bg-secondary/30 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Legal structure & valuation
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{asset.legalNote}</p>
          {asset.pdfPaths.length > 0 && (
            <ul className="mt-3 space-y-1">
              {asset.pdfPaths.map(pdf => (
                <li key={pdf}>
                  <a href={pdf} className="text-sm text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    {pdf}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </motion.article>
  );
}
