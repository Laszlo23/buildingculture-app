import { getEnv } from "../lib/env.js";
import { hasCompletedRoute, type RouteId } from "./learningStore.js";
import {
  achievementTypeForRoute,
  achievementTypeVaultPatron,
  learningNftConfigured,
  readHasAchievement,
} from "./nftMint.ts";
import { fetchVaultSavingsForAddress } from "./portfolio.ts";

const ROUTES: RouteId[] = ["rwa", "authenticity", "truth"];

export async function buildNftEligibility(address: `0x${string}`) {
  const env = getEnv();
  const minDeposit = env.VAULT_PATRON_MIN_DEPOSIT;
  let savings = 0;
  try {
    savings = await fetchVaultSavingsForAddress(address);
  } catch {
    savings = 0;
  }

  const routes: Record<
    RouteId,
    { completed: boolean; mintedOnChain: boolean; canMint: boolean }
  > = {
    rwa: { completed: false, mintedOnChain: false, canMint: false },
    authenticity: { completed: false, mintedOnChain: false, canMint: false },
    truth: { completed: false, mintedOnChain: false, canMint: false },
  };

  if (learningNftConfigured()) {
    for (const r of ROUTES) {
      const completed = hasCompletedRoute(address, r);
      const minted = await readHasAchievement(address, achievementTypeForRoute(r));
      const prereqsForTruth =
        r === "truth"
          ? hasCompletedRoute(address, "rwa") && hasCompletedRoute(address, "authenticity")
          : true;
      routes[r] = {
        completed,
        mintedOnChain: minted,
        canMint: completed && !minted && prereqsForTruth,
      };
    }
  } else {
    for (const r of ROUTES) {
      const completed = hasCompletedRoute(address, r);
      routes[r] = {
        completed,
        mintedOnChain: false,
        canMint: false,
      };
    }
  }

  let patronMinted = false;
  if (learningNftConfigured()) {
    patronMinted = await readHasAchievement(address, achievementTypeVaultPatron());
  }

  return {
    learningNftConfigured: learningNftConfigured(),
    routes,
    vaultPatron: {
      savings,
      minDeposit,
      eligible: learningNftConfigured() && savings >= minDeposit && !patronMinted,
      mintedOnChain: patronMinted,
      canMint:
        learningNftConfigured() && savings >= minDeposit && !patronMinted,
    },
  };
}

const BADGE_META = [
  { id: "rwa" as const, name: "RWA Scholar", achievementType: 1 },
  { id: "authenticity" as const, name: "Authenticity Scout", achievementType: 2 },
  { id: "truth" as const, name: "Truth Navigator", achievementType: 3 },
  { id: "vault-patron" as const, name: "Vault Patron", achievementType: 4 },
];

export async function buildNftBadges(address: `0x${string}`) {
  const elig = await buildNftEligibility(address);
  const badges = await Promise.all(
    BADGE_META.map(async (b) => {
      let minted = false;
      if (learningNftConfigured()) {
        minted = await readHasAchievement(address, b.achievementType);
      }
      return {
        id: b.id,
        name: b.name,
        achievementType: b.achievementType,
        minted,
      };
    }),
  );
  return { address, learningNftConfigured: elig.learningNftConfigured, badges };
}
