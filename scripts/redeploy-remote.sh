#!/usr/bin/env bash
# Run a production redeploy on a VPS over SSH.
# Key auth: set DEPLOY_SSH=user@host (BatchMode=yes).
# Password auth: set SSHPASS and install sshpass (no BatchMode — required for password).
# Or run: scripts/deploy-from-env.sh (reads VPS_* from .env).
# Prereqs on the server: repo cloned at DEPLOY_PATH, .env present, git remote up to date, sudo for nginx/systemd if used.
set -euo pipefail

if [[ -z "${DEPLOY_SSH:-}" ]]; then
  echo "Set DEPLOY_SSH=user@host (example: DEPLOY_SSH=root@203.0.113.10 $0)" >&2
  echo "Optional: DEPLOY_PATH (default /var/www/buildingculture/app)" >&2
  echo "Optional: DEPLOY_MODE=node|docker (default: node)" >&2
  echo "Optional: VITE_SITE_ORIGIN (default https://app.buildingculture.capital)" >&2
  echo "Optional: FORCE_BUILD=1 for docker path (default 1)" >&2
  echo "Optional: SSH_OPTS e.g. SSH_OPTS='-p 2222'" >&2
  exit 1
fi

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/buildingculture/app}"
DEPLOY_MODE="${DEPLOY_MODE:-node}"
VITE_SITE_ORIGIN="${VITE_SITE_ORIGIN:-https://app.buildingculture.capital}"
FORCE_BUILD="${FORCE_BUILD:-1}"
SSH_OPTS="${SSH_OPTS:-}"

echo "→ SSH $DEPLOY_SSH  ($DEPLOY_MODE)  path=$DEPLOY_PATH"

# Here-doc cannot live inside $(...) when the body contains `;;` (macOS /bin/bash). Use a temp file.
REMOTE_TMP="$(mktemp -t redeploy-remote.XXXXXX)"
trap 'rm -f "$REMOTE_TMP"' EXIT
cat >"$REMOTE_TMP" <<'REMOTE_BODY_EOF'
set -euo pipefail
DEPLOY_PATH="$1"
DEPLOY_MODE="$2"
VITE_SITE_ORIGIN="$3"
FORCE_BUILD="$4"

cd "$DEPLOY_PATH"

if [[ ! -d .git ]]; then
  echo "Not a git repo: $DEPLOY_PATH" >&2
  exit 1
fi

git fetch origin
current_branch="$(git rev-parse --abbrev-ref HEAD)"
git pull --ff-only "origin" "$current_branch" || git pull --ff-only

export VITE_SITE_ORIGIN

case "$DEPLOY_MODE" in
  docker)
    export FORCE_BUILD
    ./scripts/docker-up.sh
    ;;
  node)
    npm ci
    unset VITE_API_URL 2>/dev/null || true
    npm run build:prod
    # Abort if Vite left an empty index (blank site when nginx→Docker bind-mounts ./dist).
    idx="dist/index.html"
    if [[ ! -s "$idx" ]]; then
      echo "Refusing deploy: $idx is missing or empty (incomplete build?)." >&2
      exit 1
    fi
    sz="$(wc -c <"$idx" | tr -d ' ')"
    if [[ "$sz" -lt 800 ]]; then
      echo "Refusing deploy: $idx is only ${sz} bytes (expected a few KB)." >&2
      exit 1
    fi
    # Host nginx proxies to Docker on 8080; web container serves bind-mounted dist/.
    if [[ -f docker-compose.yml ]] && command -v docker >/dev/null 2>&1; then
      if docker compose ps -q web 2>/dev/null | grep -q .; then
        echo "Restarting docker compose web (bind-mounted dist)…"
        docker compose restart web 2>/dev/null || true
      fi
      if docker compose ps -q api 2>/dev/null | grep -q .; then
        # API image bakes ./server at build time — restart alone never picks up git-pulled TS changes.
        echo "Rebuilding docker compose api (server + env)…"
        docker compose up -d --build api 2>/dev/null || true
      fi
    fi
    if systemctl list-unit-files --type=service 2>/dev/null | grep -q '^buildingculture-api\.service'; then
      sudo systemctl restart buildingculture-api
    else
      echo "Note: no buildingculture-api systemd unit found; if the API runs in Docker, use DEPLOY_MODE=docker or docker compose restart api." >&2
    fi
    if systemctl is-active --quiet nginx 2>/dev/null; then
      sudo nginx -t
      sudo systemctl reload nginx
    fi
    ;;
  *)
    echo "Unknown DEPLOY_MODE=$DEPLOY_MODE (use node or docker)" >&2
    exit 1
    ;;
esac

echo "Remote redeploy finished."
REMOTE_BODY_EOF

# Password auth (e.g. sshpass) cannot use BatchMode=yes — OpenSSH disables password when batch.
if [[ -n "${SSHPASS:-}" ]] && command -v sshpass >/dev/null 2>&1; then
  # shellcheck disable=SC2086
  SSHPASS="$SSHPASS" sshpass -e ssh ${SSH_OPTS} -o StrictHostKeyChecking=accept-new "$DEPLOY_SSH" \
    bash -s -- "$DEPLOY_PATH" "$DEPLOY_MODE" "$VITE_SITE_ORIGIN" "$FORCE_BUILD" <"$REMOTE_TMP"
else
  # shellcheck disable=SC2086
  ssh ${SSH_OPTS} -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$DEPLOY_SSH" \
    bash -s -- "$DEPLOY_PATH" "$DEPLOY_MODE" "$VITE_SITE_ORIGIN" "$FORCE_BUILD" <"$REMOTE_TMP"
fi

echo "Done."
