import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🌐 API Request:', {
      method: config.method || 'unknown',
      url: config.url || 'unknown',
      hasToken: !!token
    });
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response?.status || 'unknown',
      url: response?.config?.url || 'unknown'
    });
    
    return response;
  },
  (error) => {
    // Enhanced error logging with better safety checks
    const errorInfo = {
      status: error?.response?.status,
      message: error?.message || 'Unknown error',
      url: error?.config?.url,
      isNetworkError: !error?.response,
      errorType: error?.code || 'unknown'
    };
    
    console.error('❌ API Error:', errorInfo);

    // Handle network errors (connection issues)
    if (!error?.response) {
      console.error('🌐 Network error - server may be down');
      // Don't redirect on network errors, just log them
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized errors
    if (error?.response?.status === 401) {
      // Don't redirect if this is a "needs verification" error
      if (!error?.response?.data?.needsVerification) {
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

// Debug function to help troubleshoot API configuration
export const debugApiConfig = () => {
  console.log('🔍 API Debug Info:', {
    baseURL: api.defaults.baseURL,
    timeout: api.defaults.timeout,
    headers: api.defaults.headers
  });
};

export default api; 