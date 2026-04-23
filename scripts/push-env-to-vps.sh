#!/usr/bin/env bash
# Copy this repo's .env to the VPS (same VPS_* vars as deploy-from-env.sh) and restart the Docker API.
# Does not print .env contents. Requires: sshpass, VPS_IP, VPS_USERNAME, VPS_PASSWORD in .env
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENVF="${ENV_FILE:-$ROOT/.env}"
REMOTE_PATH="${DEPLOY_PATH:-/var/www/buildingculture/app}/.env"

if [[ ! -f "$ENVF" ]]; then
  echo "Missing $ENVF" >&2
  exit 1
fi

get_env_line() {
  grep -E "^${1}=" "$ENVF" 2>/dev/null | tail -n1 | cut -d= -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//;s/^"//;s/"$//;s/^'"'"'//;s/'"'"'$//'
}

VPS_IP="$(get_env_line VPS_IP)"
VPS_USERNAME="$(get_env_line VPS_USERNAME)"
VPS_PASSWORD="$(get_env_line VPS_PASSWORD)"

if [[ -z "$VPS_IP" || -z "$VPS_USERNAME" || -z "$VPS_PASSWORD" ]]; then
  echo "Set VPS_IP, VPS_USERNAME, and VPS_PASSWORD in $ENVF." >&2
  exit 1
fi

if ! command -v sshpass >/dev/null 2>&1; then
  echo "Install sshpass (e.g. brew install sshpass)." >&2
  exit 1
fi

REMOTE="${VPS_USERNAME}@${VPS_IP}"
SSH_OPTS="${SSH_OPTS:-}"

export SSHPASS="$VPS_PASSWORD"
# shellcheck disable=SC2086
sshpass -e scp $SSH_OPTS -o StrictHostKeyChecking=accept-new "$ENVF" "${REMOTE}:${REMOTE_PATH}"
# shellcheck disable=SC2086
sshpass -e ssh $SSH_OPTS -o StrictHostKeyChecking=accept-new "$REMOTE" \
  "chmod 600 '${REMOTE_PATH}' && cd '$(dirname "$REMOTE_PATH")' && (docker compose up -d --force-recreate api 2>/dev/null || docker compose restart api 2>/dev/null || true)"
unset SSHPASS

echo "Uploaded .env to ${REMOTE}:${REMOTE_PATH} and recreated/restarted api (if docker compose is present)."
