import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { setPageSeo } from "@/lib/pageSeo";
import { blogTagLabels, getBlogPosts, getFeaturedPosts, type BlogTag } from "@/content/blog/registry";

export function BlogIndexPage() {
  const [tag, setTag] = useState<BlogTag | "all">("all");
  const posts = useMemo(() => getBlogPosts(), []);
  const featured = useMemo(() => getFeaturedPosts(), []);

  const filtered =
    tag === "all" ? posts : posts.filter(p => p.tags.includes(tag));

  useEffect(() => {
    return setPageSeo({
      title: "Insights blog — RWA, AI-assisted strategies, and club growth | Onchain Savings Club",
      description:
        "Educational articles on tokenized real-world assets, AI-assisted workflows around strategies, yield framing, and transparency-first onboarding. Not financial advice.",
      canonicalPath: "/blog",
    });
  }, []);

  return (
    <div className="space-y-10 max-w-5xl">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <BookOpen className="w-3.5 h-3.5" />
          Insights
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Blog</h1>
        <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
          Long-form notes on RWA framing, AI-assisted workflows around strategies, yield literacy, and
          transparency-first onboarding. Educational only — not financial advice.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" className="rounded-xl" asChild>
            <Link to="/vault">Vault</Link>
          </Button>
          <Button size="sm" variant="secondary" className="rounded-xl" asChild>
            <Link to="/strategies">Strategies</Link>
          </Button>
          <Button size="sm" variant="secondary" className="rounded-xl" asChild>
            <Link to="/academy">Academy</Link>
          </Button>
        </div>
      </header>

      {featured.length > 0 && (
        <section aria-labelledby="featured-heading" className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 id="featured-heading" className="font-display text-lg font-semibold">
              Featured
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {featured.map(post => (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className="group glass-card rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-5 transition hover:border-primary/40 hover:shadow-glow"
              >
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {post.tags.map(t => (
                    <Badge key={t} variant="outline" className="text-[10px] border-primary/30">
                      {blogTagLabels[t]}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-display font-semibold text-base group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{post.description}</p>
                <p className="text-[10px] text-muted-foreground mt-3">
                  {post.publishedAt} · {post.readingTimeMinutes} min read
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">All posts</h2>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by topic">
          <button
            type="button"
            onClick={() => setTag("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium border transition",
              tag === "all" ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground",
            )}
          >
            All
          </button>
          {(Object.keys(blogTagLabels) as BlogTag[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium border transition",
                tag === t ? "border-primary bg-primary/15 text-primary" : "border-border/60 text-muted-foreground",
              )}
            >
              {blogTagLabels[t]}
            </button>
          ))}
        </div>

        <ul className="space-y-3">
          {filtered.map(post => (
            <li key={post.slug}>
              <Link
                to={`/blog/${post.slug}`}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-border/60 bg-secondary/20 px-4 py-3 hover:border-primary/35 transition"
              >
                <div className="min-w-0">
                  <span className="font-medium text-foreground">{post.title}</span>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{post.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {post.tags.slice(0, 3).map(t => (
                    <Badge key={t} variant="secondary" className="text-[10px]">
                      {blogTagLabels[t]}
                    </Badge>
                  ))}
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {post.readingTimeMinutes} min
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
