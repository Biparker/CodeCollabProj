import api from '../utils/api';

/**
 * Users service functions
 * These functions handle all user-related API calls
 */

export const usersService = {
  // Get all users
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user by ID
  getById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Get current user's profile
  getMyProfile: async () => {
    const response = await api.get('/users/profile/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  // Search users
  search: async (searchParams) => {
    const params = new URLSearchParams();
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key]) {
        params.append(key, searchParams[key]);
      }
    });
    
    const response = await api.get(`/users/search?${params}`);
    return response.data;
  },

  // Get user's projects
  getUserProjects: async (userId) => {
    const response = await api.get(`/users/${userId}/projects`);
    return response.data;
  },

  // Send message to user
  sendMessage: async (messageData) => {
    const response = await api.post('/users/messages', messageData);
    return response.data;
  },

  // Get messages
  getMessages: async (type = 'inbox') => {
    const response = await api.get(`/users/messages?type=${type}`);
    return response.data;
  },

  // Mark message as read
  markMessageAsRead: async (messageId) => {
    const response = await api.put(`/users/messages/${messageId}/read`);
    return response.data;
  },

  // Get message by ID
  getMessageById: async (messageId) => {
    const response = await api.get(`/users/messages/${messageId}`);
    return response.data;
  },

  // Delete message
  deleteMessage: async (messageId) => {
    const response = await api.delete(`/users/messages/${messageId}`);
    return response.data;
  },

  // Upload profile image
  uploadProfileImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('profileImage', imageFile);

    const response = await api.post('/users/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (formData) => {
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete avatar
  deleteAvatar: async () => {
    const response = await api.delete('/users/avatar');
    return response.data;
  },

  // Get user statistics
  getUserStats: async (userId) => {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  },

  // Follow/unfollow user (if implemented)
  toggleFollow: async (userId) => {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  },

  // Get user's followers
  getFollowers: async (userId) => {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  },

  // Get users that user is following
  getFollowing: async (userId) => {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  },
};

export default usersService;
