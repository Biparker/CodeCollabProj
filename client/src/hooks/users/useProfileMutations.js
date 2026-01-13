import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService } from '../../services/usersService';
import { queryKeys, invalidateQueries } from '../../config/queryClient';

/**
 * User profile mutation hooks for update, image upload operations
 */

// Update profile hook
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersService.updateProfile,
    onSuccess: (data) => {
      console.log('✅ Profile updated successfully:', data);
      
      // Invalidate profile queries to refetch fresh data
      invalidateQueries.userProfile();
      
      // Also invalidate auth queries since profile data might be used there
      invalidateQueries.auth();
    },
    onError: (error) => {
      console.error('❌ Failed to update profile:', error);
    },
  });
};

// Upload profile image hook
export const useUploadProfileImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersService.uploadProfileImage,
    onSuccess: (data) => {
      console.log('✅ Profile image uploaded successfully:', data);
      
      // Invalidate profile queries
      invalidateQueries.userProfile();
      
      // Also invalidate auth queries since profile image might be used there
      invalidateQueries.auth();
    },
    onError: (error) => {
      console.error('❌ Failed to upload profile image:', error);
    },
  });
};

// Toggle follow user hook
export const useToggleFollow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: usersService.toggleFollow,
    onSuccess: (data, userId) => {
      console.log('✅ Follow status toggled successfully:', data);

      // Invalidate the specific user's data
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId)
      });

      // Invalidate followers/following lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.followers(userId)
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.following(userId)
      });

      // Invalidate current user's following list
      invalidateQueries.userProfile();
    },
    onError: (error) => {
      console.error('❌ Failed to toggle follow status:', error);
    },
  });
};

// Upload avatar hook
export const useUploadAvatar = () => {
  return useMutation({
    mutationFn: usersService.uploadAvatar,
    onSuccess: (data) => {
      console.log('✅ Avatar uploaded successfully:', data);

      // Invalidate profile queries
      invalidateQueries.userProfile();

      // Also invalidate auth queries since avatar might be used there
      invalidateQueries.auth();
    },
    onError: (error) => {
      console.error('❌ Failed to upload avatar:', error);
    },
  });
};

// Delete avatar hook
export const useDeleteAvatar = () => {
  return useMutation({
    mutationFn: usersService.deleteAvatar,
    onSuccess: (data) => {
      console.log('✅ Avatar deleted successfully:', data);

      // Invalidate profile queries
      invalidateQueries.userProfile();

      // Also invalidate auth queries
      invalidateQueries.auth();
    },
    onError: (error) => {
      console.error('❌ Failed to delete avatar:', error);
    },
  });
};
