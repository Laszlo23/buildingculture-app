import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { isAddress, parseUnits } from "viem";
import { ZodError } from "zod";
import { getChain, getSignerAddress } from "./lib/chain.js";
import { firstPublishableEthAddress, publishableEthAddress } from "./lib/contractAddress.js";
import { getEnv } from "./lib/env.js";
import { fetchProposals } from "./services/governance.ts";
import { fetchPortfolio, fetchPortfolioForAddress } from "./services/portfolio.ts";
import {
  allocateStrategy,
  castVote,
  depositWithApprove,
  sendVaultClaimYield,
  sendVaultWithdraw,
  serializeError,
} from "./services/tx.ts";
import { answersMatch, quizAnswerKey } from "./learning/quizAnswers.js";
import { buildNftBadges, buildNftEligibility } from "./services/nftEligibility.ts";
import {
  achievementTypeForRoute,
  achievementTypeVaultPatron,
  learningNftConfigured,
  mintAchievement,
  readHasAchievement,
} from "./services/nftMint.ts";
import { getCompletions, hasCompletedRoute, markRouteComplete, type RouteId } from "./services/learningStore.ts";
import {
  allocateBody,
  claimLearningNftBody,
  claimVaultPatronBody,
  completeDailyTaskBody,
  depositBody,
  learningCompleteBody,
  postCommunityMessageBody,
  putProfileBody,
  wealthRangeParam,
  wealthSnapshotBody,
  recordReferralBody,
  binanceKlinesQuery,
  voteBody,
  withdrawBody,
} from "./validation.ts";
import { getReferralStats, leaderboardByInvites, recordReferral } from "./services/referralStore.ts";
import { appendMessage, listMessages } from "./services/chatStore.ts";
import { scheduleCommunityBuilderChatReply } from "./services/communityAgentChatReply.ts";
import { getProfile, putProfile } from "./services/profileStore.ts";
import { getAllLatestSnapshots } from "./services/wealthHistoryStore.ts";
import {
  buildStrategyBreakdown,
  buildWealthSeries,
  computeAchievements,
  computeLevel,
  getPublicWealthAllowed,
  recordWealthForAddress,
  touchFirstVaultInteraction,
} from "./services/wealthPublic.ts";
import { getWealthHistory } from "./services/wealthHistoryStore.ts";
import { completeTask, getDailySnapshot } from "./services/dailyTasksStore.ts";
import { fetchVaultSavingsForAddress } from "./services/portfolio.ts";
import {
  tryGrantLearnRouteReward,
  tryGrantLearnCredentialNftReward,
  tryGrantVaultMemberReward,
  tryGrantVaultPatronNftReward,
} from "./services/daoVotingRewards.js";
import { buildProtocolPulse } from "./services/protocolPulse.ts";
import { getStacksConfig } from "./lib/stacksEnv.js";
import { buildStackingStatusDto } from "./services/stacksStackingStatus.ts";
import { fetchBinanceKlines } from "./services/binanceKlines.ts";
import { registerAgentRoutes } from "./routes/agents.js";
import { registerPaperclipHttpAdapterRoutes } from "./routes/paperclipHttpAdapter.js";
import { registerPipeflareRoutes } from "./routes/pipeflare.js";
import { registerAiRoutes } from "./routes/ai.js";
import { registerSocialRoutes } from "./routes/social.js";
import { registerTelegramRoutes } from "./routes/telegram.js";
import { initAppDatabase } from "./lib/db.js";
import { isAiConfigured, isCommunityAgentInChatEnabled } from "./lib/aiEnv.js";
import { isXApiConfigured } from "./lib/xApiEnv.js";
import {
  isTelegramBotConfigured,
  telegramBotDeepLink,
  telegramBotUsername,
  telegramGroupInviteUrl,
} from "./lib/telegramEnv.js";

initAppDatabase();

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
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Pipeflare-Webhook-Secret",
      "X-Paperclip-Adapter-Secret",
      "X-Paperclip-Run-Id",
    ],
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

