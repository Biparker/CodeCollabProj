# Backend Dockerfile for Development
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for development (includes nodemon)
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for development)
RUN npm install

# Install nodemon globally as fallback
RUN npm install -g nodemon

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 5001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1

# Start the application in development mode
CMD ["npm", "run", "dev"]

