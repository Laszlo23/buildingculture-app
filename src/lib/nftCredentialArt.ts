import type { LearningRouteId } from "@/data/learningRoutes";

/** Legacy / Vault Patron (achievement type 4) artwork. */
export const OSC_LEARNING_NFT_IMAGE_URL = "https://buildingculture.4everbucket.com/nft.png";

/** Academy learning credentials — one artwork per chapter (1 → 2 → 3 finale). */
export const LEARNING_NFT_IMAGE_TYPE1 = "https://buildingculture.4everbucket.com/learning1.png";
export const LEARNING_NFT_IMAGE_TYPE2 =
  "https://buildingculture.4everbucket.com/buildingcultureLearning2.png";
export const LEARNING_NFT_IMAGE_TYPE3 =
  "https://buildingculture.4everbucket.com/buildingcultureLearn3.png";

const ART_BY_ACHIEVEMENT_TYPE: Record<number, string> = {
  1: LEARNING_NFT_IMAGE_TYPE1,
  2: LEARNING_NFT_IMAGE_TYPE2,
  3: LEARNING_NFT_IMAGE_TYPE3,
  4: OSC_LEARNING_NFT_IMAGE_URL,
};

/** Art URL for a learning NFT achievement type (1–3 Academy, 4 Vault Patron). */
export function learningNftImageUrlForAchievementType(achievementType: number): string {
  return ART_BY_ACHIEVEMENT_TYPE[achievementType] ?? OSC_LEARNING_NFT_IMAGE_URL;
}

/** Art URL for an Academy story route (RWA / Authenticity / Truth). */
export function learningNftImageUrlForRoute(routeId: LearningRouteId): string {
  const t =
    routeId === "rwa" ? 1 : routeId === "authenticity" ? 2 : routeId === "truth" ? 3 : 1;
  return learningNftImageUrlForAchievementType(t);
}
