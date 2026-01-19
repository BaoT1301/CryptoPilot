# ========================================
# BASE DEPENDENCIES STAGE
# ========================================
FROM node:22-alpine AS deps
WORKDIR /usr/src/app

# Install system dependencies
RUN apk add --no-cache \
    libc6-compat \
    python3 \
    make \
    g++ \
    && ln -sf python3 /usr/bin/python

# Copy package files
COPY package.json ./

# Install ALL dependencies
RUN npm install

# ========================================
# BUILDER STAGE
# ========================================
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Copy config files first
COPY package*.json ./
COPY tsconfig.json* ./
COPY vite.config* ./
COPY tailwind.config* ./

# Set build environment
ARG VITE_BACKEND_URL

ENV NODE_ENV=production
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Copy node_modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy source code
COPY . .

RUN npm run build

# ========================================
# PRODUCTION STAGE
# ========================================
FROM node:22-alpine AS production
WORKDIR /usr/src/app

# Install runtime dependencies
RUN apk add --no-cache \
    dumb-init \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# Install serve globally
RUN npm install -g serve

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 reactjs

# Set production environment
ENV NODE_ENV=production

# Copy built application from builder stage
# Copy built application from builder stage
COPY --from=builder --chown=reactjs:nodejs /usr/src/app/dist ./dist/crypto-pilot
COPY --from=builder --chown=reactjs:nodejs /usr/src/app/package.json ./
COPY --from=builder --chown=reactjs:nodejs /usr/src/app/node_modules ./node_modules

# Create serve.json for SPA rewrites
RUN echo '{ "public": "dist", "rewrites": [ { "source": "/crypto-pilot/**", "destination": "/crypto-pilot/index.html" } ] }' > serve.json

# Security: Switch to non-root user
USER reactjs

# Expose port
EXPOSE 3000

# Use dumb-init to handle signals and reaping zombies
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["serve", "-c", "serve.json", "-l", "3000"]