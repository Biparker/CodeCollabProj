import { QueryClient } from '@tanstack/react-query';

// Create a query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      // Cache time - how long data stays in cache when not being used (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 2 times
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus in development
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
      // Don't refetch on reconnect unless data is stale
      refetchOnReconnect: 'always',
      // Enable background refetching
      refetchInterval: false, // Can be enabled per query if needed
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
      // Global mutation error handler
      onError: (error) => {
        console.error('Mutation error:', error);
        // You can add global error handling here (toast notifications, etc.)
      },
    },
  },
});

// Global error handler for queries
queryClient.setMutationDefaults(['auth'], {
  mutationFn: async (variables) => {
    // Custom logic for auth mutations can go here
    throw new Error('Mutation function not implemented');
  },
});

// Query key factory for consistent cache keys
export const queryKeys = {
  // Auth keys
  auth: {
    all: ['auth'],
    currentUser: () => [...queryKeys.auth.all, 'currentUser'],
    passwordResetToken: (token) => [...queryKeys.auth.all, 'passwordResetToken', token],
  },
  // Projects keys
  projects: {
    all: ['projects'],
    lists: () => [...queryKeys.projects.all, 'list'],
    list: (filters = {}) => 
      [...queryKeys.projects.lists(), filters],
    details: () => [...queryKeys.projects.all, 'detail'],
    detail: (id) => [...queryKeys.projects.details(), id],
    search: (query) => [...queryKeys.projects.all, 'search', query],
  },
  // Comments keys
  comments: {
    all: ['comments'],
    lists: () => [...queryKeys.comments.all, 'list'],
    list: (projectId) => [...queryKeys.comments.lists(), projectId],
    details: () => [...queryKeys.comments.all, 'detail'],
    detail: (id) => [...queryKeys.comments.details(), id],
    replies: (commentId) => [...queryKeys.comments.all, 'replies', commentId],
  },
  // Users keys
  users: {
    all: ['users'],
    lists: () => [...queryKeys.users.all, 'list'],
    list: (filters = {}) => 
      [...queryKeys.users.lists(), filters],
    details: () => [...queryKeys.users.all, 'detail'],
    detail: (id) => [...queryKeys.users.details(), id],
    profile: () => [...queryKeys.users.all, 'profile'],
    search: (query) => [...queryKeys.users.all, 'search', query],
    projects: (userId) => [...queryKeys.users.all, 'projects', userId],
    stats: (userId) => [...queryKeys.users.all, 'stats', userId],
    followers: (userId) => [...queryKeys.users.all, 'followers', userId],
    following: (userId) => [...queryKeys.users.all, 'following', userId],
    messages: (type = 'inbox') => [...queryKeys.users.all, 'messages', type],
    messageDetail: (messageId) => [...queryKeys.users.all, 'message', messageId],
  },
};

// Cache invalidation helpers
export const invalidateQueries = {
  // Invalidate all auth-related queries
  auth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
  
  // Invalidate specific auth queries
  currentUser: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() }),
  
  // Invalidate all project-related queries
  projects: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
  
  // Invalidate project lists only
  projectLists: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() }),
  
  // Invalidate specific project
  project: (id) => queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) }),
  
  // Invalidate comments for a project
  projectComments: (projectId) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(projectId) }),
  
  // Invalidate all comment-related queries
  comments: () => queryClient.invalidateQueries({ queryKey: queryKeys.comments.all }),
  
  // Invalidate comments list for a project
  commentsList: (projectId) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(projectId) }),
  
  // Invalidate specific comment
  comment: (id) => queryClient.invalidateQueries({ queryKey: queryKeys.comments.detail(id) }),
  
  // Invalidate comment replies
  commentReplies: (commentId) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.comments.replies(commentId) }),
  
  // Invalidate all user-related queries
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
  
  // Invalidate user profile
  userProfile: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.profile() }),
};

// Prefetch helpers for better UX
export const prefetchQueries = {
  // Prefetch projects list
  projects: () => queryClient.prefetchQuery({
    queryKey: queryKeys.projects.list(),
    // Will be implemented when we create the service
    queryFn: () => Promise.resolve([]),
  }),
  
  // Prefetch user profile
  userProfile: () => queryClient.prefetchQuery({
    queryKey: queryKeys.users.profile(),
    // Will be implemented when we create the service
    queryFn: () => Promise.resolve(null),
  }),
};

export default queryClient;
