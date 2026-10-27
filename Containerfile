# API image only (web is deployed on Vercel).
#   podman build --target api -t hookdrill-api .
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
