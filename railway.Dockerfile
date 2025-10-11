# Railway deployment Dockerfile for CodeCollabProj
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY server/package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --only=production
RUN cd client && npm install --only=production

# Copy source code
COPY server/ ./
COPY client/ ./client/

# Create necessary directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application
CMD ["npm", "start"]
