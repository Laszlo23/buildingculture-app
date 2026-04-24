import { useEffect } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  Cable,
  Flame,
  Layers,
  Orbit,
  Rocket,
  Sparkles,
  TrainFront,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { setPageSeo } from "@/lib/pageSeo";
import { cn } from "@/lib/utils";

type StorySection = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string[];
  /** Short chain / era labels for the “parade” row */
  tags?: string[];
};

const relayParade = [
  "Bitcoin",
  "XRP",
  "Polygon",
  "BNB Chain",
  "zkSync",
  "Arbitrum",
  "Optimism",
  "Base",
] as const;

const sections: StorySection[] = [
  {
    icon: Flame,
    eyebrow: "Act I — The origin voltage",
    title: "Bitcoin hit first — everything else is a remix",
    tags: ["Bitcoin"],
    body: [
      "Before “multichain” was a word people typed with confidence, there was a single whitepaper and a block reward that felt like a dare: can digital scarcity exist without a vault door?",
      "Bitcoin did not ask permission. It showed up as proof-of-work, slow blocks, and a community that treated running a node like wearing a team jersey. That conviction — verifiable settlement, fixed rules, no CEO on speed dial — is still the bassline under every chain that followed.",
      "If you only remember one thing from this whole relay: the industry learned to dance because Bitcoin turned on the lights.",
    ],
  },
  {
    icon: Zap,
    eyebrow: "Act II — Different lanes, same hunger",
    title: "XRP, Polygon, BNB Smart Chain — the express trains leave the station",
    tags: ["XRP", "Polygon", "BNB Chain"],
    body: [
      "After Bitcoin proved the game was real, the map exploded into lanes. XRP leaned into payments rails and institutional settlement storytelling — speed and partnerships as the headline, with its own tradeoffs and debates (centralization vs utility is a whole other chapter).",
      "Polygon showed up like summer camp for Ethereum refugees: cheaper fees, a sidechain / hybrid story, and a culture of shipping bridges before bridges were cool. BNB Smart Chain went loud on retail volume — DeFi summer energy with a different security model and a community that moved fast, sometimes faster than caution.",
      "None of these chapters “replaced” Bitcoin. They answered different questions: who needs throughput today? Who needs compatibility with Ethereum tooling? Who wants a vibrant app layer with its own risk profile?",
    ],
  },
  {
    icon: Cable,
    eyebrow: "Act III — Proof becomes fashion",
    title: "zkSync and friends — when math carries the bags",
    tags: ["zkSync", "ZK rollups"],
    body: [
      "Rollups asked a cleaner question: what if Ethereum stayed the judge, but execution moved upstairs? zkSync and other ZK-flavored stacks leaned into validity proofs — cryptography doing crowd control so every state transition has receipts.",
      "The vibe shift was real: less “trust our multisig,” more “verify the proof.” Not magic — engineering, audits, and honest latency tradeoffs — but the aesthetic changed. Chains started cosplaying as mathematicians.",
    ],
  },
  {
    icon: Layers,
    eyebrow: "Act IV — Optimistic siblings",
    title: "Arbitrum, Optimism, the L2 league — Ethereum’s balcony seats",
    tags: ["Arbitrum", "Optimism", "L2"],
    body: [
      "Optimistic rollups brought a different swagger: assume actions are honest, give challengers a window to cry foul, and let Ethereum absorb the final word. Arbitrum became a household name for DeFi depth; Optimism leaned into public goods funding and a brand that literally wears its worldview on its sleeve.",
      "Layer 2 stopped being a footnote and became the main character for everyday users: lower fees, faster feedback loops, and ecosystems that still inherit Ethereum’s security story — with nuance around bridges, sequencers, and upgrade paths worth reading, not ignoring.",
      "Base slid into that relay with Coinbase distribution and a build-in-public energy — another express lane on the same Ethereum ethos, tuned for the apps people actually touch.",
    ],
  },
  {
    icon: TrainFront,
    eyebrow: "Act V — Names as culture",
    title: "Communities that move like transit systems",
    tags: ["Optimism", "Culture"],
    body: [
      "Here is the secret sauce nobody puts in the whitepaper: Layer 2s feel like transit lines because people treat them that way. You hop on Optimism when the vibe is retro funding and sunny copy. You ride Arbitrum when you want deep liquidity forests. You catch Base when you want the on-ramp next to your exchange account and a builder scene that feels young.",
      "The names stopped sounding like servers and started sounding like festivals — Starknet with its STARK swagger, zkSync Era with “we were early to proofs,” chains branding optimism and velocity as first-class passengers.",
      "That is not marketing fluff alone; it is coordination. Communities transport belief, memes, and developer talent the same way metros move rush hour — crowded, loud, occasionally delayed, and still the fastest way home if you know your stop.",
    ],
  },
  {
    icon: Orbit,
    eyebrow: "Championship lap",
    title: "You are holding the baton now",
    tags: ["Base", "Ethereum"],
    body: [
      "So here we are: Bitcoin lit the torch, alts opened side streets, Polygon and BNB Chain widened the boulevards, zkSync sharpened the proofs, Arbitrum and Optimism raised the balconies, and Base is one of the fresh platforms where savings, culture, and composable apps meet.",
      "None of this is financial advice — it is lore so you read bridges, risks, and explorers with respect. The relay does not slow down because you arrived late; it rewards the people who learn the map, pick a lane, and keep building.",
      "Welcome to the parade. Lace up, stay curious, and ride the next block like you meant it.",
    ],
  },
];

