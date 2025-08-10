import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { queryKeys } from '../../config/queryClient';

/**
 * Enhanced authentication hook with dual-token support
 * This replaces the Redux auth state management
 */
export const useAuth = () => {
  // Check authentication status once per hook execution
  const hasTokens = authService.isAuthenticated();
  
  const {
    data: user,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: authService.getCurrentUser,
    enabled: hasTokens, // Use cached check instead of function call
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (token issues)
      if (error?.response?.status === 401) return false;
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: true, // Do refetch on reconnect for session validation
    refetchInterval: false, // Disable automatic refetching
  });

  // Enhanced computed values (optimized to avoid redundant calls)
  const isAuthenticated = !!user && hasTokens;
  const accessToken = authService.getAccessToken();
  const refreshToken = authService.getRefreshToken();
  const hasValidTokens = hasTokens; // Use the cached check
  const isTokenExpired = authService.isTokenExpired();

  return {
    // User data
    user,
    isAuthenticated,
    
    // Token information
    accessToken,
    refreshToken,
    hasValidTokens,
    isTokenExpired,
    
    // Loading states
    isLoading,
    
    // Error states
    error,
    isError,
    
    // Functions
    refetch,
    logout: authService.logout,
    logoutAll: authService.logoutAll,
    clearTokens: authService.clearTokens,
    
    // Helper functions
    hasRole: (role) => user?.role === role,
    hasPermission: (permission) => user?.permissions?.includes(permission),
    isEmailVerified: user?.isEmailVerified ?? false,
    
    // Legacy support
    token: accessToken, // For backward compatibility
  };
};

export default useAuth;
