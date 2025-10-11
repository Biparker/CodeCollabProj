# Railway Deployment Guide for CodeCollabProj

## Prerequisites
- Railway CLI installed (`npm install -g @railway/cli`)
- GitHub repository: `https://github.com/Biparker/CodeCollabProj.git`
- Domain: `codecollabproj`

## Deployment Steps

### 1. Login to Railway
```bash
railway login
```
This will open a browser window for authentication.

### 2. Create New Project
```bash
railway new
```
Name your project: `codecollabproj`

### 3. Link to GitHub Repository
```bash
railway link
```
Select your GitHub repository: `Biparker/CodeCollabProj`

### 4. Set Up Services

#### Backend Service
```bash
railway service create backend
railway service use backend
```

#### Frontend Service  
```bash
railway service create frontend
railway service use frontend
```

#### Database Service
```bash
railway service create database
railway service use database
```

### 5. Environment Variables

#### Backend Environment Variables
```bash
railway variables set NODE_ENV=production
railway variables set PORT=5001
railway variables set JWT_SECRET=your-secure-jwt-secret-here
railway variables set MONGODB_URI=${{database.MONGODB_URI}}
railway variables set EMAIL_USER=your-email@gmail.com
railway variables set EMAIL_PASSWORD=your-app-password
railway variables set FRONTEND_URL=https://codecollabproj.railway.app
```

#### Frontend Environment Variables
```bash
railway variables set REACT_APP_API_URL=https://codecollabproj-backend.railway.app/api
```

### 6. Deploy Services

#### Deploy Backend
```bash
railway service use backend
railway up --detach
```

#### Deploy Frontend
```bash
railway service use frontend
railway up --detach
```

#### Deploy Database
```bash
railway service use database
railway add mongodb
```

### 7. Custom Domain Setup
1. Go to Railway Dashboard
2. Select your project
3. Go to Settings > Domains
4. Add custom domain: `codecollabproj.com`
5. Configure DNS records as instructed

### 8. Health Checks
- Backend: `https://codecollabproj-backend.railway.app/health`
- Frontend: `https://codecollabproj.railway.app`

## Project Structure for Railway
```
CodeCollabProj/
├── server/                 # Backend service
├── client/                 # Frontend service  
├── railway.json           # Railway configuration
├── railway.Dockerfile     # Custom Dockerfile
└── .railway              # Railway settings
```

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://mongo:27017/codecollabproj
JWT_SECRET=your-secure-jwt-secret
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://codecollabproj.railway.app
```

### Frontend (.env)
```
REACT_APP_API_URL=https://codecollabproj-backend.railway.app/api
```

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify MONGODB_URI format
3. **CORS Issues**: Update FRONTEND_URL in backend
4. **Environment Variables**: Ensure all required vars are set

### Logs
```bash
railway logs
railway logs --service backend
railway logs --service frontend
```

### Status Check
```bash
railway status
railway service list
```
