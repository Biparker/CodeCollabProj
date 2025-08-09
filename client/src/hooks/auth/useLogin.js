import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { queryKeys } from '../../config/queryClient';

/**
 * Enhanced login mutation hook with dual-token support
 * Handles user login and updates auth state
 */
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Update the current user cache with the returned user data
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
      
      // Invalidate and refetch any auth-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      
      console.log('✅ Login successful:', {
        user: data.user?.username,
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        expiresIn: data.expiresIn
      });
    },
    onError: (error) => {
      console.error('❌ Login failed:', {
        status: error?.response?.status,
        message: error?.response?.data?.message || error.message,
        needsVerification: error?.response?.data?.needsVerification
      });
      
      // Clear any existing auth data on login failure
      authService.clearTokens();
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });
};

export default useLogin;
