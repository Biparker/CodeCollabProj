import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { queryKeys } from '../../config/queryClient';

/**
 * Register mutation hook
 * Handles user registration
 */
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      console.log('✅ Registration successful:', data);
      
      // If registration auto-logs in (development mode), update auth state
      if (data.token && data.user) {
        queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      }
    },
    onError: (error) => {
      console.error('❌ Registration failed:', error);
    },
  });
};

export default useRegister;
