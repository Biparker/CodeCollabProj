FROM node:18-alpine

# Add security: Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /usr/src/app

# Copy server package files
COPY server/package*.json ./

# Install dependencies
RUN npm install --only=production && npm cache clean --force

# Copy server source code
COPY server/ .

# Create necessary directories with proper permissions
RUN mkdir -p uploads logs && \
    chown -R nextjs:nodejs /usr/src/app

# Switch to non-root user for security
USER nextjs

EXPOSE 5001

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "http.get('http://localhost:5001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

CMD ["node", "index.js"]