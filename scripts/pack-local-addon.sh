#!/usr/bin/env bash
# Offline fallback: pack this repository into a Home Assistant *local* add-on
# folder. Prefer the GitHub custom repository instead:
#   Settings → Add-ons → Add-on store → ⋮ → Repositories
#   → https://github.com/NielsDimmen/Bestellijst
#
# Use this only when HA cannot clone GitHub (air-gapped / no network during build).
set -euo pipefail

DEST="${1:-}"
if [[ -z "${DEST}" ]]; then
  echo "Usage: $0 /path/to/homeassistant/addons/bestellijst" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ADDON_SRC="${ROOT}/bestellijst"

mkdir -p "${DEST}"

if command -v rsync >/dev/null 2>&1; then
  rsync -a \
    --delete \
    --exclude node_modules \
    --exclude .next \
    --exclude .git \
    --exclude data \
    --exclude .env \
    --exclude .env.* \
    --exclude '!.env.example' \
    --exclude bestellijst \
    --exclude design \
    --exclude '*.tsbuildinfo' \
    --exclude .DS_Store \
    "${ROOT}/" "${DEST}/"
else
  echo "rsync not found; using tar fallback" >&2
  tar -C "${ROOT}" \
    --exclude=node_modules \
    --exclude=.next \
    --exclude=.git \
    --exclude=data \
    --exclude=.env \
    --exclude=bestellijst \
    --exclude='*.tsbuildinfo' \
    -cf - . | tar -C "${DEST}" -xf -
fi

# Overlay Home Assistant add-on metadata / entrypoint (replaces root Dockerfile).
# For local packs, rewrite Dockerfile to COPY from context instead of git clone.
cp "${ADDON_SRC}/config.yaml" "${DEST}/config.yaml"
cp "${ADDON_SRC}/build.yaml" "${DEST}/build.yaml"
cp "${ADDON_SRC}/run.sh" "${DEST}/run.sh"
cp "${ADDON_SRC}/DOCS.md" "${DEST}/DOCS.md"
cp "${ADDON_SRC}/README.md" "${DEST}/ADDON_README.md"
chmod +x "${DEST}/run.sh"

cat >"${DEST}/Dockerfile" <<'EOF'
# Local pack: app source is already in the build context (see pack-local-addon.sh).
ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base-debian:bookworm

FROM node:22-bookworm AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:../data/bestellijst.db"
RUN npx prisma generate && npm run build

FROM ${BUILD_FROM}

COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder /usr/local/bin/npx /usr/local/bin/npx
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/data/bestellijst.db"
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts/ensure-seed.mjs ./scripts/ensure-seed.mjs

COPY run.sh /run.sh
RUN chmod a+x /run.sh \
  && mkdir -p /data

EXPOSE 3000

CMD ["/run.sh"]
EOF

cat >"${DEST}/.dockerignore" <<'EOF'
node_modules
.next
.git
.gitignore
.env
.env.*
!.env.example
data
*.db
*.db-*
bestellijst
AGENTS.md
design
*.tsbuildinfo
README.md
ADDON_README.md
docker-compose.yml
docker-entrypoint.sh
.dockerignore
DOCS.md
repository.yaml
EOF

# Local pack does not need APP_REPO clone args
cat >"${DEST}/build.yaml" <<'EOF'
build_from:
  aarch64: ghcr.io/home-assistant/aarch64-base-debian:bookworm
  amd64: ghcr.io/home-assistant/amd64-base-debian:bookworm
  armv7: ghcr.io/home-assistant/armv7-base-debian:bookworm
args: {}
EOF

echo "Packed local add-on → ${DEST}"
echo "Prefer GitHub repo https://github.com/NielsDimmen/Bestellijst in the Add-on store when possible."
echo "Local: Settings → Add-ons → Add-on store → refresh → install Local add-on “Bus 2 Bestellijst”."
