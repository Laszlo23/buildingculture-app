import { useCallback, useEffect, useState } from "react";
import type { CarouselApi } from "@/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { publicAssetSrc } from "@/data/realAssets";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 5500;

type Chip = { label: string; value: string };

type Props = {
  images: string[];
  /** e.g. location line */
  supportiveTitle: string;
  /** Main title on overlay */
  headline: string;
  chips?: Chip[];
  onOpenImage?: (payload: { src: string; alt: string }) => void;
};

export function VillaImageShowcase({ images, supportiveTitle, headline, chips = [], onOpenImage }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState<Record<string, true>>({});

  const onSelect = useCallback((embla: CarouselApi) => {
    if (!embla) return;
    setCurrent(embla.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    if (!api || images.length < 2) return;
    const id = window.setInterval(() => {
      api.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [api, images.length]);

  if (images.length === 0) return null;

  return (
    <div className="relative rounded-2xl overflow-hidden border border-border/60 bg-secondary/20 shadow-inner">
      <Carousel
        opts={{ align: "start", loop: images.length > 1 }}
        setApi={setApi}
        className="w-full"
        aria-label="Villa photo slideshow"
      >
        <CarouselContent className="-ml-0">
          {images.map((src, i) => {
            const encoded = publicAssetSrc(src);
            const alt = `${headline} · photo ${i + 1}`;
            const isFailed = failed[src];
            return (
              <CarouselItem key={src} className="pl-0 basis-full">
                <div className="relative min-h-[280px] sm:min-h-[360px] lg:min-h-[420px] w-full bg-background/40">
                  {isFailed ? (
                    <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                      Image unavailable
                    </div>
                  ) : onOpenImage ? (
                    <button
                      type="button"
                      className="absolute inset-0 block w-full h-full text-left cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      onClick={() => onOpenImage({ src: encoded, alt })}
                    >
                      <img
                        src={encoded}
                        alt={alt}
                        loading={i === 0 ? "eager" : "lazy"}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={() => setFailed(prev => ({ ...prev, [src]: true }))}
                      />
                      <span className="sr-only">Open larger view</span>
                    </button>
                  ) : (
                    <img
                      src={encoded}
                      alt={alt}
                      loading={i === 0 ? "eager" : "lazy"}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={() => setFailed(prev => ({ ...prev, [src]: true }))}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/35 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 pointer-events-none z-10 space-y-3 max-w-3xl">
                    <p className="text-xs font-medium uppercase tracking-wider text-primary/90">{supportiveTitle}</p>
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-foreground drop-shadow-sm">
                      {headline}
                    </h2>
                    {chips.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {chips.map(row => (
                          <span
                            key={row.label}
                            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/85 px-3 py-1 text-xs backdrop-blur-sm"
                          >
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-mono-num text-foreground">{row.value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious
              variant="secondary"
              className="left-2 sm:left-4 top-[42%] -translate-y-1/2 border-border/70 bg-background/80 shadow-md h-10 w-10"
            />
            <CarouselNext
              variant="secondary"
              className="right-2 sm:right-4 top-[42%] -translate-y-1/2 border-border/70 bg-background/80 shadow-md h-10 w-10"
            />
          </>
        )}
      </Carousel>

      {images.length > 1 && (
        <div
          className="flex justify-center gap-1.5 py-3 border-t border-border/40 bg-background/40"
          role="tablist"
          aria-label="Slide indicators"
        >
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/70",
              )}
              onClick={() => api?.scrollTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
