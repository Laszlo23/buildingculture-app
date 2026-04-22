#!/usr/bin/env bash
# Production frontend build. Set VITE_SITE_ORIGIN to your public HTTPS URL (no trailing slash).
set -euo pipefail
cd "$(dirname "$0")/.."
export VITE_SITE_ORIGIN="${VITE_SITE_ORIGIN:-https://app.buildingculture.capital}"
# Same-origin API: leave unset so the client uses relative /api/* (nginx proxies to Hono).
unset VITE_API_URL 2>/dev/null || true
npm run build
echo "Built with VITE_SITE_ORIGIN=$VITE_SITE_ORIGIN"
