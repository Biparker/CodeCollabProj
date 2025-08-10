import { useQuery } from '@tanstack/react-query';
import { projectsService } from '../../services/projectsService';
import { queryKeys } from '../../config/queryClient';

/**
 * Hook for fetching all projects with optional filters
 * @param {Object} filters - Optional filters for projects
 * @param {Object} options - Additional query options
 */
export const useProjects = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: queryKeys.projects.list(filters),
    queryFn: () => projectsService.getAll(filters),
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
};

/**
 * Hook for searching projects
 * @param {string} searchQuery - Search query string
 * @param {Object} options - Additional query options
 */
export const useProjectSearch = (searchQuery, options = {}) => {
  return useQuery({
    queryKey: queryKeys.projects.search(searchQuery),
    queryFn: () => projectsService.search(searchQuery),
    enabled: !!searchQuery && searchQuery.length > 2, // Only search if query is 3+ chars
    staleTime: 2 * 60 * 1000, // Consider fresh for 2 minutes (search results change faster)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    ...options,
  });
};

/**
 * Hook for fetching user's projects
 * @param {string} userId - User ID to fetch projects for
 * @param {Object} options - Additional query options
 */
export const useUserProjects = (userId, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.projects.all, 'user', userId],
    queryFn: () => projectsService.getUserProjects(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
};

/**
 * Hook for fetching projects by status
 * @param {string} status - Project status
 * @param {Object} options - Additional query options
 */
export const useProjectsByStatus = (status, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.projects.all, 'status', status],
    queryFn: () => projectsService.getByStatus(status),
    enabled: !!status,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    ...options,
  });
};

/**
 * Hook for fetching featured projects
 * @param {Object} options - Additional query options
 */
export const useFeaturedProjects = (options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.projects.all, 'featured'],
    queryFn: projectsService.getFeatured,
    staleTime: 10 * 60 * 1000, // Featured projects change less frequently
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    ...options,
  });
};

export default useProjects;
