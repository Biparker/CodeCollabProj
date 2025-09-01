const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const envValidator = require('./utils/envValidator');
const logger = require('./utils/logger');
const scheduledTasks = require('./utils/scheduledTasks');
const { 
  trackFailedAuth, 
  trackSuspiciousActivity, 
  trackFileUploads, 
  trackAccessViolations 
} = require('./middleware/securityMonitoring');

// Load environment variables
dotenv.config();

// Validate environment variables before starting server
try {
  envValidator.validateEnvironment();
  logger.info('Server starting with secure configuration', envValidator.getSanitizedEnvInfo());
} catch (error) {
  console.error('❌ Server startup failed:', error.message);
  process.exit(1);
}

// Create Express app
const app = express();

// Security middleware - applied first
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// CORS configuration - restrictive
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// MongoDB injection prevention
app.use(mongoSanitize());

// Security monitoring middleware
app.use(trackSuspiciousActivity);
app.use(trackFailedAuth);
app.use(trackAccessViolations);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory with security
app.use('/uploads', (req, res, next) => {
  // Security headers for uploads
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year
  next();
}, trackFileUploads, express.static('uploads'));

// Rate limiting - general (with admin exemption)
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // increased limit
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for admin routes
  skip: (req) => {
    // Skip for admin routes - they have their own protection
    return req.path.startsWith('/api/admin');
  },
  handler: (req, res) => {
    logger.rateLimitHit({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      limit: 'general'
    });
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    });
  }
});

// Admin-specific rate limiting (more permissive)
const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // 200 requests per 5 minutes for admin operations
  message: {
    error: 'Too many admin requests, please slow down.',
    retryAfter: 300 // 5 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.rateLimitHit({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      limit: 'admin'
    });
    res.status(429).json({
      error: 'Too many admin requests, please slow down.',
      retryAfter: 300
    });
  }
});

app.use(generalLimiter);

// Auth-specific rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5, // only 5 auth attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: 900 // 15 minutes in seconds
  },
  handler: (req, res) => {
    logger.rateLimitHit({
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      limit: 'auth',
      severity: 'high'
    });
    res.status(429).json({
      error: 'Too many authentication attempts from this IP, please try again later.',
      retryAfter: 900
    });
  }
});

// Apply auth rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/refresh-token', authLimiter);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/codecollab';

// Only try to connect if we're not in test mode
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(MONGODB_URI, {
    // Add MongoDB connection optimizations
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => {
      console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      console.log('Server will continue without database connection');
      // Don't exit the process, let it continue without DB
    });
} else {
  console.log('Test mode - skipping MongoDB connection');
}

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const commentRoutes = require('./routes/comments');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/comments', commentRoutes);
app.use('/api/admin', adminLimiter, adminRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CodeCollab API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Import error handling middleware
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 404 handler
app.use('*', notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Security features enabled: Helmet, CORS, Rate Limiting, MongoDB Sanitization`);
  
  // Start scheduled security tasks
  scheduledTasks.start();
  
  logger.info('Server started successfully', {
    port: PORT,
    environment: process.env.NODE_ENV,
    securityFeatures: ['helmet', 'cors', 'rate-limiting', 'mongo-sanitize', 'session-management']
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`🛑 ${signal} received, shutting down gracefully`);
  
  // Stop scheduled tasks
  scheduledTasks.stop();
  
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      logger.info('Server shutdown completed', { signal });
      process.exit(0);
    });
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason: reason?.message || reason,
    promise: promise.toString()
  });
  gracefulShutdown('UNHANDLED_REJECTION');
}); 