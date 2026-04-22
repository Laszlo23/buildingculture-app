/**
 * Integration smoke: calls the local API (start with `npm run dev` or `npm run dev:api`).
 * Requires the same env as the API (RPC_URL or ALCHEMY_API_KEY, PRIVATE_KEY, contract addresses).
 *
 * Usage: npx tsx scripts/smoke-base.ts
 */
import { chainApi } from "../src/lib/api.ts";

/** Default API URL (direct Hono; dev UI is http://localhost:8080 with proxy to this port). */
const base = process.env.SMOKE_API_BASE ?? "http://127.0.0.1:3001";

async function main() {
  const orig = globalThis.fetch;
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input.toString();
    if (url.startsWith("/")) {
      return orig(`${base}${url}`, init);
    }
    return orig(input, init);
  };

  console.log("GET /api/wallet");
  const w = await chainApi.wallet();
  console.log("  address:", w.address);

  console.log("GET /api/portfolio");
  const p = await chainApi.portfolio();
  console.log("  totalSavings:", p.totalSavings);

  console.log("POST /api/transactions/claim-yield (may revert if contracts are placeholders)");
  try {
    const tx = await chainApi.claimYield();
    console.log("  tx:", tx.txHash, tx.status);
  } catch (e) {
    console.log("  expected failure on dummy contracts:", e instanceof Error ? e.message : e);
  }

  console.log("POST /api/governance/vote (may revert)");
  try {
    const v = await chainApi.vote("42", 1);
    console.log("  tx:", v.txHash);
  } catch (e) {
    console.log("  expected failure:", e instanceof Error ? e.message : e);
  }

  globalThis.fetch = orig;
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
