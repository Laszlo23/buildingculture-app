#!/usr/bin/env bash
# Build frontend (reads .env for Vite) and start Docker nginx + API.
set -euo pipefail
cd "$(dirname "$0")/.."
export VITE_SITE_ORIGIN="${VITE_SITE_ORIGIN:-https://app.buildingculture.capital}"
if [[ ! -f .env ]]; then
  echo "Missing .env — copy from .env.example and fill values." >&2
  exit 1
fi
if [[ ! -d dist ]] || [[ "${FORCE_BUILD:-}" == "1" ]]; then
  npm ci
  npm run build:prod
fi
docker compose up -d --build
echo "Stack up. HTTP: http://127.0.0.1:8080 — point host nginx + TLS here (see deploy/DEPLOY.md)."
