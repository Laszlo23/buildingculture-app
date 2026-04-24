import { Link } from "react-router-dom";
import { ArrowLeft, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLUB_MANIFEST_FOOTER, CLUB_MANIFEST_PAGE } from "@/data/clubManifest";
import { SITE_TAGLINE } from "@/lib/siteTagline";

export function ManifestPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10 pb-8">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" className="rounded-xl -ml-2 w-fit" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Home
          </Link>
        </Button>
      </div>

      <header className="space-y-4 border-b border-border/60 pb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ScrollText className="w-3.5 h-3.5" aria-hidden />
          {CLUB_MANIFEST_PAGE.subtitle}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">{CLUB_MANIFEST_PAGE.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Product line you see everywhere: <span className="text-foreground/90 font-medium">{SITE_TAGLINE}</span> This
          page is the longer answer—intent, boundaries, and who we built for.
        </p>
      </header>

      <section className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-5 sm:p-6 space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{CLUB_MANIFEST_FOOTER.kicker}</p>
        <p className="font-display text-lg font-medium text-foreground leading-snug">{CLUB_MANIFEST_FOOTER.headline}</p>
        {CLUB_MANIFEST_FOOTER.paragraphs.map((p, i) => (
          <p key={i} className="text-sm text-muted-foreground leading-relaxed">
            {p}
          </p>
        ))}
      </section>

      <div className="space-y-10">
        {CLUB_MANIFEST_PAGE.sections.map(sec => (
          <section key={sec.heading} className="space-y-3">
            <h2 className="font-display text-xl font-semibold tracking-tight">{sec.heading}</h2>
            <ul className="space-y-3 list-none pl-0">
              {sec.body.map((p, i) => (
                <li
                  key={i}
                  className="text-sm text-muted-foreground leading-relaxed border-l-2 border-border/70 pl-4 py-0.5"
                >
                  {p}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/60">
        <Button asChild className="rounded-xl">
          <Link to="/vault">Open vault</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to="/academy">Academy</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-xl text-muted-foreground">
          <Link to="/transparency">Transparency</Link>
        </Button>
      </footer>
    </div>
  );
}
