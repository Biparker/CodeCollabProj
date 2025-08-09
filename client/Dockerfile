FROM node:18-alpine

# Add security: Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies with security optimizations
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Set default environment variables for React
ENV REACT_APP_API_URL=http://localhost:5001/api
ENV WATCHPACK_POLLING=true
ENV FAST_REFRESH=true
ENV CHOKIDAR_USEPOLLING=true

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /usr/src/app

# Switch to non-root user for security
USER nextjs

EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"] 