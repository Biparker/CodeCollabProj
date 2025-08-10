#!/bin/bash

echo "🚀 Starting CodeCollab with MongoDB..."

# Check if setup has been run
if [ ! -f "server/.env" ] || [ ! -f "client/.env" ] || [ ! -f "docker-compose.yml" ]; then
    echo "❌ Setup not completed! Please run setup first:"
    echo "   ./setup.sh"
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove existing volumes (optional - uncomment if you want to start fresh)
# echo "🗑️  Removing volumes..."
# docker-compose down -v

# Build and start all services
echo "🔨 Building and starting all services..."
docker-compose up --build

echo "✅ Application is starting..."
echo "🌐 Frontend will be available at: http://localhost:3000"
echo "🔌 Backend API will be available at: http://localhost:5001"
echo "🗄️  MongoDB will be available at: localhost:27017" 