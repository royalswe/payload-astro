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
RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/payload ./payload
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm --filter payload build

# --- ADD THIS DEBUG STEP ---
RUN echo "DEBUG: Listing build output directory:" && ls -R /app/payload/.next || echo "Path /app/payload/.next does not exist"
# ---------------------------

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# In a pnpm monorepo Next.js auto-detects the workspace root as outputFileTracingRoot,
# so the standalone output nests everything under the package sub-path (payload/).
# standalone/payload/server.js  ← entry point
# standalone/payload/.next/     ← server bundles (already inside standalone)
# standalone/node_modules/      ← hoisted monorepo deps (already inside standalone)

# Copy the entire standalone tree (brings node_modules + payload/ subtree).
COPY --from=builder --chown=nextjs:nodejs /app/payload/.next/standalone ./

# Static client assets must live next to server.js under the same sub-path.
COPY --from=builder --chown=nextjs:nodejs /app/payload/.next/static ./payload/.next/static

# Public directory must also sit next to server.js.
COPY --from=builder --chown=nextjs:nodejs /app/payload/public ./payload/public

RUN mkdir -p payload/.next && chown nextjs:nodejs payload/.next
RUN mkdir -p payload/public/media && chown -R nextjs:nodejs /app/payload/public
RUN mkdir -p payload/media && chown -R nextjs:nodejs /app/payload/media

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "payload/server.js"]