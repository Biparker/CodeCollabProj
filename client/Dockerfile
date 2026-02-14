# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy all package files (root + client)
COPY package*.json ./
COPY client/package*.json ./client/

# Install client dependencies
RUN cd client && npm install

# Copy source
COPY client/ ./client/

ARG REACT_APP_API_URL=https://api.codecollabproj.com/api
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV GENERATE_SOURCEMAP=false

RUN cd client && npm run build

# Stage 2: Production (no devDependencies, minimal attack surface)
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve@14.2.4

# Run as non-root user
RUN addgroup -g 1001 -S appuser && adduser -S appuser -u 1001
COPY --from=builder --chown=appuser:appuser /app/client/build ./build
USER appuser

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
