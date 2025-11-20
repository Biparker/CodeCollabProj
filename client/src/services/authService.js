import api from '../utils/api';
import tokenEncryption from '../utils/tokenEncryption';
import { TOKEN_EXPIRATION } from '../config/constants';
import logger from '../utils/logger';

/**
 * Enhanced authentication service with dual-token system
 * Handles access tokens, refresh tokens, and session management
 * Uses token encryption for additional security layer
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
        // Update access token using setTokens to encrypt it
        const refreshToken = authService.getRefreshToken();
        authService.setTokens(response.data.accessToken, refreshToken);
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
      logger.warn('Server logout failed:', error.message);
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
      logger.warn('Server logout-all failed:', error.message);
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

  // Token management functions with encryption
  setTokens: (accessToken, refreshToken) => {
    try {
      // Encrypt tokens before storing
      const encryptedAccessToken = tokenEncryption.encrypt(accessToken);
      const encryptedRefreshToken = tokenEncryption.encrypt(refreshToken);
      
      localStorage.setItem('accessToken', encryptedAccessToken);
      localStorage.setItem('refreshToken', encryptedRefreshToken);
      
      // Set expiration tracking for access token
      const expirationTime = Date.now() + TOKEN_EXPIRATION.ACCESS_TOKEN;
      localStorage.setItem('tokenExpiration', expirationTime.toString());
    } catch (error) {
      logger.error('Failed to encrypt tokens:', error);
      // Fallback to unencrypted storage if encryption fails
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const expirationTime = Date.now() + TOKEN_EXPIRATION.ACCESS_TOKEN;
      localStorage.setItem('tokenExpiration', expirationTime.toString());
    }
  },

  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
    // Remove legacy token if it exists
    localStorage.removeItem('token');
    // Clear encryption key
    tokenEncryption.clearKey();
  },

  getAccessToken: () => {
    try {
      const encryptedToken = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (!encryptedToken) return null;
      
      // Try to decrypt, fallback to plain if decryption fails (backward compatibility)
      const decrypted = tokenEncryption.decrypt(encryptedToken);
      return decrypted || encryptedToken; // Fallback if decryption fails
    } catch (error) {
      logger.error('Failed to decrypt access token:', error);
      // Fallback to plain token
      return localStorage.getItem('accessToken') || localStorage.getItem('token');
    }
  },

  getRefreshToken: () => {
    try {
      const encryptedToken = localStorage.getItem('refreshToken');
      if (!encryptedToken) return null;
      
      // Try to decrypt, fallback to plain if decryption fails
      const decrypted = tokenEncryption.decrypt(encryptedToken);
      return decrypted || encryptedToken; // Fallback if decryption fails
    } catch (error) {
      logger.error('Failed to decrypt refresh token:', error);
      // Fallback to plain token
      return localStorage.getItem('refreshToken');
    }
  },

  // Check if access token is expired or about to expire
  isTokenExpired: () => {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return true;
    
    // Consider expired if less than threshold remaining
    return Date.now() > (parseInt(expiration) - TOKEN_EXPIRATION.TOKEN_REFRESH_THRESHOLD);
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
        logger.error('Token refresh failed:', error);
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
