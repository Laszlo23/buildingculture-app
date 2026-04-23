import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TwttrWidgets = {
  load: (element?: Element | null) => void | Promise<void>;
};

type Twttr = {
  widgets?: TwttrWidgets;
  ready?: (cb: (t: Twttr) => void) => void;
};

function getTwttr(): Twttr | undefined {
  return (window as unknown as { twttr?: Twttr }).twttr;
}

function loadWidgetsScript(): Promise<void> {
  const w = getTwttr();
  if (w?.widgets?.load) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const src = "https://platform.twitter.com/widgets.js";
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      if (getTwttr()?.widgets?.load) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("X embed script failed")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.charset = "utf-8";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("X embed script failed"));
    document.body.appendChild(script);
  });
}

/**
 * Embedded X (Twitter) timeline for a public handle — uses platform.twitter.com/widgets.js.
 * Does not require X API keys; ad blockers may hide the widget.
 */
export function XTimelineEmbed({
  username,
  className,
}: {
  /** Screen name without @ */
  username: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const handle = username.replace(/^@/, "").trim().toLowerCase();
  const profileHref = `https://x.com/${encodeURIComponent(handle)}`;

  useEffect(() => {
    if (!handle || !/^[a-z0-9_]{1,15}$/i.test(handle)) {
      setLoading(false);
      return;
    }

    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    setLoadError(null);
    setLoading(true);
    el.innerHTML = "";

    const anchor = document.createElement("a");
    anchor.className = "twitter-timeline";
    anchor.href = `https://twitter.com/${encodeURIComponent(handle)}`;
    anchor.textContent = `Posts by @${handle}`;
    anchor.setAttribute("data-theme", "dark");
    anchor.setAttribute("data-height", "560");
    anchor.setAttribute("data-chrome", "nofooter transparent");
    anchor.setAttribute("data-dnt", "true");
    el.appendChild(anchor);

    void (async () => {
      try {
        await loadWidgetsScript();
        if (cancelled) return;
        const twttr = getTwttr();
        if (!twttr?.widgets?.load) {
          if (!cancelled) setLoadError("Could not load the X timeline widget (blocked or offline).");
          return;
        }
        if (twttr.ready) {
          twttr.ready(t => {
            if (!cancelled) t.widgets?.load(el);
          });
        } else {
          twttr.widgets.load(el);
        }
      } catch {
        if (!cancelled) setLoadError("Could not load the X timeline widget (blocked or offline).");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      el.innerHTML = "";
    };
  }, [handle]);

  if (!handle || !/^[a-z0-9_]{1,15}$/i.test(handle)) return null;

  return (
    <div className={cn("rounded-xl border border-border/60 bg-secondary/20 overflow-hidden", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 px-4 py-2.5">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Latest on X</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Public timeline embed — opens in X if the preview does not load (e.g. ad blockers).
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="rounded-xl h-8 text-xs shrink-0">
          <a href={profileHref} target="_blank" rel="noopener noreferrer">
            Open profile
            <ExternalLink className="w-3 h-3 ml-1 inline" />
          </a>
        </Button>
      </div>
      <div className="relative min-h-[200px] max-h-[620px] overflow-x-auto overflow-y-auto px-1 pb-2">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-background/80 text-sm text-muted-foreground backdrop-blur-[2px]">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            Loading timeline…
          </div>
        )}
        {loadError && (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground space-y-3">
            <p>{loadError}</p>
            <Button asChild variant="secondary" size="sm" className="rounded-xl">
              <a href={profileHref} target="_blank" rel="noopener noreferrer">
                View @{handle} on X
              </a>
            </Button>
          </div>
        )}
        {!loadError && <div ref={containerRef} className="min-h-[180px]" aria-live="polite" />}
      </div>
    </div>
  );
}
