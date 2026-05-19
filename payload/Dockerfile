FROM node:22.22.0-alpine AS base

RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm && corepack prepare pnpm@10.28.1 --activate

WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY payload/package.json ./payload/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter payload build

# Gather build artifacts into a clean, predictable location
RUN mkdir -p /app/dist && \
    find . -path "*/.next/standalone" -type d -exec cp -r {}/. /app/dist/ \;

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 1. Copy the standalone tree
COPY --from=builder --chown=nextjs:nodejs /app/dist ./

# 2. Extract static assets from their actual monorepo-nested location
COPY --from=builder --chown=nextjs:nodejs /app/payload/.next/static ./payload/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/payload/public ./payload/public

# Setup media directories
RUN mkdir -p payload/public/media && chown -R nextjs:nodejs /app/payload/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "payload/server.js"]