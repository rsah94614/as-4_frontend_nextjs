# Stage 1: Base image using Node 20 (matching your CI/CD tools)
FROM node:20-bookworm-slim AS base

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disabling telemetry data collection
ENV NEXT_TELEMETRY_DISABLED=1 

# ==========================================
# INJECT FRONTEND ENVIRONMENT VARIABLES HERE
# ==========================================
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_RECOGNITION_API_URL
ARG NEXT_PUBLIC_EMPLOYEE_API_URL
ARG NEXT_PUBLIC_WALLET_API_URL
ARG NEXT_PUBLIC_REWARDS_API_URL
ARG NEXT_PUBLIC_ANALYTICS_API_URL
ARG NEXT_PUBLIC_ORG_API_URL
ARG NEXT_PUBLIC_ROLES_API_URL
ARG NEXT_PUBLIC_S3_REGION
ARG NEXT_PUBLIC_S3_BUCKET


ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_RECOGNITION_API_URL=$NEXT_PUBLIC_RECOGNITION_API_URL
ENV NEXT_PUBLIC_EMPLOYEE_API_URL=$NEXT_PUBLIC_EMPLOYEE_API_URL
ENV NEXT_PUBLIC_WALLET_API_URL=$NEXT_PUBLIC_WALLET_API_URL
ENV NEXT_PUBLIC_REWARDS_API_URL=$NEXT_PUBLIC_REWARDS_API_URL
ENV NEXT_PUBLIC_ANALYTICS_API_URL=$NEXT_PUBLIC_ANALYTICS_API_URL
ENV NEXT_PUBLIC_ORG_API_URL=$NEXT_PUBLIC_ORG_API_URL
ENV NEXT_PUBLIC_ROLES_API_URL=$NEXT_PUBLIC_ROLES_API_URL
ENV NEXT_PUBLIC_S3_REGION=$NEXT_PUBLIC_S3_REGION
ENV NEXT_PUBLIC_S3_BUCKET=$NEXT_PUBLIC_S3_BUCKET
# ==========================================

RUN npm run build

# Stage 4: Production server environment
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security compliance
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from the standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

EXPOSE 3000
# The standalone build creates its own server.js
CMD ["node", "server.js"]