import axios from 'axios';

// We'll import authService after it's defined to avoid circular dependency
let authService;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Track if we're currently refreshing to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Enhanced request interceptor with automatic token refresh
api.interceptors.request.use(
  async (config) => {
    // Lazy load authService to avoid circular dependency
    if (!authService) {
      const authModule = await import('../services/authService');
      authService = authModule.authService || authModule.default;
    }

    // For auth endpoints (login, register, refresh), don't add token
    const isAuthEndpoint = config.url?.includes('/auth/login') || 
                          config.url?.includes('/auth/register') || 
                          config.url?.includes('/auth/refresh-token');

    // Determine if this is a critical operation that needs fresh token
    const isCriticalOperation = config.url?.includes('/auth/') || 
                               config.url?.includes('/password') ||
                               config.url?.includes('/session') ||
                               config.method?.toLowerCase() === 'post' ||
                               config.method?.toLowerCase() === 'put' ||
                               config.method?.toLowerCase() === 'delete';

    if (!isAuthEndpoint) {
      try {
        // For most requests, use the lightweight token getter
        // Only use getValidToken() for critical operations that need guaranteed fresh tokens
        const token = isCriticalOperation 
          ? await authService.getValidToken()  // Expensive but ensures fresh token
          : authService.getTokenNoRefresh();   // Lightweight, let server handle expiration

        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn('Failed to get token:', error.message);
        // Continue with request without token
      }
    }
    
    // Only log API requests in development mode and for important operations
    if (process.env.NODE_ENV === 'development' && isCriticalOperation) {
      console.log('🌐 API Request:', {
        method: config.method?.toUpperCase() || 'unknown',
        url: config.url || 'unknown',
        hasToken: !!config.headers?.Authorization,
        isAuthEndpoint,
        isCritical: isCriticalOperation
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with automatic token refresh
api.interceptors.response.use(
  (response) => {
    // Only log successful responses for critical operations in development
    const isCriticalUrl = response?.config?.url?.includes('/auth/') || 
                         response?.config?.url?.includes('/password') ||
                         response?.config?.url?.includes('/session');
    
    if (process.env.NODE_ENV === 'development' && isCriticalUrl) {
      console.log('✅ API Response:', {
        status: response?.status || 'unknown',
        url: response?.config?.url || 'unknown'
      });
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Enhanced error logging
    const errorInfo = {
      status: error?.response?.status,
      message: error?.response?.data?.error || error?.message || 'Unknown error',
      url: error?.config?.url,
      isNetworkError: !error?.response,
      errorType: error?.code || 'unknown'
    };
    
    console.error('❌ API Error:', errorInfo);

    // Handle network errors (connection issues)
    if (!error?.response) {
      console.error('🌐 Network error - server may be down');
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors with token refresh
    if (error?.response?.status === 401 && !originalRequest._retry) {
      // Don't attempt refresh for auth endpoints or if already retrying
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      const needsVerification = error?.response?.data?.needsVerification;
      
      if (isAuthEndpoint || needsVerification) {
        // For auth endpoints or verification needed, don't retry
        if (needsVerification) {
          console.log('🔐 Email verification required');
        }
        return Promise.reject(error);
      }

      // Lazy load authService if not already loaded
      if (!authService) {
        try {
          const authModule = await import('../services/authService');
          authService = authModule.authService || authModule.default;
        } catch (importError) {
          console.error('Failed to import authService:', importError);
          return Promise.reject(error);
        }
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await authService.refreshToken();
        processQueue(null, newToken);
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        console.log('🔐 Token refresh failed - clearing tokens and redirecting to login');
        authService.clearTokens();
        
        // Redirect to login after a brief delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error?.response?.status === 403) {
      console.warn('🚫 Access forbidden - insufficient permissions');
    }

    // Handle 429 Too Many Requests
    if (error?.response?.status === 429) {
      const retryAfter = error?.response?.data?.retryAfter || 60;
      console.warn(`⏱️ Rate limited - retry after ${retryAfter} seconds`);
    }

    return Promise.reject(error);
  }
);

// Debug function to help troubleshoot API configuration
export const debugApiConfig = () => {
  console.log('🔍 API Debug Info:', {
    baseURL: api.defaults.baseURL,
    timeout: api.defaults.timeout,
    headers: api.defaults.headers
  });
};

export default api; 