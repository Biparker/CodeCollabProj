declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Server Configuration
      NODE_ENV: 'development' | 'production' | 'test' | 'e2e';
      PORT?: string;
      FRONTEND_URL: string;
      SKIP_EMAIL_VERIFICATION?: string;

      // Database Configuration
      MONGODB_URI: string;

      // JWT Configuration
      JWT_SECRET: string;
      JWT_REFRESH_SECRET: string;

      // Email Configuration
      EMAIL_USER?: string;
      EMAIL_PASSWORD?: string;
      EMAIL_HOST?: string;
      EMAIL_PORT?: string;

      // Rate Limiting Configuration
      RATE_LIMIT_WINDOW_MS?: string;
      RATE_LIMIT_MAX_REQUESTS?: string;
      AUTH_RATE_LIMIT_MAX?: string;

      // Session Configuration
      MAX_CONCURRENT_SESSIONS?: string;
      SESSION_TIMEOUT_MINUTES?: string;

      // File Upload Configuration
      UPLOAD_MAX_SIZE?: string;
      ALLOWED_FILE_TYPES?: string;

      // Logging Configuration
      LOG_LEVEL?: 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
      ENABLE_SECURITY_LOGGING?: string;
    }
  }
}

export {};
