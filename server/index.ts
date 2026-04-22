import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { parseUnits } from "viem";
import { ZodError } from "zod";
import { getChain, getSignerAddress } from "./lib/chain.js";
import { getEnv } from "./lib/env.js";
import { fetchProposals } from "./services/governance.ts";
import { fetchPortfolio } from "./services/portfolio.ts";
import {
  allocateStrategy,
  castVote,
  depositWithApprove,
  sendVaultClaimYield,
  sendVaultWithdraw,
  serializeError,
} from "./services/tx.ts";
import { answersMatch } from "./learning/quizAnswers.js";
import { buildNftBadges, buildNftEligibility } from "./services/nftEligibility.ts";
import {
  achievementTypeForRoute,
  achievementTypeVaultPatron,
  learningNftConfigured,
  mintAchievement,
  readHasAchievement,
} from "./services/nftMint.ts";
import { hasCompletedRoute, markRouteComplete, type RouteId } from "./services/learningStore.ts";
import {
  allocateBody,
  claimLearningNftBody,
  claimVaultPatronBody,
  completeDailyTaskBody,
  depositBody,
  learningCompleteBody,
  postCommunityMessageBody,
  putProfileBody,
  voteBody,
  withdrawBody,
} from "./validation.ts";
import { appendMessage, listMessages } from "./services/chatStore.ts";
import { getProfile, putProfile } from "./services/profileStore.ts";
import { completeTask, getDailySnapshot } from "./services/dailyTasksStore.ts";
import { fetchVaultSavingsForAddress } from "./services/portfolio.ts";

