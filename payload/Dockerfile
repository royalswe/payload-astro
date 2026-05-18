FROM node:22.22.0-alpine AS base

RUN apk add --no-cache libc6-compat
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm && corepack prepare pnpm@10.28.1 --activate

WORKDIR /app

FROM base AS deps

# Monorepo install: lockfile lives at repo root.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY payload/package.json ./payload/package.json
COPY webui/package.json ./webui/package.json
RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/payload ./payload
COPY --from=deps /app/webui ./webui
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter payload build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/payload/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

# Next standalone output generated from payload app build.
COPY --from=builder --chown=nextjs:nodejs /app/payload/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/payload/.next/static ./.next/static

RUN mkdir -p public/media && chown -R nextjs:nodejs /app/public
RUN mkdir -p media && chown -R nextjs:nodejs /app/media

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]