# One Containerfile, two runtime targets: `api` and `web`.
#   podman build --target api -t hookdrill-api .
#   podman build --target web --build-arg VITE_API_URL=https://api.hookdrill.yappers.online -t hookdrill-web .
FROM docker.io/library/node:24-slim AS base
RUN npm install -g pnpm@12.11.2
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/challenges/package.json packages/challenges/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile

FROM deps AS source
COPY . .

# api also carries drizzle-kit/tsx, so the same image runs migrations and challenge sync.
FROM source AS api
ENV NODE_ENV=production
EXPOSE 3001
CMD ["pnpm", "--filter", "@hookdrill/api", "start"]

FROM source AS build-web
# VITE_* is inlined at build time.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @hookdrill/web build

# The TanStack Start server bundle is a fetch handler with externalized deps, so keep node_modules.
FROM source AS web
ENV NODE_ENV=production
RUN npm install -g srvx@1.0.8
COPY --from=build-web /app/apps/web/dist /app/apps/web/dist
WORKDIR /app/apps/web
EXPOSE 3000
CMD ["srvx", "--prod", "--port", "3000", "-s", "../client", "dist/server/server.js"]
