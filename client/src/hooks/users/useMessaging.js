import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/usersService';
import { queryKeys, invalidateQueries } from '../../config/queryClient';

/**
 * Messaging hooks for user communication
 */

// Get messages hook
export const useMessages = (type = 'inbox', options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.messages(type),
    queryFn: () => usersService.getMessages(type),
    staleTime: 1 * 60 * 1000, // Consider fresh for 1 minute (messages should be fairly real-time)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    ...options,
  });
};

// Get message by ID hook
export const useMessage = (messageId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.messageDetail(messageId),
    queryFn: () => usersService.getMessageById(messageId),
    enabled: !!messageId, // Only run if messageId exists
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
};

// Send message hook
export const useSendMessage = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersService.sendMessage,
    onSuccess: (data) => {
      console.log('✅ Message sent successfully:', data);
      
      // Invalidate messages to show the new sent message
      invalidateQueries.userMessages();
      
      // Call custom onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to send message:', error);
      
      // Call custom onError if provided
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

// Mark message as read hook
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersService.markMessageAsRead,
    onSuccess: (data, messageId) => {
      console.log('✅ Message marked as read:', data);
      
      // Invalidate the specific message
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.messageDetail(messageId) 
      });
      
      // Invalidate messages list to update read status
      invalidateQueries.userMessages();
    },
    onError: (error) => {
      console.error('❌ Failed to mark message as read:', error);
    },
  });
};

// Delete message hook
export const useDeleteMessage = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersService.deleteMessage,
    onSuccess: (data, messageId) => {
      console.log('✅ Message deleted successfully:', messageId);
      
      // Remove the message from cache
      queryClient.removeQueries({ 
        queryKey: queryKeys.users.messageDetail(messageId) 
      });
      
      // Invalidate messages list to remove the deleted message
      invalidateQueries.userMessages();
      
      // Call custom onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data, messageId);
      }
    },
    onError: (error) => {
      console.error('❌ Failed to delete message:', error);
      
      // Call custom onError if provided
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};
