import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { setPageSeo } from "@/lib/pageSeo";
import { blogTagLabels, getBlogPostBySlug } from "@/content/blog/registry";
import NotFound from "./NotFound";

function siteOrigin(): string {
  const o = import.meta.env.VITE_SITE_ORIGIN?.trim();
  if (o) return o.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = getBlogPostBySlug(slug);

  useEffect(() => {
    if (!post) return;
    const canonicalPath = `/blog/${post.slug}`;
    const url = `${siteOrigin()}${canonicalPath}`;
    return setPageSeo({
      title: `${post.title} | Onchain Savings Club`,
      description: post.description,
      canonicalPath,
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        author: {
          "@type": "Organization",
          name: "Onchain Savings Club",
        },
        publisher: {
          "@type": "Organization",
          name: "Onchain Savings Club",
        },
      },
    });
  }, [post]);

  if (!post) {
    return <NotFound />;
  }

  const Body = post.Body;

  return (
    <article className="max-w-3xl space-y-8">
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" className="rounded-xl -ml-2" asChild>
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-1 inline" />
            Blog
          </Link>
        </Button>
      </div>

      <header className="space-y-3 border-b border-border/60 pb-6">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map(t => (
            <Badge key={t} variant="outline" className="text-[10px]">
              {blogTagLabels[t]}
            </Badge>
          ))}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">{post.title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{post.description}</p>
        <p className="text-xs text-muted-foreground">
          <time dateTime={post.publishedAt}>{post.publishedAt}</time>
          <span className="mx-2">·</span>
          {post.readingTimeMinutes} min read
          <span className="mx-2">·</span>
          Educational only — not financial advice
        </p>
      </header>

      <div
        className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-display prose-a:text-primary prose-strong:text-foreground"
      >
        <Body />
      </div>

      <section className="glass-card rounded-2xl border border-border/60 p-5 space-y-3">
        <h2 className="font-display text-base font-semibold">Next steps in the app</h2>
        <p className="text-xs text-muted-foreground">
          Deep links are the fastest way to move from reading to verifying what you care about on-chain.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="rounded-xl" asChild>
            <Link to="/vault">Vault</Link>
          </Button>
          <Button size="sm" variant="secondary" className="rounded-xl" asChild>
            <Link to="/strategies">Strategies</Link>
          </Button>
          <Button size="sm" variant="secondary" className="rounded-xl" asChild>
            <Link to="/portfolio">Portfolio</Link>
          </Button>
          <Button size="sm" variant="secondary" className="rounded-xl" asChild>
            <Link to="/academy">Academy</Link>
          </Button>
          <Button size="sm" variant="secondary" className="rounded-xl" asChild>
            <Link to="/transparency">Transparency</Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
