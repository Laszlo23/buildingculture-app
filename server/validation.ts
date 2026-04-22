import { z } from "zod";

export const depositBody = z.object({
  amount: z.string().min(1),
  /** Optional override; defaults to server ASSET_DECIMALS */
  decimals: z.number().int().min(0).max(36).optional(),
});

export const withdrawBody = z.object({
  amount: z.string().min(1),
  decimals: z.number().int().min(0).max(36).optional(),
});

export const allocateBody = z.object({
  strategyId: z.union([z.string(), z.number()]),
  bps: z.number().int().min(0).max(10000),
});

export const voteBody = z.object({
  proposalId: z.string().min(1),
  support: z.union([z.literal(0), z.literal(1), z.literal(2)]),
});

export const learningCompleteBody = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  routeId: z.enum(["rwa", "authenticity", "truth"]),
  answers: z.array(z.number().int().min(0).max(12)),
});

export const claimLearningNftBody = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  routeId: z.enum(["rwa", "authenticity", "truth"]),
});

export const claimVaultPatronBody = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const postCommunityMessageBody = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  text: z.string().min(1).max(500),
});

export const putProfileBody = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  bio: z.string().max(2000).optional(),
  socials: z
    .object({
      twitter: z.string().max(256).optional(),
      github: z.string().max(256).optional(),
      website: z.string().max(512).optional(),
      farcaster: z.string().max(256).optional(),
    })
    .optional(),
  publicWealthProfile: z.boolean().optional(),
  wealthDisplayName: z.string().max(32).nullable().optional(),
});

export const wealthSnapshotBody = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const wealthRangeParam = z.enum(["1M", "3M", "6M", "1Y", "ALL"]);

export const completeDailyTaskBody = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  taskId: z.enum(["check_in", "share_x", "community_pulse"]),
});

export const recordReferralBody = z.object({
  inviter: z.string().regex(/^0x[a-fA-F0-9]{40}$/i),
  invitee: z.string().regex(/^0x[a-fA-F0-9]{40}$/i),
});

/** Binance Spot GET /api/v3/klines — server proxy only */
export const binanceKlinesQuery = z.object({
  symbol: z
    .string()
    .min(4)
    .max(24)
    .transform((s) => s.replace(/\s+/g, "").toUpperCase())
    .refine((s) => /^[A-Z0-9]+$/.test(s), { message: "symbol must be alphanumeric (e.g. BTCUSDT)" }),
  interval: z.enum([
    "1m",
    "3m",
    "5m",
    "15m",
    "30m",
    "1h",
    "2h",
    "4h",
    "6h",
    "8h",
    "12h",
    "1d",
    "3d",
    "1w",
    "1M",
  ]),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
});

/** BaseAI building-culture-club pipe: single turn or custom message list (after system messages on server). */
export const buildingCulturePipeBody = z
  .object({
    userMessage: z.string().min(1).max(4000).optional(),
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string().min(1).max(8000),
        }),
      )
      .min(1)
      .max(50)
      .optional(),
  })
  .refine(
    (d) =>
      (d.userMessage != null && d.userMessage.trim().length > 0) ||
      (d.messages != null && d.messages.length > 0),
    { message: "Provide userMessage or messages" },
  );
