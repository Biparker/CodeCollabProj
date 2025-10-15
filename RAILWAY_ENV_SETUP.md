# Railway Environment Variables Setup Guide

## Problem
Railway deployment fails because environment variables (NODE_ENV, MONGODB_URI) are not set.

## Solution: Set Environment Variables in Railway

### Method 1: Via Railway Dashboard (Recommended)

1. **Go to Railway Dashboard**: https://railway.app/dashboard
2. **Select your project**: `codecollabproj`
3. **Select your service**: Backend
4. **Click on "Variables" tab**
5. **Add the following variables:**

```
NODE_ENV=production
PORT=5001
JWT_SECRET=your-super-secure-jwt-secret-change-this-now
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
FRONTEND_URL=https://your-project.railway.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10
MAX_CONCURRENT_SESSIONS=5
SESSION_TIMEOUT_MINUTES=60
```

### Method 2: Via Railway CLI

```bash
# Make sure you're linked to your project
railway link

# Select your backend service
railway service

# Set environment variables one by one
railway variables set NODE_ENV=production
railway variables set PORT=5001
railway variables set JWT_SECRET=your-super-secure-jwt-secret
railway variables set EMAIL_USER=your-email@gmail.com
railway variables set EMAIL_PASSWORD=your-app-password
railway variables set FRONTEND_URL=https://your-project.railway.app
railway variables set RATE_LIMIT_WINDOW_MS=900000
railway variables set RATE_LIMIT_MAX_REQUESTS=100
railway variables set AUTH_RATE_LIMIT_MAX=10
```

## MongoDB Setup

### Option 1: Add Railway MongoDB Plugin

1. **In Railway Dashboard** → Your Project
2. **Click "New"** → **Database** → **Add MongoDB**
3. Railway will automatically create a MongoDB instance
4. **Copy the connection string** from MongoDB service variables
5. **Add to your backend service:**
   ```
   MONGODB_URI=mongodb://mongo.railway.internal:27017/codecollabproj
   ```

### Option 2: Use Railway's MongoDB Plugin Connection

Railway provides a MongoDB plugin with automatic connection:
```
MONGODB_URI=${{MongoDB.MONGO_URL}}
```

### Option 3: External MongoDB (MongoDB Atlas)

1. Create a free cluster on https://cloud.mongodb.com
2. Get your connection string
3. Add to Railway:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecollabproj
   ```

## Complete Variable List for Backend

```bash
# Application
NODE_ENV=production
PORT=5001

# Database (choose one method)
# Method 1: Railway Internal
MONGODB_URI=mongodb://mongo.railway.internal:27017/codecollabproj

# Method 2: Railway Plugin Reference
MONGODB_URI=${{MongoDB.MONGO_URL}}

# Method 3: MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/codecollabproj

# Security
JWT_SECRET=generate-a-strong-random-secret-at-least-32-characters-long

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-specific-password

# URLs
FRONTEND_URL=https://codecollabproj.railway.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10

# Session
MAX_CONCURRENT_SESSIONS=5
SESSION_TIMEOUT_MINUTES=60
```

## Verification Steps

1. **Check if variables are set:**
   ```bash
   railway variables
   ```

2. **View deployment logs:**
   ```bash
   railway logs
   ```

3. **Look for startup messages:**
   - "Environment validation passed" ✅
   - "Connected to MongoDB" ✅
   - "Server is running on port 5001" ✅

## Common Errors and Fixes

### Error: "Cannot find module"
**Solution:** Make sure `package.json` is in the root of your service

### Error: "MONGODB_URI is not defined"
**Solution:** Add MONGODB_URI to Railway variables (see options above)

### Error: "NODE_ENV is not defined"
**Solution:** Add NODE_ENV=production to Railway variables

### Error: "Port 5001 is already in use"
**Solution:** Railway auto-assigns ports. Use:
```javascript
const PORT = process.env.PORT || 5001;
```

## Quick Setup Commands

```bash
# 1. Link to project
railway link

# 2. Add MongoDB
railway add

# 3. Set all variables at once (modify values first)
railway variables set NODE_ENV=production PORT=5001 JWT_SECRET=your-secret EMAIL_USER=your-email@gmail.com EMAIL_PASSWORD=your-password FRONTEND_URL=https://your-app.railway.app

# 4. Deploy
railway up

# 5. Check logs
railway logs
```

## Testing

Once deployed, test these endpoints:
- Health check: `https://your-backend.railway.app/health`
- API: `https://your-backend.railway.app/api`

## Important Notes

1. **Never commit .env files** to git
2. **Use strong JWT_SECRET** in production (32+ characters)
3. **Use app-specific passwords** for Gmail (not your regular password)
4. **Update FRONTEND_URL** after deploying frontend
5. **Whitelist Railway IPs** in MongoDB Atlas if using external database



