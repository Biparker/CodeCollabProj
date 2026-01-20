import api from '../utils/api';
import tokenEncryption from '../utils/tokenEncryption';
import { TOKEN_EXPIRATION } from '../config/constants';
import logger from '../utils/logger';
import type {
  User,
  LoginCredentials,
  RegisterData,
  LoginResponse,
  RegisterResponse,
  RefreshTokenResponse,
  CookieAuthCheckResult,
  PasswordChangeFormData,
  PasswordResetRequestResponse,
  VerifyPasswordResetTokenResponse,
  EmailVerificationResponse,
  Session,
} from '../types';

/**
 * Password change data for the API (different from form data)
 */
interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Password reset confirmation data
 */
interface PasswordResetData {
  token: string;
  password: string;
}

/**
 * Auth service interface for external use
 */
export interface AuthServiceInterface {
  // Async methods
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  login: (userData: LoginCredentials) => Promise<LoginResponse>;
  refreshToken: () => Promise<string>;
  getCurrentUser: () => Promise<User>;
  isAuthenticatedViaCookie: () => Promise<CookieAuthCheckResult>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  changePassword: (passwordData: PasswordChangeData) => Promise<{ message: string }>;
  getActiveSessions: () => Promise<Session[]>;
  resendVerificationEmail: (email: string) => Promise<EmailVerificationResponse>;
  requestPasswordReset: (email: string) => Promise<PasswordResetRequestResponse>;
  verifyPasswordResetToken: (token: string) => Promise<VerifyPasswordResetTokenResponse>;
  resetPassword: (data: PasswordResetData) => Promise<{ message: string }>;
  verifyEmail: (token: string) => Promise<EmailVerificationResponse>;
  // Sync methods (deprecated localStorage methods)
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearTokens: () => void;
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  isTokenExpired: () => boolean;
  isAuthenticated: () => boolean;
  getValidToken: () => Promise<string | null>;
  getTokenNoRefresh: () => string | null;
  getToken: () => string | null;
}

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