export function ChainRelayStoryPage() {
  useEffect(() => {
    return setPageSeo({
      title: "The Great Relay — from Bitcoin to Layer 2s | Onchain Savings Club",
      description:
        "A storytelling tour: Bitcoin, XRP, Polygon, BNB Smart Chain, zkSync, Arbitrum, Optimism, Base — how multichain culture and Layer 2s came together. Educational only.",
      canonicalPath: "/learn/chain-relay",
    });
  }, []);

  return (
    <div className="space-y-10 max-w-3xl">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" className="rounded-xl gap-1.5 -ml-2 text-muted-foreground" asChild>
          <Link to="/learn">
            <ArrowLeft className="h-4 w-4" />
            Learning hub
          </Link>
        </Button>
        <span className="text-border hidden sm:inline">/</span>
        <Button variant="ghost" size="sm" className="rounded-xl text-muted-foreground" asChild>
          <Link to="/academy">Academy</Link>
        </Button>
      </div>

      <header className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-card/90 to-gold/[0.08] p-6 sm:p-8 shadow-[0_0_48px_-16px_hsl(var(--primary)/0.35)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 motion-reduce:opacity-25"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 20% 0%, hsl(var(--primary) / 0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 100% 100%, hsl(var(--gold) / 0.2), transparent 50%)",
          }}
        />
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/35 bg-background/60 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-sm">
            <Rocket className="h-3.5 w-3.5" />
            Bonus read · no quiz
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-gradient-primary">
            The Great Relay
          </h1>
          <p className="text-base sm:text-lg text-foreground/90 leading-relaxed max-w-2xl">
            From the first block to today&apos;s Layer 2 parade — Bitcoin, alts, Polygon, BNB Smart Chain, zkSync,
            Arbitrum, Optimism, and the feeling that whole communities ride the rails together.
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
            Educational storytelling only — not investment advice. Networks evolve; always verify risks, bridges, and
            official docs before moving funds.
          </p>
        </div>
      </header>

      <div
        className="flex flex-wrap gap-2 rounded-2xl border border-border/60 bg-secondary/25 px-4 py-4"
        aria-label="Chains mentioned in this story"
      >
        <span className="w-full text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          The parade (name-drop row)
        </span>
        {relayParade.map(name => (
          <span
            key={name}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-1 text-xs font-medium text-foreground/95"
          >
            {name}
          </span>
        ))}
      </div>

      <ol className="space-y-8 list-none p-0 m-0">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <li
              key={sec.title}
              className={cn(
                "relative rounded-2xl border border-border/60 bg-card/60 p-5 sm:p-6 shadow-sm",
                "scroll-mt-24",
              )}
            >
              <div className="absolute left-5 top-5 sm:left-6 sm:top-6 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="pl-0 sm:pl-16 pt-14 sm:pt-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  <span className="font-mono-num text-muted-foreground">{String(idx + 1).padStart(2, "0")}</span>
                  <span>{sec.eyebrow}</span>
                </div>
                <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  {sec.title}
                </h2>
                {sec.tags ? (
                  <div className="flex flex-wrap gap-1.5">
                    {sec.tags.map(t => (
                      <span
                        key={t}
                        className="rounded-md border border-border/50 bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  {sec.body.map((p, pi) => (
                    <p key={`${idx}-${pi}`}>{p}</p>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <section className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/[0.08] via-card to-primary/[0.06] p-6 sm:p-8 text-center space-y-4">
        <Sparkles className="h-8 w-8 text-gold mx-auto motion-safe:animate-pulse" aria-hidden />
        <p className="font-display text-lg sm:text-xl font-semibold text-foreground">Keep the relay moving</p>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Pair this story with a credential path in the Academy, then open the vault when you are ready to put learning
          into practice — one deposit at a time.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <Button className="rounded-xl gap-2" asChild>
            <Link to="/academy">
              Open Academy
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="rounded-xl border-border/70" asChild>
            <Link to="/learn">Back to learning hub</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
