import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../services/authService';
import { queryKeys } from '../../config/queryClient';

/**
 * Hook for managing user sessions
 */
export const useSessions = () => {
  const queryClient = useQueryClient();

  // Fetch active sessions
  const {
    data: sessions,
    isLoading,
    error,
    isError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.auth.sessions(),
    queryFn: authService.getActiveSessions,
    staleTime: 30 * 1000, // Consider stale after 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: (failureCount, error) => {
      if (error?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

  // Logout from all devices mutation
  const logoutAllMutation = useMutation({
    mutationFn: authService.logoutAll,
    onSuccess: () => {
      // Clear all cache and force user to login again
      queryClient.clear();
      console.log('✅ Logged out from all devices');
    },
    onError: (error) => {
      console.error('❌ Logout all failed:', error.message);
      // Even if server logout fails, clear local tokens
      authService.clearTokens();
      queryClient.clear();
    },
  });

  return {
    // Session data
    sessions: sessions || [],
    sessionCount: sessions?.length || 0,
    
    // Loading states
    isLoading,
    
    // Error states
    error,
    isError,
    
    // Functions
    refetch,
    logoutAll: logoutAllMutation.mutate,
    isLoggingOutAll: logoutAllMutation.isPending,
    
    // Helper functions
    getCurrentSession: () => {
      // Find current session (this is a best guess based on browser info)
      return sessions?.find(session => 
        session.deviceInfo?.userAgent?.includes(navigator.userAgent.split(' ')[0])
      );
    },
    
    getOtherSessions: () => {
      const currentSession = sessions?.find(session => 
        session.deviceInfo?.userAgent?.includes(navigator.userAgent.split(' ')[0])
      );
      return sessions?.filter(session => session._id !== currentSession?._id) || [];
    },
  };
};

export default useSessions;
