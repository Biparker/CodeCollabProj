# 🔧 Environment Configuration Reference

This document provides a comprehensive reference for all environment variables used in the CodeCollabProj application.

## 📋 Quick Reference

### **Server Environment Variables (`server/.env`)**

```env
# ================================
# CORE APPLICATION SETTINGS
# ================================
NODE_ENV=development                    # Environment: development, production, test
PORT=5001                              # Server port
FRONTEND_URL=http://localhost:3000     # Frontend URL for CORS

# ================================
# DATABASE CONFIGURATION
# ================================
MONGODB_URI=mongodb://admin:password123@mongodb:27017/codecollabproj?authSource=admin

# ================================
# JWT SECURITY CONFIGURATION
# ================================
JWT_SECRET=your_64_character_secret_here                    # Primary JWT signing key
JWT_REFRESH_SECRET=your_different_64_character_secret_here  # Refresh token signing key

# ================================
# EMAIL SERVICE CONFIGURATION
# ================================
EMAIL_USER=your_email@gmail.com        # Gmail address for sending emails
EMAIL_PASSWORD=your_gmail_app_password  # Gmail App Password (16 characters)

# ================================
# RATE LIMITING & SECURITY
# ================================
RATE_LIMIT_WINDOW_MS=900000            # Rate limit window (15 minutes)
RATE_LIMIT_MAX_REQUESTS=50             # Max requests per window
AUTH_RATE_LIMIT_MAX=5                  # Max auth attempts per window

# ================================
# SESSION MANAGEMENT
# ================================
MAX_CONCURRENT_SESSIONS=3              # Max active sessions per user
SESSION_TIMEOUT_MINUTES=30             # Session timeout in minutes

# ================================
# FILE UPLOAD SECURITY
# ================================
UPLOAD_MAX_SIZE=5242880                # Max file size (5MB)
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif  # Allowed MIME types

# ================================
# LOGGING & MONITORING
# ================================
LOG_LEVEL=info                         # Log level: error, warn, info, http, verbose, debug
ENABLE_SECURITY_LOGGING=true           # Enable security event logging
```

### **Client Environment Variables (`client/.env`)**

```env
# ================================
# API CONFIGURATION
# ================================
REACT_APP_API_URL=http://localhost:5001/api  # Backend API base URL
```

---

## 📖 Detailed Variable Descriptions

### **🔐 Security Configuration**

#### **JWT_SECRET**
- **Purpose**: Primary key for signing access tokens
- **Requirements**: Minimum 32 characters, recommended 64+
- **Generation**: Use `node scripts/generateSecrets.js`
- **Security**: Never reuse across environments

#### **JWT_REFRESH_SECRET**
- **Purpose**: Key for signing refresh tokens
- **Requirements**: Must be different from JWT_SECRET
- **Security**: Longer expiry, more critical to protect

#### **MAX_CONCURRENT_SESSIONS**
- **Purpose**: Limit active sessions per user
- **Default**: 3 sessions
- **Security**: Prevents session abuse

### **📧 Email Configuration**

#### **EMAIL_USER**
- **Purpose**: Gmail address for sending system emails
- **Format**: `your_email@gmail.com`
- **Requirements**: Must have 2FA enabled

#### **EMAIL_PASSWORD**
- **Purpose**: Gmail App Password for authentication
- **Format**: 16-character app-specific password
- **Setup**: Google Account → Security → 2-Step Verification → App Passwords

### **🛡️ Rate Limiting**

#### **RATE_LIMIT_WINDOW_MS**
- **Purpose**: Time window for rate limiting
- **Default**: 900000 (15 minutes)
- **Format**: Milliseconds

#### **RATE_LIMIT_MAX_REQUESTS**
- **Purpose**: Max API requests per window
- **Default**: 50 requests
- **Scope**: Per IP address

#### **AUTH_RATE_LIMIT_MAX**
- **Purpose**: Max authentication attempts per window
- **Default**: 5 attempts
- **Scope**: Login/register endpoints

### **📁 File Upload Security**

#### **UPLOAD_MAX_SIZE**
- **Purpose**: Maximum file upload size
- **Default**: 5242880 (5MB)
- **Format**: Bytes

#### **ALLOWED_FILE_TYPES**
- **Purpose**: Restrict file types for security
- **Default**: `image/jpeg,image/png,image/gif`
- **Format**: Comma-separated MIME types

### **📊 Logging Configuration**

#### **LOG_LEVEL**
- **Purpose**: Control logging verbosity
- **Options**: `error`, `warn`, `info`, `http`, `verbose`, `debug`, `silly`
- **Default**: `info`
- **Production**: Use `warn` or `error`

#### **ENABLE_SECURITY_LOGGING**
- **Purpose**: Enable detailed security event logging
- **Default**: `true`
- **Impact**: Creates detailed audit trails

---

## 🚀 Environment Setup Scripts

### **Generate Secure Secrets**

```bash
cd server
node scripts/generateSecrets.js
```

**Output Example:**
```
🔐 Generated Secure Secrets:

JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_REFRESH_SECRET=z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4j3i2h1g0f9e8d7c6b5a4z3y2x1w0v9u8

Copy these to your server/.env file
```

### **Validate Environment**

```bash
cd server
node -e "require('./utils/envValidator').validateEnvironment(); console.log('✅ Valid')"
```

### **View Sanitized Environment Info**

```bash
cd server
node -e "console.log(require('./utils/envValidator').getSanitizedEnvInfo())"
```

---

## 🐳 Docker Environment Notes

### **Environment Files in Docker**

The Docker setup automatically uses the environment files:

- **Server**: `server/.env` → Container environment
- **Client**: `client/.env` → Build-time environment
- **Docker Compose**: Uses environment variables for service configuration

### **Docker Security Environment**

Additional environment variables are set by Docker for security:

```yaml
# In docker-compose.yml
environment:
  - NODE_ENV=development
  - TZ=UTC
  # Security: Container runs as non-root user
  - USER=nextjs
  - UID=1001
  - GID=1001
```

---

## ⚠️ Security Best Practices

### **🔒 Secret Management**

1. **Never commit real secrets to version control**
2. **Use different secrets for each environment**
3. **Rotate secrets regularly in production**
4. **Use the provided generation scripts**
5. **Store production secrets securely (vault, secrets manager)**

### **📧 Email Security**

1. **Use Gmail App Passwords, never regular passwords**
2. **Enable 2-Factor Authentication**
3. **Use dedicated email accounts for applications**
4. **Monitor email sending for abuse**

### **🛡️ Rate Limiting**

1. **Set conservative limits for production**
2. **Monitor rate limit violations**
3. **Adjust limits based on legitimate usage patterns**
4. **Use different limits for different endpoints**

### **📊 Logging Security**

1. **Never log sensitive information (passwords, tokens)**
2. **Sanitize logs before sharing**
3. **Rotate log files regularly**
4. **Monitor logs for security events**

---

## 🆘 Troubleshooting

### **Environment Validation Errors**

```bash
# Error: JWT_SECRET too short
# Solution: Generate new secret with proper length
node scripts/generateSecrets.js

# Error: Invalid MongoDB URI
# Solution: Check connection string format
MONGODB_URI=mongodb://username:password@host:port/database

# Error: Invalid email configuration
# Solution: Verify Gmail App Password setup
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=16_character_app_password
```

### **Docker Environment Issues**

```bash
# Check environment variables in container
docker-compose exec server printenv | grep -E "(JWT|MONGO|EMAIL)"

# Restart with fresh environment
docker-compose down
docker-compose up --build
```

---

For more detailed setup instructions, see `SETUP.md`.
