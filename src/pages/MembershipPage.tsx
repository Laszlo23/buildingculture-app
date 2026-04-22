import { Gem, Check, Sparkles, Vote, Coins, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LearningBadgesStrip } from "@/components/learning/LearningBadgesStrip";
import { VaultPatronClaim } from "@/components/learning/VaultPatronClaim";
import { learningNftPerks } from "@/data/nftPerks";

const tiers = [
  {
    name: "Genesis",
    price: "0.5 ETH",
    supply: "2,500 / 2,500",
    sold: true,
    color: "from-primary to-primary-glow",
    perks: ["Founding member status", "2.0x rewards multiplier", "Council voting seat", "Real-estate priority access", "Exclusive art drops"],
  },
  {
    name: "Citizen",
    price: "0.15 ETH",
    supply: "8,420 / 25,000",
    sold: false,
    color: "from-info to-primary",
    perks: ["Full vault access", "1.25x rewards multiplier", "Standard governance", "Academy seasons unlocked", "Achievement NFTs"],
  },
  {
    name: "Visitor",
    price: "Free",
    supply: "Open",
    sold: false,
    color: "from-muted-foreground to-foreground",
    perks: ["Read-only dashboard", "Beginner academy", "Community chat", "Limited deposit cap"],
  },
];

export const MembershipPage = () => {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Membership NFTs</h1>
        <p className="text-muted-foreground text-sm mt-1">Your NFT is your access pass, governance weight and rewards multiplier.</p>
      </header>

      <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] shadow-[0_0_0_1px_hsl(var(--primary)/0.08),inset_0_1px_0_0_hsl(var(--primary)/0.06)]">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-gradient-mesh opacity-35 motion-reduce:opacity-25" />
          <div
            className={cn(
              "absolute inset-[-20%] opacity-40 motion-reduce:hidden",
              "bg-[length:200%_200%] animate-onboarding-aurora",
            )}
            style={{
              backgroundImage:
                "linear-gradient(125deg, hsl(var(--primary) / 0.22) 0%, transparent 45%, hsl(var(--gold) / 0.14) 55%, transparent 78%)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/55 to-card" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent" />
        </div>
        <div className="relative space-y-4 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold" />
          <h2 className="font-display text-lg font-semibold">Learning & activity credentials</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Soulbound achievements from Academy journeys and vault activity. Displayed here for recognition; product perks are cosmetic in v1.
        </p>
        <LearningBadgesStrip />
        <VaultPatronClaim />
        <div className="overflow-x-auto border-t border-border/60 pt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground text-xs uppercase tracking-wider">
                <th className="py-2 pr-4">Badge</th>
                <th className="py-2 pr-4">Governance UI</th>
                <th className="py-2 pr-4">Other perks</th>
              </tr>
            </thead>
            <tbody>
              {learningNftPerks.map(row => (
                <tr key={row.badgeId} className="border-t border-border/40">
                  <td className="py-3 pr-4 font-medium">{row.name}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{row.governanceUi}</td>
                  <td className="py-3 text-muted-foreground">
                    {row.feeMessaging} · {row.other}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </section>

      {/* Featured holder card */}
      <section className="glass-card p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-30" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative">
          <div className="relative aspect-square max-w-sm mx-auto md:mx-0">
            <div className="absolute inset-0 bg-gradient-primary rounded-3xl blur-3xl opacity-50" />
            <div className="relative aspect-square rounded-3xl bg-gradient-to-br from-primary/30 via-card to-gold/20 border border-primary/30 p-8 flex flex-col justify-between shadow-elevated">
              <div className="flex items-start justify-between">
                <Gem className="w-10 h-10 text-primary" />
                <Badge className="bg-primary/20 text-primary border-primary/30">CITIZEN</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Onchain Savings Club</div>
                <div className="font-display text-3xl font-semibold">#04,217</div>
                <div className="font-mono text-[10px] text-muted-foreground mt-2">0x7a4f…2b91</div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
              <Sparkles className="w-3 h-3 mr-1.5" /> Owned by you
            </Badge>
            <h2 className="font-display text-3xl font-semibold">Citizen #04,217</h2>
            <p className="text-muted-foreground">
              Held since Mar 2025. Active across 7 strategies, 14 governance votes, 11 academy modules completed.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Multiplier</div>
                <div className="font-mono-num font-bold text-lg text-primary">1.25x</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Voting</div>
                <div className="font-mono-num font-bold text-lg text-info">1.6x</div>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Rarity</div>
                <div className="font-mono-num font-bold text-lg text-gold">Top 18%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map(t => (
          <div key={t.name} className="glass-card p-6 relative overflow-hidden">
            <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${t.color} opacity-20 blur-2xl`} />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Tier</div>
                  <div className="font-display font-semibold text-xl">{t.name}</div>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow-glow`}>
                  <Gem className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>
              <div>
                <div className="font-display font-bold text-3xl font-mono-num">{t.price}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Supply: {t.supply}</div>
              </div>
              <ul className="space-y-2 pt-2 border-t border-border/60">
                {t.perks.map(p => (
                  <li key={p} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{p}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full rounded-xl ${t.sold ? "" : "bg-gradient-primary text-primary-foreground hover:opacity-90 shadow-glow"}`}
                variant={t.sold ? "outline" : "default"}
                disabled={t.sold}
              >
                {t.sold ? <><Lock className="w-4 h-4 mr-2" /> Sold out</> : "Mint membership"}
              </Button>
            </div>
          </div>
        ))}
      </section>

      {/* Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Vote, title: "On-chain governance", text: "Every NFT carries voting weight on treasury, strategies and real-asset acquisitions." },
          { icon: Coins, title: "Rewards multipliers", text: "Stack yield boosts up to 2.0x by holding higher tiers and progressing your savings level." },
          { icon: Sparkles, title: "Exclusive rounds", text: "Early access to new strategies, real-estate co-investments and curated art drops." },
        ].map(b => (
          <div key={b.title} className="glass-card p-6 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <b.icon className="w-5 h-5" />
            </div>
            <h3 className="font-display font-semibold">{b.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
          </div>
        ))}
      </section>
    </div>
  );
};