export const authService: AuthServiceInterface = {
  /**
   * User registration
   * Note: Backend now sets httpOnly cookies automatically on successful registration.
   * localStorage storage is deprecated but kept for backward compatibility.
   */
  register: async (userData: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/auth/register', userData);
    // Tokens are now set via httpOnly cookies by the backend
    return response.data;
  },

  /**
   * User login with dual-token system
   * Note: Backend now sets httpOnly cookies automatically on successful login.
   * localStorage storage is deprecated but kept for backward compatibility.
   */
  login: async (userData: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', userData);
    // Tokens are now set via httpOnly cookies by the backend
    return response.data;
  },

  // Refresh access token using refresh token
  refreshToken: async (): Promise<string> => {
    const refreshToken = authService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await api.post<RefreshTokenResponse>('/auth/refresh-token', {
        refreshToken,
      });

      if (response.data.accessToken) {
        // Update access token using setTokens to encrypt it
        const currentRefreshToken = authService.getRefreshToken();
        if (currentRefreshToken) {
          authService.setTokens(response.data.accessToken, currentRefreshToken);
        }
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
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  /**
   * Check if user is authenticated via httpOnly cookie
   * This is the preferred method for checking auth state during the migration.
   * It validates authentication server-side rather than relying on localStorage.
   */
  isAuthenticatedViaCookie: async (): Promise<CookieAuthCheckResult> => {
    try {
      const response = await api.get<User>('/auth/me');
      return {
        authenticated: true,
        user: response.data,
      };
    } catch (error: unknown) {
      // 401 means not authenticated, which is expected for unauthenticated users
      const axiosError = error as { response?: { status?: number }; message?: string };
      if (axiosError?.response?.status === 401) {
        return {
          authenticated: false,
          user: null,
        };
      }
      // For other errors (network, server issues), log and return not authenticated
      logger.warn('Auth check failed:', axiosError.message || 'Unknown error');
      return {
        authenticated: false,
        user: null,
      };
    }
  },

  /**
   * Enhanced logout with server-side session cleanup
   * The server clears httpOnly cookies. localStorage is cleared as fallback
   * for backward compatibility during the migration period.
   */
  logout: async (): Promise<void> => {
    try {
      // Call server logout endpoint to invalidate session and clear httpOnly cookies
      await api.post('/auth/logout');
    } catch (error: unknown) {
      const axiosError = error as { message?: string };
      logger.warn('Server logout failed:', axiosError.message || 'Unknown error');
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
  logoutAll: async (): Promise<void> => {
    try {
      await api.post('/auth/logout-all');
    } catch (error: unknown) {
      const axiosError = error as { message?: string };
      logger.warn('Server logout-all failed:', axiosError.message || 'Unknown error');
    } finally {
      // DEPRECATED: Clear localStorage tokens as fallback
      authService.clearTokens();
    }
  },

  // Change password (revokes all sessions)
  changePassword: async (passwordData: PasswordChangeData): Promise<{ message: string }> => {
    const response = await api.put<{ message: string }>('/auth/change-password', passwordData);
    // Password change revokes all sessions, so clear tokens
    authService.clearTokens();
    return response.data;
  },

  // Get active sessions
  getActiveSessions: async (): Promise<Session[]> => {
    const response = await api.get<Session[]>('/auth/sessions');
    return response.data;
  },

  // Resend verification email
  resendVerificationEmail: async (email: string): Promise<EmailVerificationResponse> => {
    const response = await api.post<EmailVerificationResponse>('/auth/resend-verification', {
      email,
    });
    return response.data;
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<PasswordResetRequestResponse> => {
    const response = await api.post<PasswordResetRequestResponse>('/auth/request-password-reset', {
      email,
    });
    return response.data;
  },

  // Verify password reset token
  verifyPasswordResetToken: async (token: string): Promise<VerifyPasswordResetTokenResponse> => {
    const response = await api.get<VerifyPasswordResetTokenResponse>(
      `/auth/verify-password-reset/${token}`
    );
    return response.data;
  },

  // Reset password
  resetPassword: async ({ token, password }: PasswordResetData): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<EmailVerificationResponse> => {
    const response = await api.get<EmailVerificationResponse>(`/auth/verify-email/${token}`);
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
  setTokens: (accessToken: string, refreshToken: string): void => {
    try {
      // Encrypt tokens before storing
      const encryptedAccessToken = tokenEncryption.encrypt(accessToken);
      const encryptedRefreshToken = tokenEncryption.encrypt(refreshToken);

      if (encryptedAccessToken && encryptedRefreshToken) {
        localStorage.setItem('accessToken', encryptedAccessToken);
        localStorage.setItem('refreshToken', encryptedRefreshToken);
      }

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
  clearTokens: (): void => {
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
  getAccessToken: (): string | null => {
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
  getRefreshToken: (): string | null => {
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
  isTokenExpired: (): boolean => {
    const expiration = localStorage.getItem('tokenExpiration');
    if (!expiration) return true;

    // Consider expired if less than threshold remaining
    return Date.now() > parseInt(expiration) - TOKEN_EXPIRATION.TOKEN_REFRESH_THRESHOLD;
  },

  /**
   * @deprecated Use isAuthenticatedViaCookie() for server-validated auth state.
   * This method checks localStorage tokens which is less secure than server validation.
   * Kept for backward compatibility during the migration period.
   */
  isAuthenticated: (): boolean => {
    const accessToken = authService.getAccessToken();
    const refreshToken = authService.getRefreshToken();
    return !!(accessToken && refreshToken);
  },

  /**
   * @deprecated Token refresh is now handled via httpOnly cookies.
   * This method is kept for backward compatibility during the migration period.
   * The api.js interceptor still uses this for Authorization header fallback.
   */
  getValidToken: async (): Promise<string | null> => {
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
  getTokenNoRefresh: (): string | null => {
    const accessToken = authService.getAccessToken();

    // Return token even if expired - let the server handle expiration
    // This reduces unnecessary API calls for non-critical requests
    return accessToken;
  },

  /**
   * @deprecated Use isAuthenticatedViaCookie() for auth state checks.
   * This is a legacy alias for getAccessToken().
   */
  getToken: (): string | null => {
    return authService.getAccessToken();
  },
};

export default authService;
