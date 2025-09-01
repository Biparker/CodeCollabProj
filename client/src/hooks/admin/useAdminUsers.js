import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';

// Get all users with filtering
export const useAdminUsers = (params = {}) => {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.getAllUsers(params),
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get specific user details
export const useAdminUserDetails = (userId) => {
  return useQuery({
    queryKey: ['admin', 'users', userId],
    queryFn: () => adminService.getUserDetails(userId),
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
  });
};

// User management mutations
export const useAdminUserMutations = () => {
  const queryClient = useQueryClient();

  const updateUserRole = useMutation({
    mutationFn: ({ userId, roleData }) => adminService.updateUserRole(userId, roleData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch user lists
      queryClient.invalidateQueries(['admin', 'users']);
      // Update specific user cache
      queryClient.invalidateQueries(['admin', 'users', variables.userId]);
      // Update dashboard stats
      queryClient.invalidateQueries(['admin', 'dashboard']);
    },
  });

  const suspendUser = useMutation({
    mutationFn: ({ userId, suspensionData }) => adminService.suspendUser(userId, suspensionData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['admin', 'users']);
      queryClient.invalidateQueries(['admin', 'users', variables.userId]);
      queryClient.invalidateQueries(['admin', 'dashboard']);
    },
  });

  const unsuspendUser = useMutation({
    mutationFn: (userId) => adminService.unsuspendUser(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries(['admin', 'users']);
      queryClient.invalidateQueries(['admin', 'users', userId]);
      queryClient.invalidateQueries(['admin', 'dashboard']);
    },
  });

  const deleteUser = useMutation({
    mutationFn: ({ userId, permanent }) => adminService.deleteUser(userId, permanent),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users']);
      queryClient.invalidateQueries(['admin', 'dashboard']);
    },
  });

  return {
    updateUserRole,
    suspendUser,
    unsuspendUser,
    deleteUser,
  };
};

export default useAdminUsers;
