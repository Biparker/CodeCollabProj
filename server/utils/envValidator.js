const crypto = require('crypto');

/**
 * Environment variable validation and security utilities
 */
class EnvValidator {
  constructor() {
    this.requiredVars = [
      'NODE_ENV',
      'JWT_SECRET',
      'MONGODB_URI',
      'PORT'
    ];
    
    this.productionRequiredVars = [
      'EMAIL_USER',
      'EMAIL_PASSWORD',
      'FRONTEND_URL'
    ];
  }

  /**
   * Validate all required environment variables
   */
  validateEnvironment() {
    const errors = [];
    
    // Check required variables
    for (const varName of this.requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Missing required environment variable: ${varName}`);
      }
    }
    
    // Additional production checks
    if (process.env.NODE_ENV === 'production') {
      for (const varName of this.productionRequiredVars) {
        if (!process.env[varName]) {
          errors.push(`Missing required production environment variable: ${varName}`);
        }
      }
    }
    
    // Validate JWT secret strength
    if (process.env.JWT_SECRET) {
      const jwtSecretErrors = this.validateJWTSecret(process.env.JWT_SECRET);
      errors.push(...jwtSecretErrors);
    }
    
    // Validate MongoDB URI format
    if (process.env.MONGODB_URI) {
      const mongoErrors = this.validateMongoDBURI(process.env.MONGODB_URI);
      errors.push(...mongoErrors);
    }
    
    if (errors.length > 0) {
      console.error('❌ Environment validation failed:');
      errors.forEach(error => console.error(`   • ${error}`));
      throw new Error('Environment validation failed. Please check your .env file.');
    }
    
    console.log('✅ Environment validation passed');
  }

  /**
   * Validate JWT secret strength
   */
  validateJWTSecret(secret) {
    const errors = [];
    
    if (secret.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters long');
    }
    
    if (secret === 'your_jwt_secret_here' || secret === 'development_secret') {
      errors.push('JWT_SECRET must not use default/example values');
    }
    
    // Check for complexity (at least some numbers and letters)
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(secret)) {
      errors.push('JWT_SECRET should contain both letters and numbers for better security');
    }
    
    return errors;
  }

  /**
   * Validate MongoDB URI format and security
   */
  validateMongoDBURI(uri) {
    const errors = [];
    
    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      errors.push('MONGODB_URI must start with mongodb:// or mongodb+srv://');
    }
    
    // Check for default/weak passwords in production
    if (process.env.NODE_ENV === 'production') {
      if (uri.includes('password123') || uri.includes('admin:admin')) {
        errors.push('MONGODB_URI contains weak default credentials. Use strong passwords in production.');
      }
    }
    
    return errors;
  }

  /**
   * Generate a secure JWT secret
   */
  generateSecureJWTSecret() {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Generate a secure database password
   */
  generateSecurePassword(length = 32) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  /**
   * Get sanitized environment info for logging (excludes sensitive data)
   */
  getSanitizedEnvInfo() {
    return {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      hasJWTSecret: !!process.env.JWT_SECRET,
      hasMongoURI: !!process.env.MONGODB_URI,
      hasEmailConfig: !!(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD),
      frontendURL: process.env.FRONTEND_URL
    };
  }
}

module.exports = new EnvValidator();
