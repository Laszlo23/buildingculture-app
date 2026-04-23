# Deploy to `app.buildingculture.capital` (VPS)

Stack: **Vite static** (`dist/`) behind **nginx**, **Hono** API on `127.0.0.1:PORT` (default `3001`), TLS via **Let’s Encrypt**.

## Main site vs this app

The **marketing / main site** at `buildingculture.capital` (and often `www`) can stay on your existing host (e.g. **Onchain** or any other provider). **Do not** move the apex domain to this VPS unless you intend to host that site here.

This deployment is **only** for the **subdomain**:

| Host | Typical setup |
|------|----------------|
| `buildingculture.capital`, `www.buildingculture.capital` | Unchanged — keep current DNS / hosting (ogchain, etc.) |
| `app.buildingculture.capital` | **New** A (or AAAA) record → **this VPS** IP only |

You are adding a **single DNS label** (`app`) so the React app and API live under the subdomain without affecting the root site.

## 1. DNS

Add an **A record** for the **subdomain only**: `app` → `app.buildingculture.capital` resolves to your **VPS** public IPv4 (or use **AAAA** for IPv6).

At your DNS registrar (where `buildingculture.capital` is managed), create:

- **Name / host:** `app` (some UIs show `app.buildingculture.capital` as the full name)
- **Type:** A
- **Value:** your VPS IPv4

Do **not** change the root `@` or `www` records unless you know you want them on this server.

## 2. Push this repo to GitHub

On your machine (after `git` is initialized and committed):

```bash
# Create an empty repo on GitHub (web UI or gh CLI), then:
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Use a **private** repo if `.env` secrets could ever be committed by mistake (this project gitignores `.env`).

### Remote redeploy from your laptop

With `VPS_IP`, `VPS_USERNAME`, and `VPS_PASSWORD` set in your **local** `.env` (gitignored) and [`sshpass`](https://sourceforge.net/projects/sshpass/) installed:

```bash
./scripts/deploy-from-env.sh
```

This SSHs to the VPS, `git pull`s under `DEPLOY_PATH` (default `/var/www/buildingculture/app`), runs `npm ci` + `npm run build:prod`, rebuilds the Docker **api** image when compose is present, and reloads nginx when applicable. See `scripts/redeploy-remote.sh` for `DEPLOY_MODE`, `FORCE_BUILD`, etc.

To **upload your local `.env` to the server first** (overwrites `$DEPLOY_PATH/.env` — use only when you intend to sync secrets):

```bash
SYNC_ENV=1 ./scripts/deploy-from-env.sh
```

You can also set `DEPLOY_PATH` in `.env` or export it before running.

## 3. VPS: Node.js and app directory

Example (Ubuntu):

```bash
sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo mkdir -p /var/www/buildingculture/app
sudo chown -R "$USER":"$USER" /var/www/buildingculture/app
```

### Option A — Docker Compose (API in Docker, static build on the host)

Install Docker:

```bash
sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker "$USER"
# log out and back in so `docker` works without sudo
```

Then clone, configure `.env` (same as below), and from the app directory:

```bash
export VITE_SITE_ORIGIN=https://app.buildingculture.capital
./scripts/docker-up.sh
```

This runs `npm ci` + `npm run build:prod` (needs `.env` for Vite / Alchemy / Web3.bio) and starts **`docker compose`**: nginx on **`127.0.0.1:8080`** + API container on port 3001 (internal). Put **host nginx + TLS** in front by proxying `https://app.buildingculture.capital` → `http://127.0.0.1:8080` (see `deploy/nginx-host-ssl-to-docker.conf.example`). Use Let’s Encrypt on the host for `app.buildingculture.capital`.

Updates: `git pull && ./scripts/docker-up.sh` (set `FORCE_BUILD=1` to force a fresh `npm run build`).

---

### Option B — No Docker (Node + systemd + nginx serving `dist/`)

Continue with sections 4–8 below.

## 4. Clone and configure

```bash
cd /var/www/buildingculture/app
git clone https://github.com/YOUR_USER/YOUR_REPO.git .
# Or: git pull if you already cloned

cp .env.example .env
nano .env   # paste production values from your local .env (never commit .env)
```

**Required for the API** (see `server/lib/env.ts`): `PRIVATE_KEY`, contract addresses, `ALCHEMY_API_KEY` or `RPC_URL`, etc.

**Persistence** — Community chat and learning quiz completions are stored in **`server/.data/app.db`** (SQLite). Back up that file (and the rest of `server/.data/`) with your app; legacy JSON files are auto-imported into the DB once if the tables are empty.

**Farcaster (optional)** — Set **`NEYNAR_API_KEY`** on the server (same `.env` as the API) to resolve @handles for wallets that are Farcaster custody or verified addresses. The key never goes in the Vite bundle; the UI calls `GET /api/social/farcaster`.

