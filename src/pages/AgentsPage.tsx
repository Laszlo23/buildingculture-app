import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bot, ExternalLink, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { chainApi, type PlatformAgentIntegrationStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

function statusBadgeVariant(s: PlatformAgentIntegrationStatus): "default" | "secondary" | "outline" | "destructive" {
  if (s === "ready") return "default";
  if (s === "partial") return "secondary";
  return "outline";
}

function statusLabel(s: PlatformAgentIntegrationStatus): string {
  if (s === "ready") return "Ready";
  if (s === "partial") return "Partial";
  return "Needs setup";
}

export function AgentsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["platform", "agents"],
    queryFn: () => chainApi.getPlatformAgents(),
  });

  return (
    <div className="space-y-8 max-w-5xl">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Bot className="w-3.5 h-3.5" />
          Platform automation
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Agents</h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">
          Each row is an automation role aligned with this app. Native hooks point at this Hono API so external runners
          (Paperclip, cron, or your own workers) can call real endpoints instead of placeholders. Status reflects env
          and keys on the server—nothing here stores third-party secrets.
        </p>
        {data?.meta.apiOrigin && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-muted-foreground">
            <p className="font-mono">
              API base: <span className="text-foreground/90">{data.meta.apiOrigin}</span>
            </p>
            <Button asChild variant="outline" size="sm" className="rounded-xl w-fit text-xs h-8">
              <a href={`${data.meta.apiOrigin}/api/agents`} target="_blank" rel="noopener noreferrer">
                View catalog JSON
                <ExternalLink className="w-3.5 h-3.5 ml-1.5 inline" />
              </a>
            </Button>
          </div>
        )}
      </header>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading agent catalog…
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">
          {(error as Error).message || "Could not load /api/agents"}
        </p>
      )}

      <ul className="grid gap-4 md:grid-cols-2">
        {data?.agents.map(agent => (
          <li
            key={agent.id}
            className={cn(
              "glass-card p-5 flex flex-col gap-4 border border-border/60",
              "hover:border-primary/25 transition-colors",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold">{agent.name}</h2>
                <p className="text-sm text-muted-foreground mt-1">{agent.shortGoal}</p>
              </div>
              <Badge variant={statusBadgeVariant(agent.integrationStatus)} className="shrink-0">
                {statusLabel(agent.integrationStatus)}
              </Badge>
            </div>

            {agent.missingConfig.length > 0 && (
              <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 text-xs text-muted-foreground space-y-1">
                <div className="font-medium text-foreground/80">Configure</div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {agent.missingConfig.map(line => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}

            {agent.apiHooks.length > 0 && (
              <div className="space-y-2">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">API hooks</div>
                <ul className="space-y-1.5 text-xs font-mono">
                  {agent.apiHooks.map(h => (
                    <li key={`${agent.id}-${h.method}-${h.path}`} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <span className="text-primary shrink-0">
                        {h.method} {h.path}
                      </span>
                      <span className="text-muted-foreground font-sans text-[11px] leading-snug">{h.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {agent.notes && <p className="text-[11px] text-muted-foreground leading-relaxed">{agent.notes}</p>}

            <div className="flex flex-wrap gap-2 pt-1 mt-auto">
              {agent.platformPath && (
                <Button asChild variant="default" size="sm" className="rounded-xl">
                  <Link to={agent.platformPath}>Open in app</Link>
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
