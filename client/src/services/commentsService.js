import api from '../utils/api';

/**
 * Comments service functions
 * These functions handle all comment-related API calls
 */

export const commentsService = {
  // Get comments for a project
  getByProjectId: async (projectId) => {
    try {
      console.log('📝 CommentsService.getByProjectId called for project:', projectId);
      
      const response = await api.get(`/projects/${projectId}/comments`);
      console.log('📝 CommentsService.getByProjectId response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CommentsService.getByProjectId error:', error);
      throw error;
    }
  },

  // Note: Individual comment fetching not implemented in backend
  // Comments are fetched as part of project comments list

  // Create new comment
  create: async (commentData) => {
    try {
      console.log('📝 CommentsService.create called with data:', commentData);
      
      const { projectId, ...data } = commentData;
      const response = await api.post(`/projects/${projectId}/comments`, data);
      console.log('📝 CommentsService.create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CommentsService.create error:', error);
      throw error;
    }
  },

  // Update comment
  update: async (commentId, commentData) => {
    try {
      console.log('📝 CommentsService.update called:', { commentId, commentData });
      
      const { projectId, ...data } = commentData;
      const response = await api.put(`/projects/${projectId}/comments/${commentId}`, data);
      console.log('📝 CommentsService.update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CommentsService.update error:', error);
      throw error;
    }
  },

  // Delete comment
  delete: async (commentId, projectId) => {
    try {
      console.log('📝 CommentsService.delete called for comment:', commentId, 'project:', projectId);
      
      const response = await api.delete(`/projects/${projectId}/comments/${commentId}`);
      console.log('📝 CommentsService.delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ CommentsService.delete error:', error);
      throw error;
    }
  },

  // Note: Like/unlike and reply features would need to be implemented on the backend first
  // The backend currently only supports basic CRUD operations for comments
};