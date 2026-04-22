# Building Culture — Onchain Savings Club

Web app for **[app.buildingculture.capital](https://app.buildingculture.capital)** — a community-focused interface for vaults, DAO governance, learning routes, and treasury visibility on **Base** (mainnet or Sepolia, configured via env).

The main marketing site at **buildingculture.capital** can stay on your existing host. This codebase only needs DNS for the **`app`** subdomain pointing at the server that runs it.

## Stack

| Layer | Tech |
|--------|------|
| UI | React 18, Vite, Tailwind, shadcn/ui, wagmi/viem |
| API | Hono (Node), on-chain reads & signed txs |
| Contracts | Solidity (Hardhat) — see `contracts/` |
| Deploy | Static `dist/` + API; optional Docker (`docker-compose.yml`) |
| Wealth | `GET /api/wealth/:address`, `GET /api/leaderboard`, UI at `/investor/:address` & `/leaderboard` (snapshots + optional synthetic history until a log indexer runs) |

## Requirements

- **Node.js** 20+ (22 recommended)
- **npm** 10+
- Optional: **Docker** + Docker Compose for production-style runs

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` with RPC/Alchemy, contract addresses, server signer key, and chain id. Never commit `.env` (it is gitignored).

## Development

Runs the Vite dev server on port **8080** and the Hono API on **PORT** from `.env` (default **3001**), with `/api` proxied from the browser.

```bash
npm run dev
```

Open `http://localhost:8080`.

## Production build

Sets canonical / Open Graph origin for the public URL:

```bash
export VITE_SITE_ORIGIN=https://app.buildingculture.capital
npm run build:prod
```

Serve `dist/` behind nginx (or use Docker) and run the API with `npm run start` or the container image — see **[deploy/DEPLOY.md](deploy/DEPLOY.md)**.

Quick Docker path on a server:

```bash
./scripts/docker-up.sh
```

## Repository

**[github.com/Laszlo23/buildingculture-app](https://github.com/Laszlo23/buildingculture-app)** — public.

## License

No license file is included yet; add one (e.g. MIT/Apache-2.0) if you want to specify terms for reuse.
