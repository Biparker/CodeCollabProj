import { useQuery } from '@tanstack/react-query';
import { usersService } from '../../services/usersService';
import { queryKeys } from '../../config/queryClient';

/**
 * Hook for fetching all users
 * @param {Object} options - Additional query options
 */
export const useUsers = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.lists(),
    queryFn: usersService.getAll,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
};

/**
 * Hook for fetching a single user by ID
 * @param {string} userId - The user ID to fetch
 * @param {Object} options - Additional query options
 */
export const useUser = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => usersService.getById(userId),
    enabled: !!userId, // Only run if userId exists
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
};

/**
 * Hook for searching users
 * @param {Object} searchParams - Search parameters (query, skills, etc.)
 * @param {Object} options - Additional query options
 */
export const useUserSearch = (searchParams = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.search(searchParams),
    queryFn: () => usersService.search(searchParams),
    enabled: !!searchParams.query, // Only run if there's a search query
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    ...options,
  });
};

/**
 * Hook for fetching user's projects
 * @param {string} userId - The user ID to fetch projects for
 * @param {Object} options - Additional query options
 */
export const useUserProjects = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.projects(userId),
    queryFn: () => usersService.getUserProjects(userId),
    enabled: !!userId, // Only run if userId exists
    staleTime: 3 * 60 * 1000, // Consider fresh for 3 minutes
    gcTime: 7 * 60 * 1000, // Keep in cache for 7 minutes
    ...options,
  });
};

/**
 * Hook for fetching user statistics
 * @param {string} userId - The user ID to fetch stats for
 * @param {Object} options - Additional query options
 */
export const useUserStats = (userId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.stats(userId),
    queryFn: () => usersService.getUserStats(userId),
    enabled: !!userId, // Only run if userId exists
    staleTime: 10 * 60 * 1000, // Consider fresh for 10 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    ...options,
  });
};

/**
 * Hook for fetching current user's profile
 * @param {Object} options - Additional query options
 */
export const useMyProfile = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: usersService.getMyProfile,
    staleTime: 3 * 60 * 1000, // Consider fresh for 3 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
};
