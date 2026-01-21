import api from '../utils/api';
import tokenEncryption from '../utils/tokenEncryption';
import { TOKEN_EXPIRATION } from '../config/constants';
import logger from '../utils/logger';

/**
 * Enhanced authentication service with dual-token system
 * Handles access tokens, refresh tokens, and session management
 *
 * MIGRATION NOTE (httpOnly Cookie Auth):
 * This service is transitioning from localStorage-based token storage to
 * httpOnly cookie-based authentication. During this transition:
 *
 * - Cookie-based auth: The backend now sets tokens in httpOnly cookies automatically
 *   on login/register. Use isAuthenticatedViaCookie() for server-validated auth state.
 *
 * - localStorage methods: Kept for backward compatibility during transition.
 *   These are marked as @deprecated and will be removed in a future release.
 *
 * - Dual-mode support: Both methods work simultaneously. The backend accepts
 *   tokens from either cookies or Authorization header.
 */

export const authService = {
  /**
   * User registration
   * Note: Backend now sets httpOnly cookies automatically on successful registration.
   * localStorage storage is deprecated but kept for backward compatibility.
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);

    // DEPRECATED: localStorage token storage
    // The backend now sets httpOnly cookies automatically.
    // This localStorage storage is kept only for backward compatibility
    // during the migration period and will be removed in a future release.
    if (response.data.accessToken && response.data.refreshToken) {
      authService.setTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response.data;
  },

  /**
   * User login with dual-token system
   * Note: Backend now sets httpOnly cookies automatically on successful login.
   * localStorage storage is deprecated but kept for backward compatibility.
   */
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);

    // DEPRECATED: localStorage token storage
    // The backend now sets httpOnly cookies automatically.
    // This localStorage storage is kept only for backward compatibility
    // during the migration period and will be removed in a future release.
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

  /**
   * Get current user from server
   * This endpoint validates the auth state via httpOnly cookies.
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Check if user is authenticated via httpOnly cookie
   * This is the preferred method for checking auth state during the migration.
   * It validates authentication server-side rather than relying on localStorage.
   * @returns {Promise<{authenticated: boolean, user: Object|null}>}
   */
  isAuthenticatedViaCookie: async () => {
    try {
      const response = await api.get('/auth/me');
      return {
        authenticated: true,
        user: response.data
      };
    } catch (error) {
      // 401 means not authenticated, which is expected for unauthenticated users
      if (error?.response?.status === 401) {
        return {
          authenticated: false,
          user: null
        };
      }
      // For other errors (network, server issues), log and return not authenticated
      logger.warn('Auth check failed:', error.message);
      return {
        authenticated: false,
        user: null
      };
    }
  },

  /**
   * Enhanced logout with server-side session cleanup
   * The server clears httpOnly cookies. localStorage is cleared as fallback
   * for backward compatibility during the migration period.
   */
  logout: async () => {
    try {
      // Call server logout endpoint to invalidate session and clear httpOnly cookies
      await api.post('/auth/logout');
    } catch (error) {
      logger.warn('Server logout failed:', error.message);
    } finally {
      // DEPRECATED: Clear localStorage tokens as fallback
      // This is kept for backward compatibility during the migration period
      authService.clearTokens();
    }
  },

  /**
   * Logout from all devices
   * The server clears httpOnly cookies and invalidates all sessions.
   * localStorage is cleared as fallback for backward compatibility.
   */
  logoutAll: async () => {
    try {
      await api.post('/auth/logout-all');
    } catch (error) {
      logger.warn('Server logout-all failed:', error.message);
    } finally {
      // DEPRECATED: Clear localStorage tokens as fallback
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

  // ============================================================================
  // DEPRECATED: localStorage Token Management Functions
  // ============================================================================
  // These functions are kept for backward compatibility during the migration
  // to httpOnly cookie-based authentication. They will be removed in a future
  // release. For new code, prefer using isAuthenticatedViaCookie() instead.
  // ============================================================================

  /**
   * @deprecated Use httpOnly cookies instead. The backend now sets tokens
   * automatically via Set-Cookie headers. This method is kept for backward
   * compatibility during the migration period.
   */
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

  /**
   * @deprecated This clears localStorage tokens. The backend now clears
   * httpOnly cookies on logout. This method is kept for backward compatibility
   * during the migration period.
   */
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiration');
    // Remove legacy token if it exists
    localStorage.removeItem('token');
    // Clear encryption key
    tokenEncryption.clearKey();
  },

  /**
   * @deprecated Tokens are now stored in httpOnly cookies and not accessible
   * via JavaScript. This method is kept for backward compatibility during
   * the migration period.
   */
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

  /**
   * @deprecated Tokens are now stored in httpOnly cookies and not accessible
   * via JavaScript. This method is kept for backward compatibility during
   * the migration period.
   */
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

  /**
   * @deprecated Token expiration is now handled server-side via httpOnly cookies.
   * This method is kept for backward compatibility during the migration period.
   */
  isTokenExpired: () => {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return true;

    // Consider expired if less than threshold remaining
    return Date.now() > (parseInt(expiration) - TOKEN_EXPIRATION.TOKEN_REFRESH_THRESHOLD);
  },

  /**
   * @deprecated Use isAuthenticatedViaCookie() for server-validated auth state.
   * This method checks localStorage tokens which is less secure than server validation.
   * Kept for backward compatibility during the migration period.
   */
  isAuthenticated: () => {
    const accessToken = authService.getAccessToken();
    const refreshToken = authService.getRefreshToken();
    return !!(accessToken && refreshToken);
  },

  /**
   * @deprecated Token refresh is now handled via httpOnly cookies.
   * This method is kept for backward compatibility during the migration period.
   * The api.js interceptor still uses this for Authorization header fallback.
   */
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

  /**
   * @deprecated Tokens are now stored in httpOnly cookies.
   * This method is kept for backward compatibility during the migration period.
   */
  getTokenNoRefresh: () => {
    const accessToken = authService.getAccessToken();

    // Return token even if expired - let the server handle expiration
    // This reduces unnecessary API calls for non-critical requests
    return accessToken;
  },

  /**
   * @deprecated Use isAuthenticatedViaCookie() for auth state checks.
   * This is a legacy alias for getAccessToken().
   */
  getToken: () => {
    return authService.getAccessToken();
  },
};

export default authService;
