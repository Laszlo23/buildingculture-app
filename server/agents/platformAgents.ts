import { getEnv } from "../lib/env.js";
import { isAiConfigured } from "../lib/aiEnv.js";
import { isNeynarConfigured } from "../lib/neynarEnv.js";
import {
  isPipeflareListenerConfigured,
  isPipeflareOutboundConfigured,
  pipeflareConnectorBearer,
} from "../lib/pipeflareEnv.js";
import { paperclipHttpAdapterSecret } from "../lib/paperclipHttpAdapterEnv.js";
import { isXApiConfigured } from "../lib/xApiEnv.js";
import { isTelegramBotConfigured } from "../lib/telegramEnv.js";

export type AgentIntegrationStatus = "ready" | "partial" | "not_configured";

export type PlatformAgentHook = {
  method: "GET" | "POST";
  path: string;
  description: string;
};

export type PlatformAgentDto = {
  id: string;
  name: string;
  shortGoal: string;
  integrationStatus: AgentIntegrationStatus;
  /** Non-secret hints for operators / external runners */
  missingConfig: string[];
  platformPath?: string;
  apiHooks: PlatformAgentHook[];
  notes?: string;
};

function apiOrigin(): string {
  try {
    return new URL(getEnv().API_PUBLIC_ORIGIN.trim()).origin;
  } catch {
    return "https://api.buildingculture.capital";
  }
}

