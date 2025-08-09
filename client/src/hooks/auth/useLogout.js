import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { queryKeys } from '../../config/queryClient';

/**
 * Logout mutation hook
 * Handles user logout and clears all cached data
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all queries from the cache
      queryClient.clear();
      
      console.log('✅ Logout successful - cache cleared');
    },
    onError: (error) => {
      console.error('❌ Logout failed:', error);
      
      // Even if logout fails, clear the cache for security
      queryClient.clear();
    },
  });
};

export default useLogout;
