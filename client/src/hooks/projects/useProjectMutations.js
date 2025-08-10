import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../../services/projectsService';
import { queryKeys, invalidateQueries } from '../../config/queryClient';

/**
 * Hook for creating a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.create,
    onSuccess: (newProject) => {
      // Add the new project to the projects list cache
      queryClient.setQueryData(queryKeys.projects.list(), (oldProjects) => {
        if (!oldProjects) return [newProject];
        return [newProject, ...oldProjects];
      });

      // Invalidate all project lists to ensure consistency
      invalidateQueries.projectLists();
      
      console.log('✅ Project created successfully:', newProject);
    },
    onError: (error) => {
      console.error('❌ Failed to create project:', error);
    },
  });
};

/**
 * Hook for updating an existing project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.update,
    onMutate: async ({ projectId, projectData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(projectId) });

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(queryKeys.projects.detail(projectId));

      // Optimistically update the project
      queryClient.setQueryData(queryKeys.projects.detail(projectId), (oldProject) => ({
        ...oldProject,
        ...projectData,
      }));

      // Return a context object with the snapshotted value
      return { previousProject, projectId };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProject) {
        queryClient.setQueryData(
          queryKeys.projects.detail(context.projectId),
          context.previousProject
        );
      }
      console.error('❌ Failed to update project:', err);
    },
    onSuccess: (updatedProject, { projectId }) => {
      // Update the project in the detail cache
      queryClient.setQueryData(queryKeys.projects.detail(projectId), updatedProject);

      // Update the project in any project lists
      queryClient.setQueriesData({ queryKey: queryKeys.projects.lists() }, (oldProjects) => {
        if (!oldProjects) return oldProjects;
        return oldProjects.map(project => 
          project._id === projectId ? updatedProject : project
        );
      });

      console.log('✅ Project updated successfully:', updatedProject);
    },
    onSettled: (data, error, { projectId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    },
  });
};

/**
 * Hook for deleting a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.delete,
    onMutate: async (projectId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.projects.detail(projectId) });

      // Snapshot the previous value
      const previousProject = queryClient.getQueryData(queryKeys.projects.detail(projectId));

      // Optimistically remove the project from all lists
      queryClient.setQueriesData({ queryKey: queryKeys.projects.lists() }, (oldProjects) => {
        if (!oldProjects) return oldProjects;
        return oldProjects.filter(project => project._id !== projectId);
      });

      return { previousProject, projectId };
    },
    onError: (err, projectId, context) => {
      // If the mutation fails, add the project back to the lists
      if (context?.previousProject) {
        queryClient.setQueriesData({ queryKey: queryKeys.projects.lists() }, (oldProjects) => {
          if (!oldProjects) return [context.previousProject];
          return [context.previousProject, ...oldProjects];
        });
      }
      console.error('❌ Failed to delete project:', err);
    },
    onSuccess: (data, projectId) => {
      // Remove the project from the cache
      queryClient.removeQueries({ queryKey: queryKeys.projects.detail(projectId) });
      
      // Invalidate project lists to ensure consistency
      invalidateQueries.projectLists();
      
      console.log('✅ Project deleted successfully');
    },
  });
};

export default {
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
};
