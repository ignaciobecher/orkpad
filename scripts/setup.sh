#!/usr/bin/env bash
# ────────────────────────────────────────────────────────────────
# ORKPAD — one-command setup (humans & AI agents)
#   Local PC:   ./scripts/setup.sh
#   VPS:        ./scripts/setup.sh --domain app.tudominio.com --api api.tudominio.com
#
# Does, in order:
#   1. Checks docker + compose plugin
#   2. Creates .env from .env.example with random JWT secrets (if missing)
#   3. Builds + starts the stack (mongo, backend, frontend)
#   4. Waits until the API answers and prints the URLs
# Idempotent: safe to re-run. Never overwrites an existing .env
# (use --reset-env to regenerate it).
# ────────────────────────────────────────────────────────────────
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DOMAIN=""
API_DOMAIN=""
RESET_ENV=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="${2:?--domain needs a value}"; shift 2 ;;
    --api) API_DOMAIN="${2:?--api needs a value}"; shift 2 ;;
    --reset-env) RESET_ENV=1; shift ;;
    -h|--help)
      sed -n '2,14p' "$0"
      echo ""
      echo "Options:"
      echo "  --domain HOST   Public frontend host (VPS). Sets FRONTEND_URL=https://HOST"
      echo "  --api HOST      Public API host (VPS). Sets VITE_API_URL + API_URL=https://HOST"
      echo "  --reset-env     Regenerate .env from scratch (backs up the old one)"
      exit 0 ;;
    *) echo "Unknown option: $1 (see --help)"; exit 1 ;;
  esac
done

# ── 1. Prerequisites ────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || { echo "ERROR: docker not found. Install it: https://docs.docker.com/get-docker/"; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "ERROR: 'docker compose' plugin not found. Update Docker to a recent version."; exit 1; }

gen_secret() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -d '\n'
  elif command -v node >/dev/null 2>&1; then
    node -e "console.log(require('crypto').randomBytes(36).toString('base64'))"
  else
    head -c 48 /dev/urandom | base64 | tr -d '\n'
  fi
}

# Escape a value for use in a sed replacement with | as delimiter.
# (Top-level on purpose: bash only defines functions inside an `if`
# branch when that branch runs.)
esc() { printf '%s' "$1" | sed -e 's/[\/&|]/\\&/g'; }

# set_kv KEY VALUE FILE — replace the line or append it.
set_kv() {
  if grep -q "^$1=" "$3"; then
    sed -i "s|^$1=.*|$1=$(esc "$2")|" "$3"
  else
    printf '%s=%s\n' "$1" "$2" >> "$3"
  fi
}

# ── 2. .env ─────────────────────────────────────────────────────
if [[ -f .env && "$RESET_ENV" -eq 1 ]]; then
  cp .env ".env.bak.$(date +%s)"
  echo "Backed up existing .env, regenerating…"
  rm .env
fi

if [[ ! -f .env ]]; then
  echo "Creating .env from .env.example…"
  cp .env.example .env
  # Replace placeholder secrets with real random ones (portable sed).
  JWT1="$(gen_secret)"; JWT2="$(gen_secret)"
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(esc "$JWT1")|" .env
  sed -i "s|^JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=$(esc "$JWT2")|" .env
  echo "Generated random JWT_SECRET + JWT_REFRESH_SECRET."
else
  echo ".env already exists — leaving it untouched."
fi

# VPS mode: point URLs at the public domains (frontend is baked at build time,
# so this MUST happen before the first build).
if [[ -n "$DOMAIN" ]]; then
  set_kv FRONTEND_URL "https://$DOMAIN" .env
  API_URL_VAL="https://${API_DOMAIN:-$DOMAIN}/api"
  [[ -n "$API_DOMAIN" ]] && API_URL_VAL="https://$API_DOMAIN"
  set_kv VITE_API_URL "$API_URL_VAL" .env
  set_kv API_URL "$API_URL_VAL" .env
  # GitHub OAuth callback must match the public API origin when OAuth is used.
  if grep -q "^GITHUB_CALLBACK_URL=" .env; then
    sed -i "s|^GITHUB_CALLBACK_URL=.*|GITHUB_CALLBACK_URL=$(esc "$API_URL_VAL/auth/github/callback")|" .env
  fi
  echo "VPS mode: FRONTEND_URL=https://$DOMAIN  API=$API_URL_VAL"
fi

# ── 3. Build + start ────────────────────────────────────────────
echo "Building + starting containers (first run takes a few minutes)…"
docker compose up -d --build

# ── 4. Wait for API ─────────────────────────────────────────────
# Host port of the backend service (respects docker-compose.override.yml).
BACKEND_PORT="$(docker compose port backend 3000 2>/dev/null | awk -F: '{print $NF}')"
BACKEND_PORT="${BACKEND_PORT:-3000}"
echo "Waiting for the API on port $BACKEND_PORT (up to 3 min)…"
for i in $(seq 1 36); do
  if curl -sf "http://localhost:${BACKEND_PORT}/api" >/dev/null 2>&1; then
    echo ""
    echo "✅ Orkpad is up!"
    echo ""
    docker compose ps
    echo ""
    FRONT_PORT="$(docker compose port frontend 80 2>/dev/null | awk -F: '{print $NF}')"
    FRONT_PORT="${FRONT_PORT:-8080}"
    if [[ -n "$DOMAIN" ]]; then
      echo "   App: https://$DOMAIN  (after pointing DNS + reverse proxy, see Caddyfile.example)"
      echo "   API: $API_URL_VAL/api"
    else
      echo "   App: http://localhost:${FRONT_PORT}"
      echo "   API docs: http://localhost:${BACKEND_PORT}/api"
    fi
    echo ""
    echo "Register your account in the app — no email server needed."
    exit 0
  fi
  printf '.'
  sleep 5
done

echo ""
echo "❌ The API did not answer in time. Diagnose with:"
echo "   docker compose ps"
echo "   docker compose logs backend --tail=100"
echo "   docker compose logs mongo --tail=50"
exit 1
