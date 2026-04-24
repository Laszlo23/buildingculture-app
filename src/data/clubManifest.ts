/**
 * Club manifest — “why we exist” story (distinct from marketing tagline).
 * Footer shows {@link CLUB_MANIFEST_FOOTER}; full copy on `/manifest`.
 */
export const CLUB_MANIFEST_FOOTER = {
  kicker: "Why we built this",
  /** One short line under the kicker on small screens */
  headline: "Savings you can inspect — not hype you scroll past.",
  /** 2–3 sentences; footer shows first paragraph only on narrow layouts */
  paragraphs: [
    "Most wealth apps optimize for engagement. We optimize for receipts: where money sits, how yield is routed, and proof you finished the work (soulbound Academy mints, public graphs you choose to share).",
    "Base is home because settlement should be cheap enough that everyday savers—not only whales—get the same transparency as institutions. If a flow does not earn your trust, it does not belong in the product.",
    "Nothing here is a promise of returns; it is infrastructure for people who want culture, education, and vault tooling in one honest surface.",
  ],
} as const;

export const CLUB_MANIFEST_PAGE = {
  title: "Manifest",
  subtitle: "Onchain Savings Club — why this exists",
  sections: [
    {
      heading: "The problem we saw",
      body: [
        "Social feeds reward loud takes and cropped PnL. Long-term saving is boring by design—so it rarely wins the algorithm.",
        "We wanted a single place where “show your work” is normal: contract addresses, reserve context, learning paths that end in credentials, and optional public wealth pages when you feel proud—not pressured.",
      ],
    },
    {
      heading: "What we optimize for",
      body: [
        "Clarity over cleverness: fewer mystery boxes, more links to sources and deploys.",
        "Agency over FOMO: you choose public profiles, invites, and what to mint.",
        "Culture over casino: DAO and Academy are first-class because informed members make better long-term decisions.",
      ],
    },
    {
      heading: "Who this is for",
      body: [
        "People stacking on Base who are tired of vibes-only dashboards.",
        "Builders and partners (see Ecosystem thanks) who want alignment with transparent routing.",
        "Anyone who believes receipts—not slogans—are how trust scales on the open web.",
      ],
    },
    {
      heading: "What we will not do",
      body: [
        "Promise returns or hide risk behind UI chrome.",
        "Ship dark patterns around withdrawals or referrals.",
        "Treat education as a funnel to reckless size—Academy copy is educational only, not investment advice.",
      ],
    },
  ],
} as const;
