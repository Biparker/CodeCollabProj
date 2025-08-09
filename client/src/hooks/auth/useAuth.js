import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { queryKeys } from '../../config/queryClient';

/**
 * Main authentication hook that provides current user state
 * This replaces the Redux auth state management
 */
export const useAuth = () => {
  const {
    data: user,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: !!authService.getToken(), // Only fetch if token exists
    retry: false, // Don't retry on auth failures
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
  });

  // Computed values
  const isAuthenticated = !!user && !!authService.getToken();
  const token = authService.getToken();

  return {
    // User data
    user,
    isAuthenticated,
    token,
    
    // Loading states
    isLoading,
    
    // Error states
    error,
    isError,
    
    // Functions
    refetch,
    
    // Helper functions
    hasRole: (role) => user?.role === role,
    hasPermission: (permission) => user?.permissions?.includes(permission),
    isEmailVerified: user?.isEmailVerified ?? false,
  };
};

export default useAuth;
