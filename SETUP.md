# 🛠️ CodeCollabProj Setup Instructions

This guide provides comprehensive setup instructions for the CodeCollabProj platform with enhanced security features.

## 🚀 Quick Setup (Recommended)

### 1. **Automated Setup Script**

Run the automated setup script to configure everything:

```bash
git clone https://github.com/biparker/codecollabproj.git
cd codecollabproj
chmod +x setup.sh start.sh
./setup.sh
```

This automatically:
- ✅ Copies environment configuration files
- ✅ Generates secure JWT secrets (64-character cryptographically secure)
- ✅ Sets up Docker configuration with security hardening
- ✅ Creates necessary directories (`uploads/`, `logs/`)
- ✅ Configures environment validation

### 2. **Configure Email Settings**

Edit `server/.env` and update the email configuration:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password  # Use Gmail App Password, not regular password
```

**📧 Gmail App Password Setup:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to Google Account settings → Security → 2-Step Verification
3. Generate an "App Password" for this application
4. Use that 16-character password (not your regular Gmail password)

### 3. **Start the Application**

```bash
./start.sh
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001/api
- **Health Check**: http://localhost:5001/health

---

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually or need more control:

### 1. **Clone and Setup Dependencies**

```bash
git clone https://github.com/biparker/codecollabproj.git
cd codecollabproj
npm run install-all  # Installs both client and server dependencies
```

### 2. **Environment Configuration**

```bash
# Copy environment templates
cp server/example.env server/.env
cp client/example.env client/.env
```

### 3. **Generate Secure Secrets**

```bash
cd server
node scripts/generateSecrets.js
```

This will output secure secrets you need to add to your `.env` file.

### 4. **Configure Environment Variables**

Edit `server/.env` with your values:

```env
# ================================
# CORE CONFIGURATION
# ================================
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:3000

# ================================
# DATABASE
# ================================
MONGODB_URI=mongodb://admin:password123@mongodb:27017/codecollabproj?authSource=admin

# ================================
# SECURITY - JWT TOKENS
# ================================
JWT_SECRET=your_generated_64_char_secret_here
JWT_REFRESH_SECRET=your_different_64_char_secret_here

# ================================
# EMAIL CONFIGURATION
# ================================
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# ================================
# SECURITY SETTINGS
# ================================
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX_REQUESTS=50           # 50 requests per window
AUTH_RATE_LIMIT_MAX=5                # 5 auth attempts per window
MAX_CONCURRENT_SESSIONS=3            # Max sessions per user
SESSION_TIMEOUT_MINUTES=30           # Session timeout

# ================================
# FILE UPLOAD SECURITY
# ================================
UPLOAD_MAX_SIZE=5242880              # 5MB max file size
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif

# ================================
# LOGGING & MONITORING
# ================================
LOG_LEVEL=info
ENABLE_SECURITY_LOGGING=true
```

Edit `client/.env`:

```env
REACT_APP_API_URL=http://localhost:5001/api
```

### 5. **Start Development Servers**

```bash
# Option 1: Start both client and server
npm start

# Option 2: Start separately
npm run client    # React dev server
npm run server    # Express server with nodemon
```

---

## 🐳 Docker Setup

### 1. **Quick Docker Start**

```bash
./setup.sh                    # Run setup first
docker-compose up --build     # Build and start all services
```

### 2. **Docker Service Overview**

The Docker setup includes three hardened services:

#### **🗄️ MongoDB (Database)**
- **Image**: `mongo:7.0`
- **Port**: `27017`
- **Features**: Health checks, data persistence
- **Security**: Non-root user, resource limits

#### **🔧 Server (Backend API)**
- **Build**: Custom Node.js image
- **Port**: `5001`
- **Features**: Enhanced security middleware, logging
- **Security**: Non-root user, read-only filesystem, dropped capabilities

