/** UI-only perk copy for learning credentials (v1). On-chain enforcement is out of scope. */
export const learningNftPerks = [
  {
    badgeId: "rwa",
    name: "RWA Scholar",
    governanceUi: "+0.05 voting weight display multiplier (cosmetic)",
    feeMessaging: "Fee discount messaging in-app where applicable",
    other: "Profile badge · Academy epilogue copy unlocked",
  },
  {
    badgeId: "authenticity",
    name: "Authenticity Scout",
    governanceUi: "+0.05 voting weight display multiplier (cosmetic)",
    feeMessaging: "Priority support queue (non-financial)",
    other: "Profile badge · Sneakers & luxury narrative epilogue",
  },
  {
    badgeId: "truth",
    name: "Truth Navigator",
    governanceUi: "+0.05 voting weight display multiplier (cosmetic)",
    feeMessaging: "Settlement & oracle deep-dive module unlocked",
    other: "Profile badge · finale mint after Scholar + Scout · “Truth layer” explainer access",
  },
  {
    badgeId: "vault-patron",
    name: "Vault Patron",
    governanceUi: "+0.1 voting weight display multiplier (cosmetic)",
    feeMessaging: "Vault Patron flair in community surfaces",
    other: "Profile badge · thank-you for backing the vault",
  },
] as const;
