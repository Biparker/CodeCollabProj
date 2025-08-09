import api from '../utils/api';

/**
 * Authentication service functions
 * These functions handle all auth-related API calls
 */

export const authService = {
  // User registration
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // User login
  login: async (userData) => {
    const response = await api.post('/auth/login', userData);
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    // Return a resolved promise for consistency
    return Promise.resolve();
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

  // Check if user is authenticated (has valid token)
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },
};

export default authService;