#### **🌐 Client (Frontend)**
- **Build**: Custom React build image  
- **Port**: `3000`
- **Features**: Optimized React production build
- **Security**: Non-root user, resource limits

### 3. **Docker Commands**

```bash
# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
docker-compose logs server    # Server logs only
docker-compose logs client    # Client logs only

# Check container status
docker-compose ps

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build
```

---

## 🔒 Security Configuration

### **Environment Variable Security**

The application includes comprehensive environment validation:

```bash
# Check environment setup
cd server
node -e "require('./utils/envValidator').validateEnvironment(); console.log('✅ Environment valid')"
```

### **Required Security Variables**

| Variable | Purpose | Example |
|----------|---------|---------|
| `JWT_SECRET` | Primary token signing | 64-char random string |
| `JWT_REFRESH_SECRET` | Refresh token signing | Different 64-char string |
| `MAX_CONCURRENT_SESSIONS` | Session limit per user | `3` |
| `SESSION_TIMEOUT_MINUTES` | Auto-logout time | `30` |
| `RATE_LIMIT_MAX_REQUESTS` | API rate limiting | `50` |
| `AUTH_RATE_LIMIT_MAX` | Auth attempt limiting | `5` |

### **Security Features Active**

Once setup is complete, the following security features are active:

- ✅ **Dual-Token Authentication** (15-min access + 7-day refresh)
- ✅ **Session Management** (multi-device tracking)
- ✅ **Rate Limiting** (configurable API protection)
- ✅ **Security Monitoring** (real-time threat detection)
- ✅ **Input Sanitization** (injection prevention)
- ✅ **Audit Logging** (comprehensive security logs)

---

## 🚨 Troubleshooting

### **Common Issues**

#### **1. MongoDB Connection Issues**
```bash
# Check MongoDB is running
docker-compose logs mongodb

# Reset MongoDB data
docker-compose down
docker volume rm codecollabproj2_mongodb_data
docker-compose up --build
```

#### **2. JWT Secret Issues**
```bash
# Regenerate secrets
cd server
node scripts/generateSecrets.js
# Update .env file with new secrets
```

#### **3. Permission Issues**
```bash
# Fix Docker permissions
sudo chown -R $USER:$USER .
chmod +x setup.sh start.sh
```

#### **4. Port Conflicts**
```bash
# Check what's using ports
lsof -i :3000  # Frontend port
lsof -i :5001  # Backend port
lsof -i :27017 # MongoDB port

# Kill processes if needed
sudo kill -9 <PID>
```

#### **5. Environment Validation Errors**
```bash
# Check environment setup
cd server
node utils/envValidator.js

# Common fixes:
# - Ensure JWT_SECRET is 32+ characters
# - Verify MONGODB_URI format
# - Check EMAIL credentials
```

### **Log Analysis**

Security and application logs are available:

```bash
# View security logs
tail -f server/logs/error-$(date +%Y-%m-%d).log
tail -f server/logs/app-$(date +%Y-%m-%d).log

# Search for specific events
grep "SECURITY_EVENT" server/logs/app-*.log
grep "AUTH_FAILURE" server/logs/app-*.log
```

---

## 📚 Next Steps

After successful setup:

1. **🧪 Test the Application**
   - Register a new user account
   - Try the dual-token authentication
   - Test session management features

2. **📊 Monitor Security**
   - Check security logs for events
   - Monitor rate limiting in action
   - Review session management

3. **🛠️ Development**
   - Read `SECURITY.md` for security guidelines
   - Review the API documentation
   - Explore the authentication optimizations

4. **🚀 Deployment**
   - Configure production environment variables
   - Set up proper email service
   - Review Docker security settings

---

## 📖 Additional Resources

- **`README.md`** - Project overview and features
- **`SECURITY.md`** - Comprehensive security documentation  
- **Server logs** - `server/logs/` directory
- **API Health Check** - http://localhost:5001/health

For detailed security information and best practices, see the `SECURITY.md` file.