# === STAGE 1: Base — install dependencies ===
FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# === STAGE 2: Development (hot reload via volume mount) ===
FROM base AS development
WORKDIR /app
# Code is mounted via docker-compose volume — not copied here.
CMD ["npm", "run", "dev"]

# === STAGE 3: Production build ===
FROM base AS builder
WORKDIR /app

# Copy all source code for the build
COPY . .

# Build-time env (Next.js inlines NEXT_PUBLIC_* at build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:8000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID

ARG NEXT_PUBLIC_POSTHOG_KEY=""
ENV NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY

ARG NEXT_PUBLIC_POSTHOG_HOST="https://eu.i.posthog.com"
ENV NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST

RUN npm run build

# === STAGE 4: Production runtime (minimal image) ===
FROM node:20-alpine AS production
WORKDIR /app

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only what's needed to run. Next writes ISR/prerender cache files at
# runtime, so the non-root runtime user must own the copied build output.
COPY --chown=nextjs:nodejs --from=builder /app/public        ./public
COPY --chown=nextjs:nodejs --from=builder /app/.next         ./.next
COPY --chown=nextjs:nodejs --from=builder /app/node_modules  ./node_modules
COPY --chown=nextjs:nodejs --from=builder /app/package.json  ./package.json
COPY --chown=nextjs:nodejs --from=builder /app/next.config.ts ./next.config.ts

USER nextjs
EXPOSE 3000

ENV NODE_ENV=production
CMD ["npm", "start"]