registerPipeflareRoutes(app);
registerPaperclipHttpAdapterRoutes(app);
registerSocialRoutes(app);
registerTelegramRoutes(app);
registerAgentRoutes(app);
registerAiRoutes(app);

function apiPublicOrigin(): string {
  try {
    return new URL(getEnv().API_PUBLIC_ORIGIN.trim()).origin;
  } catch {
    return "https://api.buildingculture.capital";
  }
}

/** Canonical premium check for `https://api.buildingculture.capital/users/premium` (requires `?address=0x…`). */
app.get("/users/premium", async (c) => {
  const raw = c.req.query("address");
  if (!raw || !isAddress(raw)) {
    return c.json(
      {
        error: {
          message:
            "Query parameter `address` (0x + 40 hex) is required. Example: /users/premium?address=0x…",
        },
      },
      400,
    );
  }
  const address = raw.toLowerCase() as `0x${string}`;
  try {
    const elig = await buildNftEligibility(address);
    const savings = elig.vaultPatron.savings;
    const min = elig.vaultPatron.minDeposit;
    const vaultMeetsMin = savings >= min;
    const vaultPatronNft = elig.vaultPatron.mintedOnChain;
    const hasLearningCredential = (["rwa", "authenticity", "truth"] as const).some(
      id => elig.routes[id].mintedOnChain,
    );
    const premium = vaultMeetsMin || vaultPatronNft || hasLearningCredential;
    return c.json({
      premium,
      address,
      criteria: {
        vaultSavings: savings,
        vaultPatronMinDeposit: min,
        vaultMeetsMin,
        vaultPatronNft,
        hasLearningCredential,
      },
    });
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 500);
  }
});

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
    let binanceHost = "api.binance.com";
    try {
      binanceHost = new URL(env.BINANCE_API_BASE).host;
    } catch {
      /* keep default */
    }
    const origin = apiPublicOrigin();
    return c.json({
      chainId: env.CHAIN_ID,
      chainName: getChain().name,
      usersPremium: {
        url: `${origin}/users/premium`,
        requiredQueryParams: ["address"],
      },
      ai: {
        langbaseConfigured: isAiConfigured(),
        communityAgentInChat: isCommunityAgentInChatEnabled(),
      },
      x: {
        /** X API v2 — server-only: `X_API_BEARER_TOKEN` or consumer `X_API_KEY` + `X_API_SECRET` */
        apiConfigured: isXApiConfigured(),
      },
      telegram: {
        /** Public invite link (defaults to BuildingCulture group). */
        groupInviteUrl: telegramGroupInviteUrl(),
        botUsername: telegramBotUsername(),
        botDeepLink: telegramBotDeepLink(),
        /** True when `TELEGRAM_BOT_TOKEN` is set (webhook can receive updates). */
        botTokenConfigured: isTelegramBotConfigured(),
      },
      contracts: {
        vault: env.VAULT_CONTRACT,
        treasury: env.TREASURY_CONTRACT,
        dao: env.DAO_CONTRACT,
        strategyRegistry: env.STRATEGY_REGISTRY,
        assetToken: publishableEthAddress(env.ASSET_TOKEN) ?? null,
        learningNft: publishableEthAddress(env.LEARNING_NFT_CONTRACT) ?? null,
        villaPocBondingCurve: firstPublishableEthAddress(
          env.VILLA_POC_BONDING_CURVE,
          process.env.VITE_VILLA_BONDING_CURVE_ADDRESS,
        ),
        villaPocBondingUsdc: firstPublishableEthAddress(
          env.VILLA_POC_BONDING_USDC,
          process.env.VITE_VILLA_BONDING_USDC_ADDRESS,
        ),
      },
      assetDecimals: env.ASSET_DECIMALS,
      vaultPatronMinDeposit: env.VAULT_PATRON_MIN_DEPOSIT,
      binance: {
        /** API key present on server (never exposed to client) */
        apiKeyConfigured: Boolean(env.BINANCE_API_KEY),
        /** REST host derived from BINANCE_API_BASE */
        restHost: binanceHost,
      },
    });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

