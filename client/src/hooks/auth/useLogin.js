import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { queryKeys } from '../../config/queryClient';

/**
 * Login mutation hook
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
      
      console.log('✅ Login successful:', data);
    },
    onError: (error) => {
      console.error('❌ Login failed:', error);
      
      // Clear any existing auth data on login failure
      queryClient.removeQueries({ queryKey: queryKeys.auth.all });
    },
  });
};

export default useLogin;
