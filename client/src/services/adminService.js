import api from '../utils/api';
import axios from 'axios';

// Create a custom axios instance for admin operations with longer timeout
const adminApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for admin operations
});

// Add auth token to admin requests
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors for admin API
adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token or redirect to login
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await api.post('/auth/refresh-token', { refreshToken });
          localStorage.setItem('accessToken', response.data.accessToken);
          // Retry the original request
          error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return adminApi.request(error.config);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      } else {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Admin service for managing users and system operations
 */
export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await adminApi.get('/admin/dashboard');
    return response.data;
  },

  // User Management
  getAllUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await adminApi.get(`/admin/users?${queryString}`);
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await adminApi.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateUserRole: async (userId, roleData) => {
    const response = await adminApi.put(`/admin/users/${userId}/role`, roleData);
    return response.data;
  },

  suspendUser: async (userId, suspensionData) => {
    const response = await adminApi.put(`/admin/users/${userId}/suspension`, {
      suspend: true,
      ...suspensionData
    });
    return response.data;
  },

  unsuspendUser: async (userId) => {
    const response = await adminApi.put(`/admin/users/${userId}/suspension`, {
      suspend: false
    });
    return response.data;
  },

  deleteUser: async (userId, permanent = false) => {
    const response = await adminApi.delete(`/admin/users/${userId}?permanent=${permanent}`);
    return response.data;
  },

  // System Logs
  getSystemLogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await adminApi.get(`/admin/logs?${queryString}`);
    return response.data;
  }
};

export default adminService;
