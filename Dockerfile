# Stage 1: Base image
FROM node:20-alpine AS base
# Install compatibility libraries needed by some npm packages on Alpine
RUN apk add --no-cache libc6-compat

# Stage 2: Install dependencies with cache mount for faster rebuilds
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Inject build-time environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_RECOGNITION_API_URL
ARG NEXT_PUBLIC_EMPLOYEE_API_URL
ARG NEXT_PUBLIC_WALLET_API_URL
ARG NEXT_PUBLIC_REWARDS_API_URL
ARG NEXT_PUBLIC_ANALYTICS_API_URL
ARG NEXT_PUBLIC_ORG_API_URL
ARG NEXT_PUBLIC_ROLES_API_URL
# ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
# ARG NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_RECOGNITION_API_URL=$NEXT_PUBLIC_RECOGNITION_API_URL
ENV NEXT_PUBLIC_EMPLOYEE_API_URL=$NEXT_PUBLIC_EMPLOYEE_API_URL
ENV NEXT_PUBLIC_WALLET_API_URL=$NEXT_PUBLIC_WALLET_API_URL
ENV NEXT_PUBLIC_REWARDS_API_URL=$NEXT_PUBLIC_REWARDS_API_URL
ENV NEXT_PUBLIC_ANALYTICS_API_URL=$NEXT_PUBLIC_ANALYTICS_API_URL
ENV NEXT_PUBLIC_ORG_API_URL=$NEXT_PUBLIC_ORG_API_URL
ENV NEXT_PUBLIC_ROLES_API_URL=$NEXT_PUBLIC_ROLES_API_URL
# ENV NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
# ENV NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=$NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

RUN npm run build

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only necessary build artifacts
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Lets Docker/orchestrators detect if the app is unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]