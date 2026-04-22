import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useConnection } from "wagmi";
import {
  UserCircle,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Circle,
  Share2,
  MessageSquare,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  useCompleteDailyTaskMutation,
  useDailyTasksQuery,
  useMemberProfileQuery,
  usePutProfileMutation,
  useWeb3BioProfileQuery,
} from "@/hooks/useCommunity";
import { useFarcasterQuery } from "@/hooks/useFarcaster";
import type { MemberProfileDto } from "@/lib/api";
import { web3BioAvatarSrc } from "@/lib/web3bioFetch";
import { FarcasterProfileCard } from "@/components/social/FarcasterProfileCard";

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

function Web3BioCards({ payload }: { payload: unknown }) {
  const items = useMemo(() => {
    if (payload == null) return [];
    if (Array.isArray(payload)) return payload;
    return [payload];
  }, [payload]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No Web3.bio profiles indexed for this address yet. Link ENS, Farcaster, or Lens on{" "}
        <a href="https://web3.bio" target="_blank" rel="noopener noreferrer" className="text-primary underline">
          web3.bio
        </a>{" "}
        — or try again after the graph updates.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item, i) => {
        if (!isRecord(item)) {
          return (
            <div key={i} className="rounded-xl border border-border/60 bg-secondary/20 p-4 text-xs font-mono break-all">
              {String(item)}
            </div>
          );
        }
        const apiErr = typeof item.error === "string" ? item.error : undefined;
        const displayName = (item.displayName ?? item.name ?? item.identity) as string | undefined;
        const desc = (item.description ?? item.bio) as string | undefined;
        const avatar = (item.avatar ?? item.photo) as string | undefined;
        const avatarSrc = web3BioAvatarSrc(typeof avatar === "string" ? avatar : undefined);
        const platform = item.platform as string | undefined;
        const links = item.links;
        const linkRows: { href: string; label: string }[] = [];
        if (Array.isArray(links)) {
          for (const L of links) {
            if (!isRecord(L)) continue;
            const href = (L.url ?? L.link) as string | undefined;
            const label = (L.handle ?? L.platform ?? "link") as string;
            if (href && typeof href === "string") linkRows.push({ href, label: String(label) });
          }
        } else if (links && typeof links === "object") {
          for (const [platform, L] of Object.entries(links)) {
            if (!isRecord(L)) continue;
            const href = (L.link ?? L.url) as string | undefined;
            if (href && typeof href === "string") {
              linkRows.push({ href, label: String(L.handle ?? platform) });
            }
          }
        }
        return (
          <div key={i} className="rounded-xl border border-border/60 bg-secondary/20 overflow-hidden">
            <div className="flex gap-3 p-4">
              {avatarSrc && (
                <img
                  src={avatarSrc}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover border border-border/50 shrink-0"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="min-w-0 flex-1">
                {platform && (
                  <Badge variant="outline" className="text-[10px] mb-1">
                    {platform}
                  </Badge>
                )}
                {apiErr && (
                  <p className="text-xs text-destructive mb-1">{apiErr}</p>
                )}
                {displayName && <div className="font-medium text-sm truncate">{String(displayName)}</div>}
                {desc && <p className="text-xs text-muted-foreground line-clamp-3 mt-1">{String(desc)}</p>}
              </div>
            </div>
            {linkRows.length > 0 && (
              <ul className="border-t border-border/40 px-4 py-2 space-y-1">
                {linkRows.map((row, j) => (
                  <li key={j}>
                    <a
                      href={row.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary inline-flex items-center gap-1 hover:underline"
                    >
                      {row.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export const ProfilePage = () => {
  const { address, status } = useConnection();
  const connected = status === "connected" && address;

  const { data: profileRes, isLoading: profileLoading } = useMemberProfileQuery(address);
  const putMut = usePutProfileMutation();
  const { data: bioData, isLoading: bioLoading, error: bioError } = useWeb3BioProfileQuery(address);
  const { data: farcaster, isLoading: fcLoading, error: fcError, isError: fcIsError } = useFarcasterQuery(address);
  const { data: daily, isLoading: dailyLoading, isError: dailyError, error: dailyErr } = useDailyTasksQuery(address);
  const completeMut = useCompleteDailyTaskMutation();

  const [bio, setBio] = useState("");
  const [socials, setSocials] = useState<MemberProfileDto["socials"]>({});
  const [publicWealth, setPublicWealth] = useState(true);
  const [wealthDisplayName, setWealthDisplayName] = useState("");

  /**
   * Only hydrate from the server when the loaded wallet or saved snapshot (`updatedAt`) changes.
   * Syncing on every `profileRes` object identity was wiping edits on background refetch / focus.
   */
  useEffect(() => {
    if (!address) return;
    const p = profileRes?.profile;
    if (!p) return;
    setBio(p.bio);
    setSocials({ ...p.socials });
    setPublicWealth(p.publicWealthProfile !== false);
    setWealthDisplayName(p.wealthDisplayName ?? "");
  }, [address, profileRes?.profile?.updatedAt]);

  const shareUrl = useMemo(() => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const text = encodeURIComponent(`Growing wealth with Onchain Savings Club ${origin}`);
    return `https://twitter.com/intent/tweet?text=${text}`;
  }, []);

  const save = () => {
    if (!address) return;
    putMut.mutate({
      address,
      bio,
      socials,
      publicWealthProfile: publicWealth,
      wealthDisplayName: wealthDisplayName.trim() ? wealthDisplayName.trim().slice(0, 32) : null,
    });
  };

  const applyWeb3BioTemplate = () => {
    const payload = bioData;
    if (payload == null) return;
    const list = Array.isArray(payload) ? payload : [payload];
    if (list.length === 0) return;
    const first = list[0];
    if (!isRecord(first)) return;
    const links = first.links;
    const next = { ...socials };
    const applyHref = (href: string) => {
      const h = href.toLowerCase();
      if (h.includes("twitter.com") || h.includes("x.com")) next.twitter = href;
      else if (h.includes("github.com")) next.github = href;
      else if (h.includes("warpcast.com") || h.includes("farcaster")) next.farcaster = href;
      else if (!next.website) next.website = href;
    };
    if (Array.isArray(links)) {
      for (const L of links) {
        if (!isRecord(L)) continue;
        const href = (L.url ?? L.link) as string | undefined;
        if (href && typeof href === "string") applyHref(href);
      }
    } else if (links && typeof links === "object") {
      for (const L of Object.values(links)) {
        if (!isRecord(L)) continue;
        const href = (L.link ?? L.url) as string | undefined;
        if (href && typeof href === "string") applyHref(href);
      }
    }
    setSocials(next);
  };

  if (!connected) {
    return (
      <div className="space-y-6 max-w-2xl">
        <header className="space-y-2">
          <h1 className="font-display text-3xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted-foreground text-sm">Connect your wallet to edit your profile and daily tasks.</p>
        </header>
        <div className="glass-card p-8 text-center text-muted-foreground text-sm">
          Use the wallet button in the header to connect.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight flex items-center gap-2">
            <UserCircle className="w-8 h-8 text-primary" /> Profile
          </h1>
          <p className="text-muted-foreground font-mono text-xs break-all">{address}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to="/community">
              <MessageSquare className="w-4 h-4 mr-2" /> Member chat
            </Link>
          </Button>
          <Button variant="outline" className="rounded-xl" asChild>
            <Link to={`/investor/${address}`}>Public wealth profile</Link>
          </Button>
        </div>
      </header>

      {/* Daily tasks */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display font-semibold text-lg">Daily growth</h2>
          {daily && (
            <Badge variant="secondary" className="gap-1">
              <Flame className="w-3 h-3 text-warning" /> {daily.streak} day streak
            </Badge>
          )}
          {daily && (
            <span className="text-xs text-muted-foreground">UTC day: {daily.date}</span>
          )}
        </div>
        {dailyLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading tasks…
          </div>
        )}
        {dailyError && (
          <p className="text-sm text-destructive whitespace-pre-wrap break-words">
            Could not load daily tasks: {dailyErr instanceof Error ? dailyErr.message : String(dailyErr)}
          </p>
        )}
        {daily && (
          <ul className="space-y-3">
            {(daily.definitions ?? []).map(def => {
              const done = daily.tasks?.[def.id] ?? false;
              return (
                <li
                  key={def.id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-4",
                    done ? "border-primary/40 bg-primary/5" : "border-border/60 bg-secondary/20",
                  )}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {done ? (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{def.title}</div>
                      <p className="text-xs text-muted-foreground">{def.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 shrink-0">
                    {def.id === "check_in" && (
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-xl min-h-[44px]"
                        disabled={done || completeMut.isPending}
                        onClick={() => completeMut.mutate({ address: address!, taskId: "check_in" })}
                      >
                        {done ? "Done" : "Check in"}
                      </Button>
                    )}
                    {def.id === "share_x" && (
                      <>
                        <Button type="button" size="sm" variant="secondary" className="rounded-xl gap-1 min-h-[44px]" asChild>
                          <a href={shareUrl} target="_blank" rel="noopener noreferrer">
                            <Share2 className="w-3.5 h-3.5" /> Open X
                          </a>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-xl min-h-[44px]"
                          disabled={done || completeMut.isPending}
                          onClick={() => completeMut.mutate({ address: address!, taskId: "share_x" })}
                        >
                          {done ? "Shared" : "Mark shared"}
                        </Button>
                      </>
                    )}
                    {def.id === "community_pulse" && (
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="secondary" className="rounded-xl min-h-[44px]" asChild>
                          <Link to="/community">Open chat</Link>
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-xl min-h-[44px]"
                          disabled={done || completeMut.isPending}
                          onClick={() => completeMut.mutate({ address: address!, taskId: "community_pulse" })}
                        >
                          {done ? "Done" : "Mark done"}
                        </Button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="text-[10px] text-muted-foreground border-l-2 border-border pl-3">
          Tasks reset at UTC midnight. Posting in Member Chat auto-completes Community pulse when the API records your
          message.
        </p>
      </section>

      {/* Public wealth */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Public wealth profile</h2>
        <p className="text-xs text-muted-foreground max-w-prose">
          When on, your vault stats appear on <code className="text-[10px]">/investor/&lt;address&gt;</code> and you can
          appear on leaderboards. When off, the investor page returns private and snapshots are excluded from public
          rankings.
        </p>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
          <div className="space-y-0.5">
            <Label htmlFor="public-wealth" className="text-sm font-medium">
              Public wealth profile
            </Label>
            <p className="text-[10px] text-muted-foreground">Default is on.</p>
          </div>
          <Switch id="public-wealth" checked={publicWealth} onCheckedChange={setPublicWealth} />
        </div>
        <div className="space-y-2 max-w-md">
          <Label htmlFor="wealth-alias" className="text-xs text-muted-foreground">
            Card display name (optional, max 32 chars)
          </Label>
          <Input
            id="wealth-alias"
            value={wealthDisplayName}
            onChange={(e) => setWealthDisplayName(e.target.value)}
            placeholder="e.g. stani"
            maxLength={32}
            className="rounded-xl"
          />
        </div>
      </section>

      {/* About + socials */}
      <section className="glass-card p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">About you</h2>
        {profileLoading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : (
          <>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="A short bio for the club…"
              rows={4}
              className="w-full rounded-xl border border-border/60 bg-secondary/30 px-3 py-2 text-sm resize-y min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  ["twitter", "X (Twitter) URL"],
                  ["github", "GitHub URL"],
                  ["website", "Website"],
                  ["farcaster", "Farcaster / Warpcast"],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] uppercase text-muted-foreground">{label}</label>
                  <Input
                    value={socials[key] ?? ""}
                    onChange={e => setSocials(s => ({ ...s, [key]: e.target.value }))}
                    placeholder="https://…"
                    className="rounded-xl font-mono text-xs"
                  />
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="rounded-xl bg-gradient-primary text-primary-foreground"
              disabled={putMut.isPending}
              onClick={save}
            >
              {putMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save profile"}
            </Button>
          </>
        )}
      </section>

      {/* Farcaster (Neynar) */}
      <section className="glass-card p-6 space-y-4">
        <div>
          <h2 className="font-display font-semibold text-lg">Farcaster</h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-prose">
            Resolves your @handle when this wallet is a Farcaster <strong>custody</strong> or <strong>verified</strong> address
            (via Neynar). Server key: <code className="text-[10px]">NEYNAR_API_KEY</code> — not exposed to the browser.
          </p>
        </div>
        {fcLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading Farcaster…
          </div>
        )}
        {fcIsError && (
          <p className="text-sm text-destructive">
            {fcError instanceof Error ? fcError.message : "Could not load Farcaster."}
          </p>
        )}
        {!fcLoading && !fcIsError && farcaster && !farcaster.configured && (
          <p className="text-sm text-muted-foreground">
            Farcaster lookup is not configured. Add <code className="text-[10px]">NEYNAR_API_KEY</code> to the server{" "}
            <code className="text-[10px]">.env</code> and restart the API.
          </p>
        )}
        {!fcLoading && !fcIsError && farcaster?.configured && !farcaster.user && (
          <p className="text-sm text-muted-foreground">
            No Farcaster user found for this address. Add or verify the wallet in your Farcaster profile, then try
            again.
          </p>
        )}
        {!fcLoading && !fcIsError && farcaster?.user && (
          <FarcasterProfileCard
            user={farcaster.user}
            onUseLink={(url) => setSocials((s) => ({ ...s, farcaster: url }))}
          />
        )}
      </section>

      {/* Web3.bio */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display font-semibold text-lg">Web3 identity graph</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              <a href="https://web3.bio" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Web3.bio
              </a>{" "}
              Profile API (ENS, Farcaster, Lens, …). Read-only. Optional key: <code className="text-[10px]">WEB3_BIO_API_KEY</code> — sent as{" "}
              <code className="text-[10px]">X-API-KEY: Bearer …</code> per{" "}
              <a href="https://api.web3.bio/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                api.web3.bio
              </a>
              . Restart dev after changing <code className="text-[10px]">.env</code>.
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={applyWeb3BioTemplate}>
            Fill links from Web3.bio
          </Button>
        </div>
        {bioLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading Web3.bio…
          </div>
        )}
        {bioError && (
          <p className="text-sm text-destructive whitespace-pre-wrap break-words">
            Could not load Web3.bio: {bioError instanceof Error ? bioError.message : String(bioError)}. You can still edit links manually.
          </p>
        )}
        {!bioLoading && !bioError && <Web3BioCards payload={bioData} />}
      </section>
    </div>
  );
};