**Optional: Club AI (BaseAI + Langbase)** — The Community page can call `POST /api/ai/pipe/building-culture-club` via the same Hono process. It is **not** required to run the app. Merge the variables you need from `.env.baseai.example` into the server’s `.env` (same file as the rest of the API). Set **`LANGBASE_API_KEY`** (server-only; do not add `VITE_*` for AI). Provider keys belong in [Langbase keysets](https://langbase.com/docs/features/keysets) for hosted runs. If `LANGBASE_API_KEY` is missing, the route returns **503** and the rest of the site works. Use `npm run baseai` in development to iterate on the pipe in `baseai/pipes/`.

**CORS** — set:

```env
CORS_ORIGIN=https://app.buildingculture.capital
PORT=3001
```

**Frontend build-time** — `VITE_SITE_ORIGIN` is applied when you run the production build (see script below).

## 5. Build frontend on the server

```bash
cd /var/www/buildingculture/app
npm ci
VITE_SITE_ORIGIN=https://app.buildingculture.capital npm run build:prod
```

Leave `VITE_API_URL` **unset** in `.env` for production so the browser uses same-origin `/api/*` (nginx proxies to Hono).

## 6. Systemd for the API

```bash
sudo cp deploy/buildingculture-api.service.example /etc/systemd/system/buildingculture-api.service
sudo nano /etc/systemd/system/buildingculture-api.service   # User, paths, npm location: `which npm`
sudo systemctl daemon-reload
sudo systemctl enable --now buildingculture-api
sudo systemctl status buildingculture-api
curl -sS http://127.0.0.1:3001/health
```

Ensure the service user can read `/var/www/buildingculture/app` and `.env`.

## 7. Nginx + TLS

If Let’s Encrypt certificates **do not exist yet**, either run `sudo certbot certonly --nginx -d app.buildingculture.capital` with a minimal HTTP `server` block first, or temporarily **comment out** the `listen 443 ssl` block in the example file until `certbot` has created `/etc/letsencrypt/live/...`, then `sudo nginx -t && sudo systemctl reload nginx`.

```bash
sudo cp deploy/nginx-app.buildingculture.capital.conf.example /etc/nginx/sites-available/app.buildingculture.capital
sudo ln -sf /etc/nginx/sites-available/app.buildingculture.capital /etc/nginx/sites-enabled/
sudo nginx -t
sudo certbot --nginx -d app.buildingculture.capital
```

Certbot may adjust the config; keep `root` pointing at `.../app/dist`, **`location /api/`**, **`location /users/`**, and **`location /pipeflare/`** proxying to `127.0.0.1:3001` (or your `PORT`) so **`GET /users/premium`** and **`POST /pipeflare/callback`** (Pipeflare webhooks) are reachable on the same Hono process. If you use a dedicated **`api.buildingculture.capital`** vhost, mirror the same proxy blocks there.

```bash
sudo systemctl reload nginx
curl -sSI https://app.buildingculture.capital/health
```

## 8. Firewall

Allow `80` and `443` (e.g. `ufw allow 'Nginx Full'`).

## Updates after code changes

```bash
cd /var/www/buildingculture/app
git pull
npm ci
VITE_SITE_ORIGIN=https://app.buildingculture.capital npm run build:prod
sudo systemctl restart buildingculture-api
sudo systemctl reload nginx
```

## Villa POC bonding curve (optional)

The Reserves “Villa” flow is a **single contract**: `VillaPocBondingCurve` (receipt ERC-20 **vEBR** + USDC bonding curve). Deploy it with Hardhat using a funded wallet on the target network.

**Environment (in `.env`, never commit real keys)**

- **`DEPLOY_PRIVATE_KEY`** (recommended) or **`PRIVATE_KEY`**: `0x` + 64 hex characters — the wallet that pays gas and becomes `owner` of the curve (can pause / set params per the Solidity contract).
- **`ALCHEMY_API_KEY`** or **`RPC_URL`** / **`BASE_MAINNET_RPC_URL`**: so Hardhat can submit transactions to Base Sepolia or Base mainnet.
- Optional: **`VILLA_POC_BENEFICIARY`** — address that receives USDC from `buy()` (on mainnet you should set this to your treasury or multisig).
- Optional curve tuning: **`VILLA_POC_USDC`**, **`VILLA_POC_P0_MICRO`**, **`VILLA_POC_ALPHA_MICRO`**, **`VILLA_POC_MAX_SUPPLY_WEI`** (see `scripts/deploy-villa-bonding-curve.cjs`).

**Commands**

```bash
npm run compile:contracts
npm run deploy:villa-poc:sepolia
# or mainnet (real ETH on Base + legal readiness):
# VILLA_POC_BENEFICIARY=0xYourMultisig npm run deploy:villa-poc:mainnet
```

On **Base Sepolia**, the script deploys a **mock USDC**, mints test balance to the deployer, then deploys the curve. On **Base mainnet**, it uses canonical Base USDC unless `VILLA_POC_USDC` is set.

Copy the printed **`VITE_VILLA_BONDING_CURVE_ADDRESS`** (and **`VITE_VILLA_BONDING_USDC_ADDRESS`** if shown) into the host `.env` before `npm run build:prod`. The Reserves page shows the buy UI only when the curve address is set. Set **`VITE_CHAIN_ID`** to `84532` or `8453` to match the deployment network.
