import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '../../services/projectsService';
import { queryKeys } from '../../config/queryClient';

/**
 * Hook for joining a project
 */
export const useJoinProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.join,
    onSuccess: (updatedProject, projectId) => {
      // Update the project in the detail cache
      queryClient.setQueryData(queryKeys.projects.detail(projectId), updatedProject);

      // Update the project in any project lists
      queryClient.setQueriesData({ queryKey: queryKeys.projects.lists() }, (oldProjects) => {
        if (!oldProjects) return oldProjects;
        return oldProjects.map(project => 
          project._id === projectId ? updatedProject : project
        );
      });

      console.log('✅ Successfully joined project:', updatedProject);
    },
    onError: (error) => {
      console.error('❌ Failed to join project:', error);
    },
  });
};

/**
 * Hook for leaving a project
 */
export const useLeaveProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.leave,
    onSuccess: (updatedProject, projectId) => {
      // Update the project in the detail cache
      queryClient.setQueryData(queryKeys.projects.detail(projectId), updatedProject);

      // Update the project in any project lists
      queryClient.setQueriesData({ queryKey: queryKeys.projects.lists() }, (oldProjects) => {
        if (!oldProjects) return oldProjects;
        return oldProjects.map(project => 
          project._id === projectId ? updatedProject : project
        );
      });

      console.log('✅ Successfully left project:', updatedProject);
    },
    onError: (error) => {
      console.error('❌ Failed to leave project:', error);
    },
  });
};

/**
 * Hook for requesting collaboration on a project
 */
export const useRequestCollaboration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.requestCollaboration,
    onSuccess: (data, projectId) => {
      // Invalidate the project detail to refresh collaboration requests
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      
      console.log('✅ Collaboration request sent successfully:', data);
    },
    onError: (error) => {
      console.error('❌ Failed to send collaboration request:', error);
    },
  });
};

/**
 * Hook for handling collaboration requests (approve/reject)
 */
export const useHandleCollaborationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: projectsService.handleCollaborationRequest,
    onSuccess: (data, { projectId }) => {
      // Invalidate the project detail to refresh collaboration requests
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
      
      // Update the project in any project lists
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
      
      console.log('✅ Collaboration request handled successfully:', data);
    },
    onError: (error) => {
      console.error('❌ Failed to handle collaboration request:', error);
    },
  });
};

export default {
  useJoinProject,
  useLeaveProject,
  useRequestCollaboration,
  useHandleCollaborationRequest,
};
