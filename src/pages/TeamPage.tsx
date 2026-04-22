import { Link } from "react-router-dom";
import { ExternalLink, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BUILDING_CULTURE_TEAM = "https://buildingculture.capital/team";

type TeamMember = {
  initials: string;
  name: string;
  role: string;
  bio: string;
  ring: string;
  linkedInUrl?: string;
};

const members: TeamMember[] = [
  {
    initials: "LB",
    name: "Laszlo Bihary",
    role: "Co-founder & product",
    bio: "Driving protocol integration and investor-facing product on Base.",
    ring: "from-primary/40 to-emerald-600/30",
    linkedInUrl: "https://www.linkedin.com/in/laszlo-bihary/",
  },
  {
    initials: "RS",
    name: "Reinhard Stix",
    role: "Co-founder & real estate",
    bio: "Property sourcing, structuring, and alignment with tokenization narrative.",
    ring: "from-gold/50 to-amber-700/30",
    linkedInUrl: "https://www.linkedin.com/in/reinhard-stix-1b8328a8/",
  },
  {
    initials: "RH",
    name: "Roman Horvath",
    role: "Accountant",
    bio: "Financial reporting and compliance-oriented bookkeeping for the venture.",
    ring: "from-sky-500/35 to-indigo-600/25",
  },
];

export function TeamPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Users className="w-3.5 h-3.5" />
          Building Culture
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Team</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Core contributors behind the protocol and real-asset narrative. Co-founders include direct LinkedIn links
          below; this page mirrors the public roster for app members.
        </p>
        <p className="text-xs text-muted-foreground">
          Canonical team hub:{" "}
          <a
            href={BUILDING_CULTURE_TEAM}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline inline-flex items-center gap-1"
          >
            buildingculture.capital/team
            <ExternalLink className="w-3 h-3 shrink-0 opacity-80" />
          </a>
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {members.map(m => (
          <li
            key={m.initials}
            className={cn(
              "glass-card p-5 flex flex-col gap-4 border border-border/60",
              "hover:border-primary/25 transition-colors",
            )}
          >
            <div
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl text-lg font-display font-bold text-primary-foreground",
                "bg-gradient-to-br shadow-lg",
                m.ring,
              )}
            >
              {m.initials}
            </div>
            <div className="space-y-1 flex-1">
              <h2 className="font-display text-lg font-semibold tracking-tight">{m.name}</h2>
              <p className="text-xs font-medium uppercase tracking-wide text-primary/90">{m.role}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.bio}</p>
            </div>
            {m.linkedInUrl ? (
              <Button variant="outline" size="sm" className="rounded-xl w-full gap-2 shrink-0" asChild>
                <a href={m.linkedInUrl} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden />
                </a>
              </Button>
            ) : null}
          </li>
        ))}
      </ul>

      <section className="glass-card p-6 sm:p-8 space-y-4 border border-gold/15 bg-gradient-to-br from-secondary/40 via-transparent to-primary/[0.06]">
        <h2 className="font-display text-xl font-semibold text-gold">Mission · Building Culture</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We open culture-rich real estate to transparent, programmable liquidity — so places people care about can be
          financed and traded with the community in the loop.
        </p>
        <blockquote className="border-l-2 border-gold/40 pl-4 py-1 text-sm italic text-foreground/90 leading-relaxed">
          “Places hold memory. Markets should hold integrity — together they hold the future we build.”
        </blockquote>
        <p className="text-xs text-muted-foreground">
          Culture Land drops and launches:{" "}
          <a
            href="https://x.com/buildingcultu3"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline inline-flex items-center gap-0.5"
          >
            @buildingcultu3
            <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
          </a>
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <Link to="/community">Community hub</Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" asChild>
            <a href="https://buildingculture.capital/" target="_blank" rel="noopener noreferrer">
              Why we exist
              <ExternalLink className="w-3.5 h-3.5 ml-1.5 inline opacity-70" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
}
