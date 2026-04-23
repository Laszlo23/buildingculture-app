#!/usr/bin/env bash
# Load VPS_* from .env and run scripts/redeploy-remote.sh (password via sshpass).
# Required in .env: VPS_IP, VPS_USERNAME, VPS_PASSWORD
# Optional: same overrides as redeploy-remote (DEPLOY_PATH, DEPLOY_MODE, VITE_SITE_ORIGIN, SSH_OPTS, FORCE_BUILD).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENVF="${ENV_FILE:-$ROOT/.env}"

if [[ ! -f "$ENVF" ]]; then
  echo "Missing env file: $ENVF (set ENV_FILE=... to override)" >&2
  exit 1
fi

get_env_line() {
  # Last match for KEY= (simple KEY=value files; no multiline values).
  grep -E "^${1}=" "$ENVF" 2>/dev/null | tail -n1 | cut -d= -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//;s/^"//;s/"$//;s/^'"'"'//;s/'"'"'$//'
}

VPS_IP="$(get_env_line VPS_IP)"
VPS_USERNAME="$(get_env_line VPS_USERNAME)"
VPS_PASSWORD="$(get_env_line VPS_PASSWORD)"

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
exec "$ROOT/scripts/redeploy-remote.sh"
