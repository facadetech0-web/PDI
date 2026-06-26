# ============================================================
# PRE-OWNED CAR INSPECTION PLATFORM
# Multi-Stage Production Dockerfile (Next.js Standalone Mode)
# ============================================================

# Stage 1: Dependency Installation
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install dependencies based on lockfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Compilation Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Setup production environment mocks during static build phase
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJvbGUiOiJhbm9uIn0.mock-signature
ENV NEXT_PUBLIC_APP_URL=http://localhost:3000

# Build Next.js project
RUN pnpm build

# Stage 3: Lightweight Container Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage standalone output traces (reduces image size)
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
