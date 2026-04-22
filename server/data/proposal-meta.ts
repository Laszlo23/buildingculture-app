/** Static metadata keyed by on-chain proposal id. Merged with live vote tallies. */
export const proposalMeta: Record<
  string,
  { title: string; category: string; endsIn?: string; status: "active" | "passed" | "defeated" }
> = {
  "42": {
    title: "Acquire Villa Ebreichsdorf (Ebreichsdorf, AT) — €2.4M treasury POC",
    category: "Real Estate",
    endsIn: "2d 14h",
    status: "active",
  },
  "41": {
    title: "Increase AI Vault allocation from 12% → 18%",
    category: "Treasury",
    endsIn: "4d 02h",
    status: "active",
  },
  "40": {
    title: "Launch Beginner Academy season 3 with 50K OSC rewards",
    category: "Education",
    endsIn: "6d 18h",
    status: "active",
  },
  "39": {
    title: "Onboard Aerodrome v2 LP strategy",
    category: "Strategy",
    endsIn: "Passed",
    status: "passed",
  },
};
