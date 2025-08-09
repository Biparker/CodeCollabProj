import api from '../utils/api';

/**
 * Enhanced authentication service with dual-token system
 * Handles access tokens, refresh tokens, and session management
 */

export const authService = {
  // User registration
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    
    // Handle dual-token response from registration (in development mode)
    if (response.data.accessToken && response.data.refreshToken) {
      authService.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response.data;
  },

  // User login with dual-token system
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    
    // Store both tokens securely
    if (response.data.accessToken && response.data.refreshToken) {
      authService.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    
    return response.data;
  },

  // Refresh access token using refresh token
  refreshToken: async () => {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.post('/auth/refresh-token', { refreshToken });
      
      if (response.data.accessToken) {
        // Update access token, keep the same refresh token
        localStorage.setItem('accessToken', response.data.accessToken);
        return response.data.accessToken;
      }
      
      throw new Error('Invalid refresh response');
    } catch (error) {
      // If refresh fails, clear all tokens and redirect to login
      authService.clearTokens();
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Enhanced logout with server-side session cleanup
  logout: async () => {
    try {
      // Call server logout endpoint to invalidate session
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Server logout failed:', error.message);
    } finally {
      // Always clear local tokens regardless of server response
      authService.clearTokens();
    }
  },

  // Logout from all devices
  logoutAll: async () => {
    try {
      await api.post('/auth/logout-all');
    } catch (error) {
      console.warn('Server logout-all failed:', error.message);
    } finally {
      authService.clearTokens();
    }
  },

  // Change password (revokes all sessions)
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    // Password change revokes all sessions, so clear tokens
    authService.clearTokens();
    return response.data;
  },

  // Get active sessions
  getActiveSessions: async () => {
    const response = await api.get('/auth/sessions');
    return response.data;
  },

  // Resend verification email
  resendVerificationEmail: async (email) => {
    const response = await api.post('/auth/resend-verification', { email });
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/request-password-reset', { email });
    return response.data;
  },

  // Verify password reset token
  verifyPasswordResetToken: async (token) => {
    const response = await api.get(`/auth/verify-password-reset/${token}`);
    return response.data;
  },

  // Reset password
  resetPassword: async ({ token, password }) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token) => {
    const response = await api.get(`/auth/verify-email/${token}`);
    return response.data;
  },

  // Token management functions
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Set expiration tracking for access token (15 minutes)
    const expirationTime = Date.now() + (15 * 60 * 1000);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
  },

  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
    // Remove legacy token if it exists
    localStorage.removeItem('token');
  },

  getAccessToken: () => {
    return localStorage.getItem('accessToken') || localStorage.getItem('token'); // Fallback for legacy
  },

  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  // Check if access token is expired or about to expire
  isTokenExpired: () => {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return true;
    
    // Consider expired if less than 2 minutes remaining
    return Date.now() > (parseInt(expiration) - 2 * 60 * 1000);
  },

  // Check if user is authenticated (has valid tokens)
  isAuthenticated: () => {
    const accessToken = authService.getAccessToken();
    const refreshToken = authService.getRefreshToken();
    return !!(accessToken && refreshToken);
  },

  // Get current valid token (refresh if necessary)
  getValidToken: async () => {
    const accessToken = authService.getAccessToken();
    
    if (!accessToken) {
      return null;
    }

    // Only refresh if token is expired AND we have a refresh token
    if (authService.isTokenExpired()) {
      const refreshToken = authService.getRefreshToken();
      if (!refreshToken) {
        // No refresh token available, clear invalid tokens
        authService.clearTokens();
        return null;
      }
      
      try {
        return await authService.refreshToken();
      } catch (error) {
        console.error('Token refresh failed:', error);
        authService.clearTokens(); // Clear invalid tokens
        return null;
      }
    }

    return accessToken;
  },

  // Get current token without auto-refresh (for less critical requests)
  getTokenNoRefresh: () => {
    const accessToken = authService.getAccessToken();
    
    // Return token even if expired - let the server handle expiration
    // This reduces unnecessary API calls for non-critical requests
    return accessToken;
  },

  // Legacy support - get token (for backward compatibility)
  getToken: () => {
    return authService.getAccessToken();
  },
};

export default authService;
