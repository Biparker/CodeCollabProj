import { useQuery } from '@tanstack/react-query';
import { commentsService } from '../../services/commentsService';
import { queryKeys } from '../../config/queryClient';

/**
 * Hook for fetching comments for a specific project
 * @param {string} projectId - The project ID to fetch comments for
 * @param {Object} options - Additional query options
 */
export const useComments = (projectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.comments.list(projectId),
    queryFn: () => commentsService.getByProjectId(projectId),
    enabled: !!projectId, // Only run if projectId exists
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    ...options,
  });
};

/**
 * Hook for fetching a single comment by ID
 * @param {string} commentId - The comment ID to fetch
 * @param {Object} options - Additional query options
 */
export const useComment = (commentId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.comments.detail(commentId),
    queryFn: () => commentsService.getById(commentId),
    enabled: !!commentId, // Only run if commentId exists
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
};

/**
 * Hook for fetching replies for a specific comment
 * @param {string} commentId - The comment ID to fetch replies for
 * @param {Object} options - Additional query options
 */
export const useCommentReplies = (commentId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.comments.replies(commentId),
    queryFn: () => commentsService.getReplies(commentId),
    enabled: !!commentId, // Only run if commentId exists
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    ...options,
  });
};
