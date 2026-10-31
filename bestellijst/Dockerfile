# Home Assistant add-on image for Bus 2 Bestellijst.
# Supervisor build context is only this directory (bestellijst/), so the app
# is cloned from GitHub during the image build.
ARG BUILD_FROM=ghcr.io/home-assistant/amd64-base-debian:bookworm
ARG APP_REPO=https://github.com/NielsDimmen/Bestellijst.git
ARG APP_REF=main

FROM node:22-bookworm AS builder

ARG APP_REPO
ARG APP_REF

RUN apt-get update \
  && apt-get install -y --no-install-recommends git ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /src
RUN git clone --depth 1 --branch "${APP_REF}" "${APP_REPO}" /app

WORKDIR /app
RUN npm ci

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:../data/bestellijst.db"
RUN npx prisma generate && npm run build

FROM ${BUILD_FROM}

# Node runtime from the builder image (glibc / Debian-compatible)
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
