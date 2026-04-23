import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { useConnection } from "wagmi";
import { Button } from "@/components/ui/button";
import { chainApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";

export const ClubAIPanel = () => {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const { address, status } = useConnection();

  const { data: sale, isLoading: saleLoading } = useQuery({
    queryKey: ["membership", "sale", status === "connected" ? address : ""],
    queryFn: () => chainApi.getMembershipSale(status === "connected" && address ? address : undefined),
  });

  const gateActive = sale?.configured === true;
  const hasPass =
    gateActive && sale.balance != null && sale.balance !== "" && BigInt(sale.balance) > 0n;
  const mustConnect = gateActive && status !== "connected";
  const mustMint = gateActive && status === "connected" && address && !hasPass;
  const askDisabled = pending || !q.trim() || mustConnect || mustMint;

  const ask = async () => {
    const text = q.trim();
    if (!text) return;
    if (mustConnect || mustMint) return;
    setPending(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await chainApi.askBuildingCultureClub({
        userMessage: text,
        ...(address ? { walletAddress: address } : {}),
      });
      setAnswer(res.completion);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
    } finally {
      setPending(false);
    }
  };

  return (
    <section
      className="glass-card p-6 border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent"
      aria-labelledby="club-ai-heading"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-9 h-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
          <Bot className="w-5 h-5" aria-hidden />
        </div>
        <div>
          <h2 id="club-ai-heading" className="font-display font-semibold text-lg flex items-center gap-1.5">
            Club AI
            <Sparkles className="w-4 h-4 text-amber-500" aria-hidden />
          </h2>
          <p className="text-xs text-muted-foreground">
            Educational only — not financial advice. Answers are generated on the server; your keys stay off the
            client.
          </p>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground mt-3 mb-2">
        Requires <code className="text-foreground/80">LANGBASE_API_KEY</code> on the API. If the server has no key,
        you will see a configuration message.
      </p>

      {saleLoading ? (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking access…
        </p>
      ) : null}

      {gateActive && mustConnect ? (
        <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-foreground/90 space-y-2">
          <p>Club AI requires a Citizen membership NFT. Connect the wallet that holds your pass.</p>
          <WalletConnectButton disconnectedPrimary disconnectedLabel="Connect wallet" />
        </div>
      ) : null}

      {gateActive && mustMint ? (
        <div className="mt-3 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-foreground/90 space-y-2">
          <p>This server requires a Citizen pass for Club AI. Mint on the Membership page, then ask again.</p>
          <Button size="sm" className="rounded-xl" asChild>
            <Link to="/membership">Get Citizen pass</Link>
          </Button>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <label className="sr-only" htmlFor="club-ai-question">
          Your question
        </label>
        <textarea
          id="club-ai-question"
          value={q}
          onChange={e => setQ(e.target.value)}
          rows={2}
          disabled={pending || mustConnect || mustMint}
          placeholder="Ask about the vault, treasury, strategies, or the club in plain language…"
          className={cn(
            "w-full min-h-[72px] rounded-xl border border-border/60 bg-secondary/40 px-3 py-2 text-sm",
            "placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30",
          )}
        />
        <Button
          type="button"
          className="shrink-0 h-11 self-end sm:self-stretch min-w-[7rem] rounded-xl bg-gradient-primary text-primary-foreground"
          disabled={askDisabled}
          onClick={() => void ask()}
        >
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
        </Button>
      </div>

      {error && (
        <div className="mt-3 space-y-2" role="alert">
          <p className="text-sm text-destructive">{error}</p>
          {/Citizen membership|walletAddress/i.test(error) ? (
            <Button variant="outline" size="sm" className="rounded-xl" asChild>
              <Link to="/membership">Membership / mint</Link>
            </Button>
          ) : null}
        </div>
      )}

      {answer && (
        <div className="mt-4 p-4 rounded-xl border border-border/60 bg-secondary/30 text-sm leading-relaxed whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </section>
  );
};
