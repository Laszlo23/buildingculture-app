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

Certbot may adjust the config; keep `root` pointing at `.../app/dist` and `location /api/` proxying to `127.0.0.1:3001` (or your `PORT`).

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