function formatRouteError(e: unknown) {
  if (e instanceof ZodError) {
    return { message: e.issues.map(i => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  return serializeError(e);
}

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      const env = getEnv();
      if (!origin) return env.CORS_ORIGIN;
      if (origin === env.CORS_ORIGIN) return origin;
      if (origin.startsWith("http://localhost:")) return origin;
      if (origin.startsWith("http://127.0.0.1:")) return origin;
      return env.CORS_ORIGIN;
    },
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.get("/api/wallet", (c) => {
  try {
    const address = getSignerAddress();
    return c.json({ address, chainId: getEnv().CHAIN_ID });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.get("/api/config", (c) => {
  try {
    const env = getEnv();
    return c.json({
      chainId: env.CHAIN_ID,
      chainName: getChain().name,
      contracts: {
        vault: env.VAULT_CONTRACT,
        treasury: env.TREASURY_CONTRACT,
        dao: env.DAO_CONTRACT,
        strategyRegistry: env.STRATEGY_REGISTRY,
        assetToken: env.ASSET_TOKEN ?? null,
        learningNft: env.LEARNING_NFT_CONTRACT ?? null,
      },
      assetDecimals: env.ASSET_DECIMALS,
      vaultPatronMinDeposit: env.VAULT_PATRON_MIN_DEPOSIT,
    });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.get("/api/portfolio", async (c) => {
  try {
    const data = await fetchPortfolio();
    return c.json(data);
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.get("/api/governance/proposals", async (c) => {
  try {
    const proposals = await fetchProposals();
    return c.json({ proposals });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.get("/api/treasury", async (c) => {
  try {
    const p = await fetchPortfolio();
    return c.json({
      totalTreasury: p.treasurySize,
      vaultTotalAssets: p.vaultTotalAssets,
      totalMembers: 0,
      avgApy: p.blendedApy,
      realAssetBacking: 0,
    });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.post("/api/transactions/deposit", async (c) => {
  try {
    const body = depositBody.parse(await c.req.json());
    const env = getEnv();
    const decimals = body.decimals ?? env.ASSET_DECIMALS;
    const amountWei = parseUnits(body.amount, decimals);
    const result = await depositWithApprove(amountWei);
    return c.json(result);
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.post("/api/transactions/withdraw", async (c) => {
  try {
    const body = withdrawBody.parse(await c.req.json());
    const env = getEnv();
    const decimals = body.decimals ?? env.ASSET_DECIMALS;
    const amountWei = parseUnits(body.amount, decimals);
    const result = await sendVaultWithdraw(amountWei);
    return c.json(result);
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.post("/api/transactions/claim-yield", async (c) => {
  try {
    const result = await sendVaultClaimYield();
    return c.json(result);
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.post("/api/transactions/allocate", async (c) => {
  try {
    const body = allocateBody.parse(await c.req.json());
    const sid =
      typeof body.strategyId === "string" ? BigInt(body.strategyId) : BigInt(body.strategyId);
    const result = await allocateStrategy(sid, BigInt(body.bps));
    return c.json(result);
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.post("/api/governance/vote", async (c) => {
  try {
    const body = voteBody.parse(await c.req.json());
    const result = await castVote(BigInt(body.proposalId), body.support);
    return c.json(result);
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.post("/api/learning/complete", async (c) => {
  try {
    const body = learningCompleteBody.parse(await c.req.json());
    const addr = body.address as `0x${string}`;
    if (!answersMatch(body.routeId as RouteId, body.answers)) {
      return c.json({ error: { message: "Quiz answers do not match the answer key." } }, 400);
    }
    markRouteComplete(addr, body.routeId as RouteId);
    return c.json({ ok: true, routeId: body.routeId });
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.post("/api/nft/claim-learning", async (c) => {
  try {
    const body = claimLearningNftBody.parse(await c.req.json());
    const addr = body.address as `0x${string}`;
    const routeId = body.routeId as RouteId;
    if (!learningNftConfigured()) {
      return c.json({ error: { message: "Learning NFT contract is not configured." } }, 503);
    }
    if (!hasCompletedRoute(addr, routeId)) {
      return c.json({ error: { message: "Complete the quiz for this route first." } }, 400);
    }
    const t = achievementTypeForRoute(routeId);
    if (await readHasAchievement(addr, t)) {
      return c.json({ error: { message: "This credential was already minted for your address." } }, 400);
    }
    const result = await mintAchievement(addr, t);
    return c.json(result);
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.post("/api/nft/claim-vault-patron", async (c) => {
  try {
    const body = claimVaultPatronBody.parse(await c.req.json());
    const addr = body.address as `0x${string}`;
    const env = getEnv();
    if (!learningNftConfigured()) {
      return c.json({ error: { message: "Learning NFT contract is not configured." } }, 503);
    }
    const savings = await fetchVaultSavingsForAddress(addr);
    if (savings < env.VAULT_PATRON_MIN_DEPOSIT) {
      return c.json(
        {
          error: {
            message: `Vault savings must be at least ${env.VAULT_PATRON_MIN_DEPOSIT} (asset units) to mint Vault Patron.`,
          },
        },
        400,
      );
    }
    const t = achievementTypeVaultPatron();
    if (await readHasAchievement(addr, t)) {
      return c.json({ error: { message: "Vault Patron was already minted for your address." } }, 400);
    }
    const result = await mintAchievement(addr, t);
    return c.json(result);
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.get("/api/nft/eligibility", async (c) => {
  try {
    const address = c.req.query("address");
    if (!address || !/^0x[a-fA-F0-9]{40}$/i.test(address)) {
      return c.json({ error: { message: "Query ?address=0x… is required." } }, 400);
    }
    const data = await buildNftEligibility(address as `0x${string}`);
    return c.json(data);
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.get("/api/nft/badges", async (c) => {
  try {
    const address = c.req.query("address");
    if (!address || !/^0x[a-fA-F0-9]{40}$/i.test(address)) {
      return c.json({ error: { message: "Query ?address=0x… is required." } }, 400);
    }
    const data = await buildNftBadges(address as `0x${string}`);
    return c.json(data);
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

const dailyTaskDefinitions = [
  {
    id: "check_in" as const,
    title: "Daily check-in",
    description: "Open the club once a day — builds your streak.",
  },
  {
    id: "share_x" as const,
    title: "Share on X",
    description: "Spread the word with a pre-filled post, then mark done.",
  },
  {
    id: "community_pulse" as const,
    title: "Community pulse",
    description: "Post one message in Member Chat (or mark done if you already did today).",
  },
];

app.get("/api/community/messages", (c) => {
  try {
    return c.json({ messages: listMessages() });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.post("/api/community/messages", async (c) => {
  try {
    const body = postCommunityMessageBody.parse(await c.req.json());
    const addr = body.address as `0x${string}`;
    const msg = appendMessage(addr, body.text);
    return c.json({ message: msg });
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.get("/api/profile", (c) => {
  try {
    const address = c.req.query("address");
    if (!address || !/^0x[a-fA-F0-9]{40}$/i.test(address)) {
      return c.json({ error: { message: "Query ?address=0x… is required." } }, 400);
    }
    return c.json({ profile: getProfile(address as `0x${string}`) });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.put("/api/profile", async (c) => {
  try {
    const body = putProfileBody.parse(await c.req.json());
    const addr = body.address as `0x${string}`;
    const profile = putProfile(addr, { bio: body.bio, socials: body.socials });
    return c.json({ profile });
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.get("/api/tasks/daily", (c) => {
  try {
    const address = c.req.query("address");
    if (!address || !/^0x[a-fA-F0-9]{40}$/i.test(address)) {
      return c.json({ error: { message: "Query ?address=0x… is required." } }, 400);
    }
    const snap = getDailySnapshot(address as `0x${string}`);
    return c.json({
      definitions: dailyTaskDefinitions,
      ...snap,
    });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.post("/api/tasks/daily/complete", async (c) => {
  try {
    const body = completeDailyTaskBody.parse(await c.req.json());
    const addr = body.address as `0x${string}`;
    const snap = completeTask(addr, body.taskId);
    return c.json({
      definitions: dailyTaskDefinitions,
      ...snap,
    });
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

const port = getEnv().PORT;
/** `0.0.0.0` in Docker; default `127.0.0.1` for local dev. */
const listenHost = process.env.API_LISTEN_HOST?.trim() || "127.0.0.1";
console.log(`API listening on http://${listenHost}:${port}`);
console.log(
  "[api] Routes include GET /api/tasks/daily, /api/profile, /api/community/messages — if any 404 while older routes work, restart this process (stale tsx node).",
);
serve({ fetch: app.fetch, port, hostname: listenHost });
