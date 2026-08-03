# ========================================
# BUILDER STAGE
# ========================================
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

# Install with the lockfile so the build uses the exact versions that were
# tested. Copying package.json alone and running `npm install` re-resolves
# every caret range, which silently drifts dependencies between builds.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* values into the bundle at build time, so they must be
# present BEFORE `npm run build` -- setting them at runtime has no effect.
# Railway exposes service variables to Docker builds as build args.
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ARG VITE_BASE_PATH
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_BASE_PATH=$VITE_BASE_PATH

RUN npm run build

# ========================================
# PRODUCTION STAGE
# ========================================
FROM node:22-alpine AS production
WORKDIR /usr/src/app

ENV NODE_ENV=production

RUN apk add --no-cache dumb-init && rm -rf /var/cache/apk/*
RUN npm install -g serve@14

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 reactjs

# The app is served from the domain root (vite `base` defaults to "/"), so the
# build output goes straight to ./dist. `serve -s` handles SPA fallback,
# rewriting unknown paths to index.html -- no serve.json needed.
COPY --from=builder --chown=reactjs:nodejs /usr/src/app/dist ./dist

USER reactjs

# Railway injects PORT; default to 3000 for local `docker run`.
ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
