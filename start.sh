#!/bin/bash

echo "Starting CodeCollab with MongoDB..."

# Stop any existing containers
docker-compose down

# Remove existing volumes (optional - uncomment if you want to start fresh)
# docker-compose down -v

# Build and start all services
docker-compose up --build

echo "Application is starting..."
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:5000"
echo "MongoDB will be available at: localhost:27017" 