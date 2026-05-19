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

# --- DYNAMIC ASSET GATHERING ---
# 1. Create a clean destination folder
RUN mkdir -p /app/dist/payload/.next

# 2. Find where Next.js put the standalone files and copy its contents to /app/dist
RUN find . -path "*/.next/standalone" -type d -exec cp -r {}/. /app/dist/ \;

# 3. Find where Next.js put the static files and copy them to /app/dist/payload/.next/static
RUN find . -path "*/.next/static" -type d -exec cp -r {} /app/dist/payload/.next/static \;
# -------------------------------

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the completely assembled, predictable dist folder
COPY --from=builder --chown=nextjs:nodejs /app/dist ./
COPY --from=builder --chown=nextjs:nodejs /app/payload/public ./payload/public

# Setup media directories
RUN mkdir -p payload/public/media && chown -R nextjs:nodejs /app/payload/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "payload/server.js"]