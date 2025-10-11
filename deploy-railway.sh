#!/bin/bash

# Railway Deployment Script for CodeCollabProj
echo "🚀 Starting Railway deployment for CodeCollabProj..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Login to Railway (interactive)
echo "🔐 Please login to Railway..."
railway login

# Create new project
echo "📦 Creating Railway project..."
railway new codecollabproj

# Link to GitHub repository
echo "🔗 Linking to GitHub repository..."
railway link

# Create services
echo "🏗️ Creating services..."

# Backend service
echo "Creating backend service..."
railway service create backend
railway service use backend

# Frontend service
echo "Creating frontend service..."
railway service create frontend
railway service use frontend

# Database service
echo "Creating database service..."
railway service create database
railway service use database
railway add mongodb

# Set environment variables for backend
echo "⚙️ Setting backend environment variables..."
railway service use backend
railway variables set NODE_ENV=production
railway variables set PORT=5001
railway variables set JWT_SECRET=your-super-secure-jwt-secret-change-this
railway variables set MONGODB_URI=\${{database.MONGODB_URI}}
railway variables set EMAIL_USER=your-email@gmail.com
railway variables set EMAIL_PASSWORD=your-app-password
railway variables set FRONTEND_URL=https://codecollabproj.railway.app

# Set environment variables for frontend
echo "⚙️ Setting frontend environment variables..."
railway service use frontend
railway variables set REACT_APP_API_URL=https://codecollabproj-backend.railway.app/api

# Deploy services
echo "🚀 Deploying services..."

# Deploy backend
echo "Deploying backend..."
railway service use backend
railway up --detach

# Deploy frontend
echo "Deploying frontend..."
railway service use frontend
railway up --detach

echo "✅ Deployment complete!"
echo "🌐 Your application will be available at:"
echo "   Frontend: https://codecollabproj.railway.app"
echo "   Backend: https://codecollabproj-backend.railway.app"
echo ""
echo "📋 Next steps:"
echo "1. Configure your custom domain in Railway dashboard"
echo "2. Update DNS records for your domain"
echo "3. Test the application endpoints"
echo ""
echo "🔧 To check logs:"
echo "   railway logs --service backend"
echo "   railway logs --service frontend"
