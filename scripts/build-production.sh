#!/usr/bin/env bash
# Production frontend build. Set VITE_SITE_ORIGIN to your public HTTPS URL (no trailing slash).
set -euo pipefail
cd "$(dirname "$0")/.."
export VITE_SITE_ORIGIN="${VITE_SITE_ORIGIN:-https://app.buildingculture.capital}"
# Same-origin API: leave unset so the client uses relative /api/* (nginx proxies to Hono).
unset VITE_API_URL 2>/dev/null || true
npm run build
if [[ ! -s dist/index.html ]]; then
  echo "Production build failed sanity check: dist/index.html is missing or empty." >&2
  exit 1
fi
sz="$(wc -c <dist/index.html | tr -d ' ')"
if [[ "$sz" -lt 800 ]]; then
  echo "Production build failed sanity check: dist/index.html is only ${sz} bytes." >&2
  exit 1
fi
echo "Built with VITE_SITE_ORIGIN=$VITE_SITE_ORIGIN"
