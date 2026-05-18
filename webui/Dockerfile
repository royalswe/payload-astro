FROM node:22.22.0-alpine AS base

RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm && corepack prepare pnpm@10.28.1 --activate

WORKDIR /app

FROM base AS deps

# Install workspace dependencies with package-manifest-only copy for better layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY payload/package.json ./payload/package.json
COPY webui/package.json ./webui/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/payload ./payload
COPY --from=deps /app/webui ./webui
COPY . .

RUN pnpm --filter webui build

FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/webui ./webui

RUN chown -R astro:nodejs /app

USER astro
WORKDIR /app/webui

EXPOSE 4321
ENV HOST=0.0.0.0
ENV PORT=4321

CMD ["node", "./dist/server/entry.mjs"]
