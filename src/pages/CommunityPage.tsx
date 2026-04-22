import { useState } from "react";
import { useConnection } from "wagmi";
import { Trophy, MessageSquare, Sparkles, Users, Loader2 } from "lucide-react";
import { leaderboard } from "@/data/club";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/formatTime";
import { InvestorAddressLink } from "@/components/wealth/InvestorAddressLink";
import { useCommunityMessagesQuery, usePostCommunityMessageMutation } from "@/hooks/useCommunity";

const rankColor = (rank: number) =>
  rank === 1 ? "text-gold" : rank === 2 ? "text-muted-foreground" : rank === 3 ? "text-warning" : "text-foreground";

export const CommunityPage = () => {
  const { address, status } = useConnection();
  const [draft, setDraft] = useState("");
  const { data, isLoading, isError } = useCommunityMessagesQuery();
  const postMut = usePostCommunityMessageMutation();

  const messages = data?.messages ?? [];
  const connected = status === "connected" && address;

  const send = () => {
    if (!connected || !draft.trim()) return;
    postMut.mutate(
      { address: address!, text: draft.trim() },
      {
        onSuccess: () => setDraft(""),
      },
    );
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Community</h1>
        <p className="text-muted-foreground text-sm mt-1">Leaderboard, discussions and member activity.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Leaderboard */}
        <div className="glass-card p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              <h2 className="font-display font-semibold text-lg">Club Leaderboard</h2>
            </div>
            <div className="flex items-center gap-1 glass rounded-lg p-1">
              {["XP", "Savings", "Yield"].map((p, i) => (
                <button
                  key={p}
                  type="button"
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-md",
                    i === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {leaderboard.map(m => (
              <div
                key={m.rank}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl border transition",
                  m.isYou
                    ? "border-primary/40 bg-primary/5 shadow-glow"
                    : "border-border/60 bg-secondary/30 hover:border-primary/30",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg",
                    rankColor(m.rank),
                  )}
                >
                  {m.rank <= 3 ? "★" : m.rank}
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-mono text-xs font-bold">
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{m.name}</span>
                    {m.isYou && (
                      <Badge variant="outline" className="text-[9px] border-primary/40 text-primary py-0">
                        YOU
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{m.level}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono-num font-semibold text-sm">{m.xp.toLocaleString()} XP</div>
                  <div className="text-xs text-muted-foreground font-mono-num">${m.savings.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col min-h-[420px]">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Member Chat</h2>
            <Badge variant="outline" className="ml-auto border-border/60 text-[10px]">
              Live (server)
            </Badge>
          </div>

          <p className="text-[10px] text-muted-foreground mb-2">
            Demo mode: messages are stored by wallet address without cryptographic signatures.
          </p>

          <div className="space-y-3 mb-4 flex-1 max-h-[400px] overflow-y-auto min-h-[200px]">
            {isLoading && (
              <div className="flex items-center justify-center py-8 text-muted-foreground text-sm gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading messages…
              </div>
            )}
            {isError && (
              <p className="text-sm text-destructive">Could not load chat. Is the API running (npm run dev)?</p>
            )}
            {!isLoading && !isError && messages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No messages yet — say hello.</p>
            )}
            {!isLoading &&
              messages.map(m => {
                const you = connected && address?.toLowerCase() === m.address.toLowerCase();
                return (
                  <div
                    key={m.id}
                    className={cn(
                      "p-3 rounded-xl border",
                      you ? "border-primary/30 bg-primary/5" : "border-border/60 bg-secondary/30",
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <InvestorAddressLink address={m.address} className="text-xs font-medium" />
                      <Badge variant="outline" className="text-[9px] border-border/60 py-0">
                        Member
                      </Badge>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {formatRelativeTime(m.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed break-words">{m.text}</p>
                  </div>
                );
              })}
          </div>

          <div className="flex flex-col gap-2 mt-auto">
            {!connected && (
              <p className="text-xs text-amber-600 dark:text-amber-400">Connect a wallet to post to the club chat.</p>
            )}
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                disabled={!connected || postMut.isPending}
                placeholder={connected ? "Share with the club…" : "Connect wallet to send"}
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground min-h-[44px]"
              />
              <Button
                size="sm"
                type="button"
                className="rounded-lg bg-gradient-primary text-primary-foreground hover:opacity-90 shrink-0 min-h-[44px]"
                disabled={!connected || !draft.trim() || postMut.isPending}
                onClick={send}
              >
                {postMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total members", value: "12,847" },
          { icon: Sparkles, label: "Avg level", value: "Investor" },
          { icon: MessageSquare, label: "Chat messages", value: String(messages.length) },
          { icon: Trophy, label: "Achievements minted", value: "84,210" },
        ].map(s => (
          <div key={s.label} className="glass-card p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</div>
              <div className="font-display font-semibold font-mono-num">{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
