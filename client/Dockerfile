ARG NODE_VERSION=24-alpine
ARG CADDY_VERSION=2.11.2-alpine

FROM node:${NODE_VERSION} AS base
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
  NPM_CONFIG_FUND=false

# =========================================
# Dev
# =========================================
FROM base AS dev

# Set environment variable to indicate development mode
ENV NODE_ENV=development

# Set the working directory inside the container
WORKDIR /app

# Copy only the dependency files first to optimize Docker caching
COPY package.json package-lock.json* ./

# Copy .npmrc for supplychain security
COPY .npmrc ./

# Install dependencies using npm with caching to speed up subsequent builds
RUN --mount=type=cache,target=/root/.npm npm install

# Copy all application source files into the container
COPY . .

# Expose the port Angular uses for the dev server (default is 4200)
EXPOSE 4200

# Start the Angular dev server and bind it to all network dto
CMD ["npm", "start", "--", "--proxy-config", "proxy.conf.docker.json", "--host=0.0.0.0"]


# =========================================
# Stage 1: Build the Angular Application
# =========================================

# Use a lightweight DHI Node.js image for building
FROM base AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json package-lock.json* ./

# Copy .npmrc for supplychain security
COPY .npmrc ./

# Install project dependencies using npm ci (ensures a clean, reproducible install)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copy the rest of the application source code into the container
COPY . .

# Build the Angular application
RUN npm run build

# =========================================
# Stage 2: Prepare caddy to Serve Static Files
# =========================================

FROM caddy:${CADDY_VERSION} AS prod
WORKDIR /app

RUN addgroup -S webuser \
  && adduser -S webuser -G webuser \
  && apk add --no-cache gettext-envsubst=0.24.1-r1


COPY --chown=webuser:webuser --from=builder /app/dist/*/browser /usr/share/caddy

RUN cat > /etc/caddy/Caddyfile <<'EOF'
:8080 {
    root * /tmp/www
    try_files {path} {path}/ /index.html
    file_server
}
EOF

RUN cat > /usr/local/bin/tori-entrypoint <<'EOF' \
  && chmod +x /usr/local/bin/tori-entrypoint
#!/bin/sh
set -eu

: "${TORI_APP_NAME:=Tori - Graph Based Entity Management}"
: "${TORI_APP_PREFIX:=/}"
: "${TORI_APP_DESCRIPTION:=Entity Management for Graph Applications using the RAMEN-Framework}"
: "${TORI_APP_FAVICON:=./favicon-default.jpg}"

rm -rf /tmp/www
mkdir -p /tmp/www
cp -R /usr/share/caddy/. /tmp/www/

envsubst '${TORI_APP_HOST} ${TORI_APP_NAME} ${TORI_APP_PREFIX} ${TORI_APP_DESCRIPTION} ${TORI_APP_FAVICON}' \
  < /usr/share/caddy/index.html \
  > /tmp/www/index.html

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
EOF

USER webuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080 || exit 1

CMD ["tori-entrypoint"]

