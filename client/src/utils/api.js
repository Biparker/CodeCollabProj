import axios from 'axios';

// Create a simple cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Cache helper functions
const getCacheKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
};

const getCachedResponse = (cacheKey) => {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(cacheKey);
  return null;
};

const setCachedResponse = (cacheKey, data) => {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
};

// Add a request interceptor to include the auth token and implement caching
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only cache GET requests
    if (config.method === 'get') {
      const cacheKey = getCacheKey(config);
      const cachedResponse = getCachedResponse(cacheKey);
      if (cachedResponse) {
        console.log('📦 Using cached response for:', config.url);
        return Promise.resolve({
          ...cachedResponse,
          config,
          request: {},
        });
      }
    }
    
    console.log('🌐 API Request:', {
      method: config.method,
      url: config.url,
      hasToken: !!token
    });
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors and caching
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url
    });
    
    // Cache successful GET responses
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = getCacheKey(response.config);
      setCachedResponse(cacheKey, response);
    }
    
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      isNetworkError: !error.response
    });

    // Handle network errors (connection issues)
    if (!error.response) {
      console.error('🌐 Network error - server may be down');
      // Don't redirect on network errors, just log them
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Don't redirect if this is a "needs verification" error
      if (!error.response?.data?.needsVerification) {
        console.log('🔐 Unauthorized - clearing token and redirecting to login');
        localStorage.removeItem('token');
        // Use a more reliable redirect method
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }

    return Promise.reject(error);
  }
);

// Clear cache function for manual cache invalidation
export const clearApiCache = () => {
  cache.clear();
  console.log('🗑️ API cache cleared');
};

export default api; 