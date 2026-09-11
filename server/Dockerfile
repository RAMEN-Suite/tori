# Use the official Node.js image as the base image
FROM node:24-alpine AS base
ENV NPM_CONFIG_UPDATE_NOTIFIER=false \
  NPM_CONFIG_FUND=false

# Dependencies
FROM base AS deps
# Set the working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Copy .npmrc for supplychain security
COPY .npmrc ./
# Install the production dependencies, omit the development dependencies
RUN npm ci --omit=dev
RUN npm rebuild better-sqlite3 --ignore-scripts=false

# Dev
FROM base AS dev
# Set the working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
# Copy .npmrc for supplychain security
COPY .npmrc ./
# Install the application dependencies
RUN npm install && npm rebuild better-sqlite3 --ignore-scripts=false
# Copy the rest of the application files
COPY . .

RUN echo "APP_VERSION=$(npm pkg get version)" >> ./.env
ENV NODE_ENV=development
# Expose the application port
EXPOSE 3000
# Command to run the application in development mode
CMD ["npm", "run", "start:dev"]

# --------------------------------
# Builder
FROM base AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY .npmrc ./
RUN npm ci && npm rebuild better-sqlite3 --ignore-scripts=false
COPY . .
RUN npm run build

# --------------------------------
# Production
FROM base AS prod
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup -S -g 10001 nodeapp && adduser -S -u 10001 nodeapp -G nodeapp && \
  apk upgrade --no-cache && \
  apk add --no-cache tini=0.19.0-r3

COPY --chown=nodeapp:nodeapp package.json ./
COPY --from=builder --chown=nodeapp:nodeapp /usr/src/app/dist ./dist
COPY --from=deps --chown=nodeapp:nodeapp /app/node_modules ./node_modules
COPY NOTICES.md .

RUN cat > /usr/local/bin/expand-file-secrets.sh <<'EOF' \
  && chmod 0555 /usr/local/bin/expand-file-secrets.sh \
  && echo "APP_VERSION=$(npm pkg get version)" >> ./.env
#!/bin/sh
set -eu
for _name in $(env | sed -n 's/^\([A-Za-z_][A-Za-z0-9_]*\)_FILE=.*/\1/p'); do
  eval "_path=\${${_name}_FILE}"
  _value="$(cat "$_path" 2>/dev/null || true)"
  if [ -n "$_value" ]; then
    export "${_name}=${_value}"
    unset "${_name}_FILE"
  else
    echo "expand-file-secrets: ${_name}_FILE=${_path} unreadable or empty, leaving ${_name} alone" >&2
  fi
done
unset _name _path _value

exec "$@"
EOF

USER nodeapp
EXPOSE ${PORT}

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/bin/expand-file-secrets.sh"]
CMD ["node", "dist/src/main"]
