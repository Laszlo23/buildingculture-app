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
