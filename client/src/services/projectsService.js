import api from '../utils/api';

/**
 * Projects service functions
 * These functions handle all project-related API calls
 */

export const projectsService = {
  // Get all projects
  getAll: async (filters = {}) => {
    try {
      console.log('📊 ProjectsService.getAll called with filters:', filters);
      
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
      
      const url = params.toString() ? `/projects?${params}` : '/projects';
      console.log('📊 Making API call to:', url);
      
      const response = await api.get(url);
      console.log('📊 ProjectsService.getAll response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ProjectsService.getAll error:', error);
      throw error;
    }
  },

  // Get project by ID
  getById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  update: async ({ projectId, projectData }) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  delete: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Search projects
  search: async (query) => {
    const response = await api.get(`/projects/search?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Join project
  join: async (projectId) => {
    const response = await api.post(`/projects/${projectId}/join`);
    return response.data;
  },

  // Leave project
  leave: async (projectId) => {
    const response = await api.post(`/projects/${projectId}/leave`);
    return response.data;
  },

  // Request collaboration
  requestCollaboration: async (projectId) => {
    const response = await api.post(`/projects/${projectId}/collaborate`);
    return response.data;
  },

  // Handle collaboration request
  handleCollaborationRequest: async ({ projectId, userId, status }) => {
    const response = await api.put(`/projects/${projectId}/collaborate/${userId}`, { status });
    return response.data;
  },

  // Get user's projects
  getUserProjects: async (userId) => {
    const response = await api.get(`/projects/user/${userId}`);
    return response.data;
  },

  // Get projects by status
  getByStatus: async (status) => {
    const response = await api.get(`/projects?status=${status}`);
    return response.data;
  },

  // Get featured projects
  getFeatured: async () => {
    const response = await api.get('/projects?featured=true');
    return response.data;
  },
};

export default projectsService;
