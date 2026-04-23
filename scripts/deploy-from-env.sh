#!/usr/bin/env bash
# Load VPS_* from .env and run scripts/redeploy-remote.sh (password via sshpass).
# Required in .env: VPS_IP, VPS_USERNAME, VPS_PASSWORD
# Optional: same overrides as redeploy-remote (DEPLOY_PATH, DEPLOY_MODE, VITE_SITE_ORIGIN, SSH_OPTS, FORCE_BUILD).
#
# Upload local env to the VPS before redeploy (overwrites remote `$DEPLOY_PATH/.env`):
#   SYNC_ENV=1 ./scripts/deploy-from-env.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENVF="${ENV_FILE:-$ROOT/.env}"

if [[ ! -f "$ENVF" ]]; then
  echo "Missing env file: $ENVF (set ENV_FILE=... to override)" >&2
  exit 1
fi

get_env_line() {
  # Last match for KEY= (simple KEY=value files; no multiline values).
  # With pipefail, grep exits 1 when KEY is absent — do not fail the script for optional keys (e.g. DEPLOY_PATH).
  { grep -E "^${1}=" "$ENVF" 2>/dev/null || true; } | tail -n1 | cut -d= -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//;s/^"//;s/"$//;s/^'"'"'//;s/'"'"'$//'
}

VPS_IP="$(get_env_line VPS_IP)"
VPS_USERNAME="$(get_env_line VPS_USERNAME)"
VPS_PASSWORD="$(get_env_line VPS_PASSWORD)"
DEPLOY_PATH="${DEPLOY_PATH:-$(get_env_line DEPLOY_PATH)}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/buildingculture/app}"
export DEPLOY_PATH

if [[ -z "$VPS_IP" || -z "$VPS_USERNAME" ]]; then
  echo "Set VPS_IP and VPS_USERNAME in $ENVF (or ENV_FILE)." >&2
  exit 1
fi

if [[ -z "$VPS_PASSWORD" ]]; then
  echo "VPS_PASSWORD is empty. Use an SSH key and run: DEPLOY_SSH=user@host $ROOT/scripts/redeploy-remote.sh" >&2
  exit 1
fi

if ! command -v sshpass >/dev/null 2>&1; then
  echo "sshpass is required for password deploy (brew install sshpass / apt install sshpass)." >&2
  exit 1
fi

export DEPLOY_SSH="${VPS_USERNAME}@${VPS_IP}"
export SSHPASS="$VPS_PASSWORD"

sync_env_raw="$(echo "${SYNC_ENV:-}" | tr '[:upper:]' '[:lower:]')"
if [[ "$sync_env_raw" == "1" || "$sync_env_raw" == "true" || "$sync_env_raw" == "yes" ]]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  echo "SYNC_ENV=1 — uploading LOCAL file to VPS (overwrites remote .env):" >&2
  echo "  from: $ENVF" >&2
  echo "  to:   ${VPS_USERNAME}@${VPS_IP}:${DEPLOY_PATH}/.env" >&2
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" >&2
  # shellcheck disable=SC2086
  SSHPASS="$VPS_PASSWORD" sshpass -e scp ${SSH_OPTS:-} -o StrictHostKeyChecking=accept-new \
    "$ENVF" "${VPS_USERNAME}@${VPS_IP}:${DEPLOY_PATH}/.env"
  echo "→ .env uploaded." >&2
fi

exec "$ROOT/scripts/redeploy-remote.sh"
