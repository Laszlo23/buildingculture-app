# Multichain rollout

This app’s **API and UI are configured per environment**: one `CHAIN_ID`, one set of contract addresses, and one RPC (or Alchemy for Base only). That is intentional — it keeps portfolio reads, DAO calls, and mint flows predictable.

## Ways to run on more than one chain

1. **Separate deployments (recommended today)**  
   For each chain (e.g. Base mainnet, Base Sepolia, Arbitrum), run:

   - Deploy contracts on that network (full stack: `npm run deploy:base` / `deploy:base-sepolia`, or **GovernanceDAO only**: `npm run deploy:dao`).
   - Copy `.env` per host with matching `CHAIN_ID`, `RPC_URL` (required when `CHAIN_ID` is not Base — see below), `VAULT_CONTRACT`, `TREASURY_CONTRACT`, `DAO_CONTRACT`, `STRATEGY_REGISTRY`, `ASSET_TOKEN`, etc.
   - Build the frontend with **`VITE_CHAIN_ID`** equal to that chain (and extend `src/config/wagmi.ts` with extra `viem/chains` if the wallet stack should connect there — today Base + Base Sepolia are wired by default).

2. **Future: unified API**  
   A single process serving multiple chains would need keyed env (`DAO_CONTRACT_8453`, …) and routing by wallet chain — not implemented in this repo yet.

## RPC and Alchemy

- **`ALCHEMY_API_KEY`**: the server builds Base / Base Sepolia Alchemy URLs only when **`CHAIN_ID` is `8453` or `84532`**.  
- **Any other `CHAIN_ID`**: set **`RPC_URL`** to an HTTP RPC for that chain (QuickNode, Alchemy chain-specific URL, public node, etc.). You may keep `ALCHEMY_API_KEY` for other tooling, but the API will not guess a non-Base Alchemy host from `CHAIN_ID` alone.

## Optional chain metadata (non-Base)

When `CHAIN_ID` is not Base or Base Sepolia, the server uses a minimal **`defineChain`** profile. Tune labels for logs and explorers:

| Variable | Purpose |
|----------|---------|
| `CHAIN_NAME` | Short name (default: `Chain <id>`) |
| `CHAIN_NATIVE_SYMBOL` | Native symbol for the chain object (default: `ETH`) |
| `CHAIN_EXPLORER_URL` | Block explorer base URL (optional) |

## GovernanceDAO only (e.g. voting fix)

After pulling the Solidity fix, deploy a **new** `GovernanceDAO` on the target network:

```bash
npx hardhat run scripts/deploy-governance-dao.cjs --network baseSepolia
# or --network base
```

Paste printed `DAO_CONTRACT=` into `.env`, restart the API, and point the UI’s config at the same address. **Existing deployed DAO bytecode is immutable** — you must switch env to the new address; old proposals live on the old contract.

## Hardhat: add a network

`hardhat.config.cjs` includes **`base`**, **`baseSepolia`**, **`arbitrumOne`** (42161), and **`optimism`** (10) for `deploy:dao` and other scripts. Override RPCs with **`ARBITRUM_RPC_URL`** / **`OPTIMISM_RPC_URL`** when you outgrow public endpoints.

```bash
npm run deploy:dao -- --network arbitrumOne
npm run deploy:dao -- --network optimism
```

For other chains, add a `networks.<name>` entry (`url`, `accounts`, `chainId`), then:

```bash
npx hardhat run scripts/deploy-governance-dao.cjs -- --network <name>
```

Use a funded deployer key on that chain.

## Frontend wallet (`wagmi`)

`src/config/wagmi.ts` registers **Base**, **Base Sepolia**, **Arbitrum**, and **Optimism** so `VITE_CHAIN_ID` can target those networks without a separate bundle. Add more chains from `viem/chains` the same way if you extend Hardhat.
