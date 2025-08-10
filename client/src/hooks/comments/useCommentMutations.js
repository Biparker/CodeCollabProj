import { useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '../../services/commentsService';
import { queryKeys, invalidateQueries } from '../../config/queryClient';

/**
 * Comment mutation hooks for create, update, delete operations
 */

// Create comment hook
export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: commentsService.create,
    onSuccess: (data, variables) => {
      console.log('✅ Comment created successfully:', data);
      
      // Invalidate the comments list for the project
      if (variables.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.comments.list(variables.projectId) 
        });
      }
      
      // Invalidate all comments to be safe
      invalidateQueries.comments();
    },
    onError: (error) => {
      console.error('❌ Failed to create comment:', error);
    },
  });
};

// Update comment hook
export const useUpdateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, commentData }) => 
      commentsService.update(commentId, commentData),
    onSuccess: (data, variables) => {
      console.log('✅ Comment updated successfully:', data);
      
      // Invalidate the specific comment
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.detail(variables.commentId) 
      });
      
      // Invalidate comments list if we know the project ID
      if (data.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.comments.list(data.projectId) 
        });
      }
    },
    onError: (error) => {
      console.error('❌ Failed to update comment:', error);
    },
  });
};

// Delete comment hook
export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, projectId }) => 
      commentsService.delete(commentId, projectId),
    onSuccess: (data, variables) => {
      console.log('✅ Comment deleted successfully:', variables.commentId);
      
      // Remove the comment from the cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.comments.detail(variables.commentId) 
      });
      
      // Invalidate comments list for the project
      if (variables.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.comments.list(variables.projectId) 
        });
      }
      
      // Invalidate all comments to be safe
      invalidateQueries.comments();
    },
    onError: (error) => {
      console.error('❌ Failed to delete comment:', error);
    },
  });
};

// Toggle comment like hook
export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: commentsService.toggleLike,
    onSuccess: (data, commentId) => {
      console.log('✅ Comment like toggled successfully:', data);
      
      // Invalidate the specific comment to refresh like count
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.detail(commentId) 
      });
      
      // If we know the project ID, invalidate the comments list
      if (data.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.comments.list(data.projectId) 
        });
      }
    },
    onError: (error) => {
      console.error('❌ Failed to toggle comment like:', error);
    },
  });
};

// Reply to comment hook
export const useReplyToComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, replyData }) => 
      commentsService.reply(commentId, replyData),
    onSuccess: (data, variables) => {
      console.log('✅ Reply created successfully:', data);
      
      // Invalidate the parent comment's replies
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.replies(variables.commentId) 
      });
      
      // Invalidate the parent comment to update reply count
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.comments.detail(variables.commentId) 
      });
      
      // If we know the project ID, invalidate the comments list
      if (data.projectId) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.comments.list(data.projectId) 
        });
      }
    },
    onError: (error) => {
      console.error('❌ Failed to create reply:', error);
    },
  });
};
