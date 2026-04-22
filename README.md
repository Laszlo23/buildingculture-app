# Onchain Savings Club (Vite + Hono)

Community DAO app: React frontend, Hono API for on-chain actions and community features.

## Local development

```bash
npm install
cp .env.example .env   # fill in keys
npm run dev            # API + Vite (UI on :8080, API on PORT from .env)
```

## Production deploy

See **[deploy/DEPLOY.md](deploy/DEPLOY.md)** for nginx, systemd, TLS, and deploying to **`app.buildingculture.capital`**.

The main site at **`buildingculture.capital`** can stay on your existing host; only the **`app`** subdomain needs to point at the VPS running this stack.

Build for production (sets canonical/OG site origin):

```bash
VITE_SITE_ORIGIN=https://app.buildingculture.capital npm run build:prod
npm run start          # Hono API; serve `dist/` with nginx (see deploy/)
```

Do not commit `.env`; it is listed in `.gitignore`.
