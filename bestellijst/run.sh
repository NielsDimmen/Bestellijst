#!/usr/bin/env bashio
# shellcheck shell=bash
set -euo pipefail

DATA_DIR="/data"
DB_PATH="${DATA_DIR}/bestellijst.db"
SECRET_FILE="${DATA_DIR}/auth_secret"

export DATABASE_URL="file:${DB_PATH}"
export NODE_ENV=production
export PORT=3000
export HOSTNAME=0.0.0.0
export NEXT_TELEMETRY_DISABLED=1

# --- AUTH_SECRET from options, or persist a generated one under /data ---
AUTH_SECRET="$(bashio::config 'auth_secret')"
if bashio::var.is_empty "${AUTH_SECRET}"; then
  if [[ -f "${SECRET_FILE}" ]]; then
    AUTH_SECRET="$(cat "${SECRET_FILE}")"
    bashio::log.info "AUTH_SECRET geladen uit /data/auth_secret"
  else
    AUTH_SECRET="$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 64)"
    umask 077
    printf '%s' "${AUTH_SECRET}" >"${SECRET_FILE}"
    bashio::log.warning "Geen auth_secret gezet — nieuwe secret opgeslagen in /data/auth_secret"
  fi
fi
export AUTH_SECRET

# --- Optional options ---
CATERING_PHONE="$(bashio::config 'catering_phone')"
if ! bashio::var.is_empty "${CATERING_PHONE}"; then
  export CATERING_PHONE
else
  unset CATERING_PHONE || true
fi

ADMIN_PASSWORD="$(bashio::config 'admin_password')"
if ! bashio::var.is_empty "${ADMIN_PASSWORD}"; then
  export ADMIN_PASSWORD
else
  unset ADMIN_PASSWORD || true
fi

bashio::log.info "Database: ${DATABASE_URL}"
cd /app

bashio::log.info "Prisma migrate deploy..."
npx prisma migrate deploy

bashio::log.info "Seed (admin/lijst indien nodig)..."
node ./scripts/ensure-seed.mjs

bashio::log.info "Start Bestellijst op 0.0.0.0:3000"
exec node server.js