/** Server-side Binance Spot klines proxy — add BINANCE_API_KEY in .env for higher rate limits (optional). */
app.get("/api/market/binance/klines", async (c) => {
  try {
    const q = binanceKlinesQuery.parse({
      symbol: c.req.query("symbol") ?? "BTCUSDT",
      interval: c.req.query("interval") ?? "1m",
      limit: c.req.query("limit") ?? "24",
    });
    const data = await fetchBinanceKlines({
      symbol: q.symbol,
      interval: q.interval,
      limit: q.limit,
    });
    return c.json(data);
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.get("/api/protocol/pulse", async (c) => {
  try {
    const pulse = await buildProtocolPulse();
    return c.json(pulse);
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

/** Read-only Stacks PoX / stacking snapshot for the configured DAO address (no signing). */
app.get("/api/stacks/stacking-status", async (c) => {
  try {
    const cfg = getStacksConfig();
    if (!cfg) {
      return c.json({ enabled: false as const });
    }
    const dto = await buildStackingStatusDto(cfg);
    return c.json(dto);
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.get("/api/portfolio", async (c) => {
  try {
    const q = c.req.query("address")?.trim();
    if (q && !isAddress(q)) {
      return c.json({ error: { message: "Invalid address query" } }, 400);
    }
    const data =
      q && isAddress(q)
        ? await fetchPortfolioForAddress(q.toLowerCase() as `0x${string}`)
        : await fetchPortfolio();
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
    const addr = body.address.toLowerCase() as `0x${string}`;
    const rid = body.routeId as RouteId;
    const key = quizAnswerKey[rid];
    if (!key) {
      return c.json({ error: { message: "Unknown learning route." } }, 400);
    }
    if (body.answers.length !== key.length) {
      return c.json(
        { error: { message: `Select exactly one answer for each of the ${key.length} questions.` } },
        400,
      );
    }
    if (!answersMatch(rid, body.answers)) {
      return c.json(
        { error: { message: "One or more answers are incorrect. Re-read the lesson and try again." } },
        400,
      );
    }
    markRouteComplete(addr, body.routeId as RouteId);
    const daoVotingReward = await tryGrantLearnRouteReward(addr, body.routeId as RouteId);
    return c.json({ ok: true, routeId: body.routeId, daoVotingReward });
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

/** Quiz completion per wallet (SQLite + legacy JSON migration). Used by Academy and NFT eligibility. */
app.get("/api/learning/progress", (c) => {
  try {
    const address = c.req.query("address");
    if (!address || !/^0x[a-fA-F0-9]{40}$/i.test(address)) {
      return c.json({ error: { message: "Query ?address=0x… is required." } }, 400);
    }
    const routes = getCompletions(address as `0x${string}`);
    return c.json({ routes });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
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
    const daoVotingReward = await tryGrantLearnCredentialNftReward(addr, routeId);
    return c.json({ ...result, daoVotingReward });
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
    const daoVotingReward = await tryGrantVaultPatronNftReward(addr);
    return c.json({ ...result, daoVotingReward });
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
    scheduleCommunityBuilderChatReply();
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
    const profile = putProfile(addr, {
      bio: body.bio,
      socials: body.socials,
      publicWealthProfile: body.publicWealthProfile,
      wealthDisplayName: body.wealthDisplayName,
    });
    return c.json({ profile });
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.get("/api/wealth/:address", async (c) => {
  try {
    const raw = c.req.param("address");
    if (!raw || !/^0x[a-fA-F0-9]{40}$/i.test(raw)) {
      return c.json({ error: { message: "Invalid address" } }, 400);
    }
    const addr = raw.toLowerCase() as `0x${string}`;
    const profile = getProfile(addr);
    if (!getPublicWealthAllowed(profile)) {
      return c.json({ error: { message: "This investor profile is private." }, private: true }, 403);
    }
    const rangeParsed = wealthRangeParam.safeParse(c.req.query("range") ?? "1Y");
    const range = rangeParsed.success ? rangeParsed.data : "1Y";
    const portfolio = await fetchPortfolioForAddress(addr);
    recordWealthForAddress(addr, portfolio);
    if (portfolio.totalSavings > 0 || portfolio.yieldEarned > 0) {
      touchFirstVaultInteraction(addr, profile);
    }
    const profileAfter = getProfile(addr);
    const history = getWealthHistory(addr);
    const series = buildWealthSeries(addr, history, portfolio.totalSavings, portfolio.yieldEarned, range);
    return c.json({
      address: addr,
      profile: {
        wealthDisplayName: profileAfter.wealthDisplayName ?? null,
        memberSince: profileAfter.firstVaultInteractionAt ?? null,
      },
      portfolio,
      series,
      strategies: buildStrategyBreakdown(portfolio),
      achievements: computeAchievements(portfolio),
      level: computeLevel(portfolio),
      meta: {
        range,
        dataProvenance:
          "On-chain reads via viem multicall; history uses server snapshots (append on view). Full log indexer can replace synthetic backfill.",
      },
    });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.post("/api/wealth/snapshot", async (c) => {
  try {
    const body = wealthSnapshotBody.parse(await c.req.json());
    const addr = body.address.toLowerCase() as `0x${string}`;
    const portfolio = await fetchPortfolioForAddress(addr);
    recordWealthForAddress(addr, portfolio);
    const daoVotingReward = await tryGrantVaultMemberReward(addr);
    return c.json({
      ok: true,
      address: addr,
      vault: portfolio.totalSavings,
      yield: portfolio.yieldEarned,
      daoVotingReward,
    });
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.get("/api/referrals/leaderboard/top", (c) => {
  try {
    const lim = Math.min(100, Math.max(1, Number(c.req.query("limit")) || 20));
    return c.json({ rows: leaderboardByInvites(lim) });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.get("/api/referrals/:address", (c) => {
  try {
    const raw = c.req.param("address");
    if (!raw || !/^0x[a-fA-F0-9]{40}$/i.test(raw)) {
      return c.json({ error: { message: "Invalid address" } }, 400);
    }
    const data = getReferralStats(raw.toLowerCase() as `0x${string}`);
    return c.json(data);
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
  }
});

app.post("/api/referrals/record", async (c) => {
  try {
    const body = recordReferralBody.parse(await c.req.json());
    const inv = body.inviter as `0x${string}`;
    const invi = body.invitee as `0x${string}`;
    const r = recordReferral(inv, invi);
    return c.json(r);
  } catch (e) {
    return c.json({ error: formatRouteError(e) }, 400);
  }
});

app.get("/api/leaderboard", (c) => {
  try {
    const all = getAllLatestSnapshots();
    const visible = all.filter((row) => {
      const p = getProfile(row.address as `0x${string}`);
      return getPublicWealthAllowed(p);
    });
    const topInvestors = [...visible].sort((a, b) => b.vaultUsd - a.vaultUsd).slice(0, 50);
    const topYield = [...visible].sort((a, b) => b.yieldUsd - a.yieldUsd).slice(0, 50);
    const topStrategists = [...visible].sort((a, b) => b.strategyRoiPct - a.strategyRoiPct).slice(0, 50);
    const topVoters = [...visible].sort((a, b) => b.votesCast - a.votesCast).slice(0, 50);
    return c.json({
      topInvestors,
      topYieldEarners: topYield,
      topStrategists,
      topDaoVoters: topVoters,
      meta: { count: visible.length },
    });
  } catch (e) {
    return c.json({ error: serializeError(e) }, 500);
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
  "[api] Routes include GET/POST /api/paperclip/http-agent, GET/POST /pipeflare/callback, GET /api/agents, GET /users/premium, GET /api/tasks/daily, /api/profile, /api/wealth/:address, /api/leaderboard, /api/community/messages — if any 404 while older routes work, restart this process (stale tsx node).",
);
serve({ fetch: app.fetch, port, hostname: listenHost });
