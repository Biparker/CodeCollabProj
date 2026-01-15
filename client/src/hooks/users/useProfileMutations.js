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
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersService.uploadAvatar,
    onSuccess: async (data) => {
      console.log('✅ Avatar upload response:', data);
      console.log('🔍 data.user exists?', !!data.user);
      console.log('🔍 data.user.profileImage:', data.user?.profileImage);
      
      // If response includes updated user, update BOTH caches immediately
      if (data.user) {
        // Update auth cache
        queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
        
        // CRITICAL: Also update the users.profile cache (used by Profile page!)
        queryClient.setQueryData(queryKeys.users.profile(), data.user);
        
        console.log('✅ Updated both auth and profile caches with new avatar:', data.user.profileImage);
        console.log('🔍 Full user object:', data.user);
        console.log('🔍 Cache keys used:', {
          auth: queryKeys.auth.currentUser(),
          profile: queryKeys.users.profile()
        });
      } else {
        console.error('❌ No user object in upload response!');
      }
      
      // Invalidate queries to force refetch and re-render
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.users.profile(),
        refetchType: 'active'
      });
      
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.auth.currentUser(),
        refetchType: 'active'
      });
    },
  });
};

// Delete avatar hook
export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: usersService.deleteAvatar,
    onSuccess: (data) => {
      console.log('✅ Avatar deleted successfully');
      
      // If response includes updated user, update both caches
      if (data && data.user) {
        queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
        queryClient.setQueryData(queryKeys.users.profile(), data.user);
        console.log('✅ Updated both caches after avatar deletion');
      }
      
      // Invalidate profile queries
      invalidateQueries.userProfile();

      // Also invalidate auth queries
      invalidateQueries.auth();
    },
  });
};