function optEnv(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

export function buildPlatformAgentsPayload(): { agents: PlatformAgentDto[]; meta: { apiOrigin: string } } {
  const origin = apiOrigin();
  const ai = isAiConfigured();
  const neynar = isNeynarConfigured();
  const stripe = Boolean(optEnv("STRIPE_WEBHOOK_SECRET"));
  const discordHook = Boolean(optEnv("DISCORD_COMMUNITY_WEBHOOK_URL"));
  const rwaFeed = Boolean(optEnv("RWA_PROPERTY_API_URL"));
  const siteUrls = Boolean(optEnv("SITE_WATCH_URLS"));
  const pipeflareOut = isPipeflareOutboundConfigured();
  const pipeflareBearer = Boolean(pipeflareConnectorBearer());
  const pipeflareListen = isPipeflareListenerConfigured();
  const paperclipHttpSecret = Boolean(paperclipHttpAdapterSecret());
  const xApi = isXApiConfigured();

  const agents: PlatformAgentDto[] = [
    {
      id: "site-watcher",
      name: "Site watcher",
      shortGoal: "Detect downtime on monitored URLs",
      integrationStatus: siteUrls ? "ready" : "partial",
      missingConfig: siteUrls ? [] : ["SITE_WATCH_URLS (comma-separated HTTPS origins to HEAD/GET)"],
      platformPath: "/",
      apiHooks: [
        { method: "GET", path: "/health", description: "API process liveness" },
        {
          method: "GET",
          path: "/api/protocol/pulse",
          description: "Bundled protocol read for dashboards",
        },
      ],
      notes:
        "Set SITE_WATCH_URLS in server .env for external surfaces you want operators to watch; this API always exposes /health.",
    },
    {
      id: "rwa-integrator",
      name: "RWA integrator",
      shortGoal: "Property or off-chain feeds + on-chain vault context",
      integrationStatus: rwaFeed ? "ready" : "partial",
      missingConfig: rwaFeed ? [] : ["RWA_PROPERTY_API_URL (optional JSON feed for valuations)"],
      platformPath: "/strategies",
      apiHooks: [
        { method: "GET", path: "/api/portfolio", description: "Wallet vault + strategy snapshot" },
        { method: "GET", path: "/api/protocol/pulse", description: "Low-latency protocol bundle" },
      ],
    },
    {
      id: "dao-governor",
      name: "DAO governor",
      shortGoal: "Read proposals; execute votes with server signer",
      integrationStatus: "ready",
      missingConfig: [],
      platformPath: "/dao",
      apiHooks: [
        { method: "GET", path: "/api/governance/proposals", description: "Proposal list + quorum state" },
        { method: "POST", path: "/api/governance/vote", description: "Cast vote (requires PRIVATE_KEY DAO permissions)" },
      ],
    },
    {
      id: "community-builder",
      name: "Community builder",
      shortGoal: "AI + Member Chat + Telegram @culturebuildingbot; optional Farcaster",
      integrationStatus: ai ? (neynar ? "ready" : "partial") : "not_configured",
      missingConfig: ai
        ? neynar
          ? isTelegramBotConfigured()
            ? []
            : ["TELEGRAM_BOT_TOKEN (optional) — enable Telegram webhook for @culturebuildingbot"]
          : ["NEYNAR_API_KEY for Farcaster cards"]
        : ["LANGBASE_API_KEY for AI pipes"],
      platformPath: "/community",
      apiHooks: [
        { method: "GET", path: "/api/community/messages", description: "Club chat transcript" },
        { method: "POST", path: "/api/community/messages", description: "Post as connected wallet (validated server-side)" },
        { method: "GET", path: "/api/ai/agents", description: "List AI pipe ids exposed over HTTP" },
        { method: "POST", path: "/api/ai/pipe/community-builder", description: "Community Builder pipe (503 if AI unset)" },
        {
          method: "POST",
          path: "/api/telegram/webhook",
          description: "Telegram Bot API updates → same Community Builder pipe (setWebhook + TELEGRAM_WEBHOOK_SECRET)",
        },
        { method: "GET", path: "/api/social/farcaster", description: "Resolve Farcaster profile by wallet" },
      ],
    },
    {
      id: "billing-bot",
      name: "Billing bot",
      shortGoal: "Stripe webhooks → subscription state (planned hook)",
      integrationStatus: stripe ? "partial" : "not_configured",
      missingConfig: stripe ? ["POST /api/webhooks/stripe (not implemented until you confirm events)"] : ["STRIPE_WEBHOOK_SECRET"],
      platformPath: "/membership",
      apiHooks: [],
      notes: "Webhook route can be added next; set STRIPE_WEBHOOK_SECRET when ready.",
    },
    {
      id: "premium-access",
      name: "Premium access",
      shortGoal: "Wallet premium signal for gating; optional Discord webhooks",
      integrationStatus: "ready",
      missingConfig: discordHook
        ? []
        : ["DISCORD_COMMUNITY_WEBHOOK_URL (optional—for Discord digests or external role bots)"],
      platformPath: "/membership",
      apiHooks: [
        {
          method: "GET",
          path: "/users/premium?address=0x…",
          description: `Premium flags (${origin}/users/premium)`,
        },
      ],
    },
    {
      id: "pipeflare-connector",
      name: "Pipeflare connector",
      shortGoal: "Run Pipeflare workflows from this API (keys stay server-side)",
      integrationStatus: pipeflareOut && pipeflareBearer ? "ready" : pipeflareOut || pipeflareBearer ? "partial" : "not_configured",
      missingConfig: [
        ...(pipeflareOut ? [] : ["PIPEFLARE_API_KEY"]),
        ...(pipeflareBearer ? [] : ["PIPEFLARE_CONNECTOR_BEARER (Authorization: Bearer for callers of the proxy)"]),
      ],
      platformPath: "/agents",
      apiHooks: [
        {
          method: "POST",
          path: "/api/pipeflare/workflow/{workflowId}/run",
          description: "Proxies to Pipeflare POST /v1/workflows/{workflowId}/run (Bearer or X-API-Key to Pipeflare)",
        },
      ],
      notes:
        "Set PIPEFLARE_API_BASE (default https://api.pipeflare.io), PIPEFLARE_API_KEY, and PIPEFLARE_CONNECTOR_BEARER. Optional: PIPEFLARE_USE_X_API_KEY=true if Pipeflare expects X-API-Key.",
    },
    {
      id: "pipeflare-listener",
      name: "Pipeflare listener",
      shortGoal: "Inbound callbacks from Pipeflare → this API",
      integrationStatus: pipeflareListen ? "ready" : "not_configured",
      missingConfig: pipeflareListen ? [] : ["PIPEFLARE_WEBHOOK_SECRET"],
      platformPath: "/agents",
      apiHooks: [
        {
          method: "GET",
          path: "/pipeflare/callback",
          description: "Probe listener + whether webhook secret is configured",
        },
        {
          method: "POST",
          path: "/pipeflare/callback",
          description: `Send JSON; auth via X-Pipeflare-Webhook-Secret or Authorization: Bearer (secret = PIPEFLARE_WEBHOOK_SECRET). Public URL ${origin}/pipeflare/callback`,
        },
      ],
    },
    {
      id: "x-social-api",
      name: "X (Twitter) API",
      shortGoal: "Public user lookup via X API v2 (developer.x.com credits)",
      integrationStatus: xApi ? "ready" : "not_configured",
      missingConfig: xApi ? [] : ["X_API_BEARER_TOKEN or X_API_KEY + X_API_SECRET (developer.x.com)"],
      platformPath: "/profile",
      apiHooks: [
        {
          method: "GET",
          path: "/api/social/x/user?username=handle",
          description: "User by handle — consumes billed credits per X pricing",
        },
      ],
      notes: "Optional X_API_BASE if X moves REST host; default https://api.twitter.com/2. Do not expose the bearer to the browser.",
    },
    {
      id: "paperclip-http-adapter",
      name: "Paperclip HTTP adapter",
      shortGoal: "Paperclip POSTs run context here; response is the run result (fire-and-forget external agent)",
      integrationStatus: paperclipHttpSecret ? "ready" : "partial",
      missingConfig: paperclipHttpSecret
        ? []
        : [
            "PAPERCLIP_HTTP_ADAPTER_SECRET (recommended: set + send as X-Paperclip-Adapter-Secret or Authorization: Bearer from Paperclip)",
          ],
      platformPath: "/agents",
      apiHooks: [
        {
          method: "GET",
          path: "/api/paperclip/http-agent",
          description: "Probe + whether adapter secret is configured",
        },
        {
          method: "POST",
          path: "/api/paperclip/http-agent",
          description: `Paperclip HTTP adapter URL — body: runId, agentId, companyId, context. Full URL ${origin}/api/paperclip/http-agent`,
        },
      ],
      notes:
        "External worker receives this POST, then uses Paperclip’s PAPERCLIP_API_URL and API key to call back. Optional PAPERCLIP_API_URL in .env is only a hint for operators (not used to call Paperclip from this handler).",
    },
  ];

  return { agents, meta: { apiOrigin: origin } };
}
