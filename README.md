# Building Culture — Onchain Savings Club

Public app repo for **[app.buildingculture.capital](https://app.buildingculture.capital)** (subdomain). The marketing site at **buildingculture.capital** can stay on your existing host; DNS only adds an **`app`** record to this stack.

**Stack:** React (Vite) + Hono (Node) + optional Docker Compose. On-chain features use Base / Base Sepolia (see `.env.example`).

**Repository:** [github.com/Laszlo23/buildingculture-app](https://github.com/Laszlo23/buildingculture-app) (public)

## Local development

```bash
npm install
cp .env.example .env   # fill in keys (never commit .env)
npm run dev              # UI :8080, API on PORT (default 3001)
```

## Production deploy

Full steps (nginx, TLS, Docker): **[deploy/DEPLOY.md](deploy/DEPLOY.md)**.

Quick path on a VPS with Docker + Node:

```bash
export VITE_SITE_ORIGIN=https://app.buildingculture.capital
./scripts/docker-up.sh   # builds dist + docker compose (API + nginx on 127.0.0.1:8080)
```

Put host HTTPS in front of `http://127.0.0.1:8080` (see `deploy/nginx-host-ssl-to-docker.conf.example`).

## License

No license file is set in this repository yet; add one if you need explicit terms for reuse.
