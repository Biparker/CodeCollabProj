import { useQuery } from '@tanstack/react-query';
import { projectsService } from '../../services/projectsService';
import { queryKeys } from '../../config/queryClient';

/**
 * Hook for fetching a single project by ID
 * @param {string} projectId - Project ID to fetch
 * @param {Object} options - Additional query options
 */
export const useProject = (projectId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => projectsService.getById(projectId),
    enabled: !!projectId, // Only fetch if projectId exists
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (project not found)
      if (error?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
    ...options,
  });
};

export default useProject;
