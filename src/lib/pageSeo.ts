/** Matches `index.html` defaults for SPA cleanup between routes. */
export const DEFAULT_PAGE_TITLE = "Onchain Savings Club — AI Optimized Smart Savings on Chain";
export const DEFAULT_PAGE_DESCRIPTION =
  "AI optimized smart savings on chain — a community-driven DAO for diversified Web3 yield: tokenized real estate, BTC mining, AI-assisted vaults, and DeFi strategies.";

function siteOrigin(): string {
  const o = import.meta.env.VITE_SITE_ORIGIN?.trim();
  if (o) return o.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

function upsertMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function removeJsonLd(id: string) {
  document.getElementById(id)?.remove();
}

export type PageSeoOptions = {
  title: string;
  description: string;
  /** Path only, e.g. `/blog/my-post` */
  canonicalPath: string;
  /** Optional BlogPosting JSON-LD for article pages */
  jsonLd?: Record<string, unknown>;
};

/**
 * Client-side SEO for Vite SPA: title, meta description, canonical.
 * Call from `useEffect`; return cleanup from `clearPageSeo()` on unmount.
 */
export function setPageSeo(opts: PageSeoOptions): () => void {
  const origin = siteOrigin();
  const path = opts.canonicalPath.startsWith("/") ? opts.canonicalPath : `/${opts.canonicalPath}`;
  const canonical = `${origin}${path}`;

  document.title = opts.title;
  upsertMeta("description", opts.description);
  upsertCanonical(canonical);

  const jsonId = "page-seo-jsonld";
  removeJsonLd(jsonId);
  if (opts.jsonLd) {
    const script = document.createElement("script");
    script.id = jsonId;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(opts.jsonLd);
    document.head.appendChild(script);
  }

  return () => {
    clearPageSeo();
  };
}

/** Reset to marketing defaults without needing prior title. */
export function clearPageSeo(): void {
  document.title = DEFAULT_PAGE_TITLE;
  upsertMeta("description", DEFAULT_PAGE_DESCRIPTION);
  const origin = siteOrigin();
  upsertCanonical(origin ? `${origin}/` : "/");
  removeJsonLd("page-seo-jsonld");
}
