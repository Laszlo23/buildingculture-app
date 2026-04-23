import { useState } from "react";
import { Users, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { chainApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useChainConfig } from "@/hooks/useChainData";

export const CommunityBuilderPanel = () => {
  const { data: chainCfg } = useChainConfig();
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const ask = async () => {
    const text = q.trim();
    if (!text) return;
    setPending(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await chainApi.askCommunityBuilder({ userMessage: text });
      setAnswer(res.completion);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  };

  const inChatAgent = chainCfg?.ai?.communityAgentInChat === true;

  return (
    <section
      className="mb-4 rounded-xl border border-info/25 bg-gradient-to-br from-info/[0.07] to-transparent p-4"
      aria-labelledby="community-builder-heading"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-info/15 text-info">
          <Users className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <h3 id="community-builder-heading" className="font-display text-sm font-semibold flex items-center gap-1">
            Community Builder
            <Sparkles className="h-3.5 w-3.5 text-amber-500" aria-hidden />
          </h3>
          <p className="text-[10px] text-muted-foreground leading-snug">
            Growth and culture — icebreakers, prompts, healthy norms. Not financial advice. Same engine as{" "}
            <code className="text-foreground/80">LANGBASE_API_KEY</code> and Telegram{" "}
            <code className="text-foreground/80">@culturebuildingbot</code> when the webhook is configured.
          </p>
        </div>
      </div>

      {inChatAgent && (
        <p className="text-[10px] text-muted-foreground mb-2 rounded-md border border-border/50 bg-secondary/30 px-2 py-1.5">
          In-chat mode is on: after you post in Member Chat, the builder may add one short reply in the thread (rate
          limits apply).
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
        <label className="sr-only" htmlFor="community-builder-input">
          Message for Community Builder
        </label>
        <textarea
          id="community-builder-input"
          value={q}
          onChange={e => setQ(e.target.value)}
          rows={2}
          disabled={pending}
          placeholder="Ask for a welcome prompt, icebreaker, or how to keep discussion constructive…"
          className={cn(
            "min-h-[64px] w-full flex-1 rounded-lg border border-border/60 bg-secondary/40 px-2.5 py-2 text-xs",
            "placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-info/30",
          )}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="h-9 shrink-0 self-end rounded-lg border-info/30 sm:self-stretch sm:min-w-[5.5rem]"
          disabled={pending || !q.trim()}
          onClick={ask}
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ask"}
        </Button>
      </div>

      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {answer && (
        <div className="mt-2 rounded-lg border border-border/60 bg-card/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {answer}
        </div>
      )}
    </section>
  );
};
