import { QueryClient } from '@tanstack/react-query';
import { QUERY_CONFIG } from './constants';
import logger from '../utils/logger';

// Create a query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: QUERY_CONFIG.STALE_TIME,
      // Cache time - how long data stays in cache when not being used
      gcTime: QUERY_CONFIG.CACHE_TIME,
      // Retry failed requests
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to MAX_RETRIES times for other errors
        return failureCount < QUERY_CONFIG.MAX_RETRIES;
      },
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(
        QUERY_CONFIG.RETRY_DELAY_BASE * 2 ** attemptIndex, 
        QUERY_CONFIG.RETRY_DELAY_MAX
      ),
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
      retryDelay: QUERY_CONFIG.RETRY_DELAY_BASE,
      // Global mutation error handler
      onError: (error) => {
        logger.error('Mutation error:', error);
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
    sessions: () => [...queryKeys.auth.all, 'sessions'],
    tokenRefresh: () => [...queryKeys.auth.all, 'tokenRefresh'],
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
  
  // Invalidate all user messages
  userMessages: () => queryClient.invalidateQueries({ queryKey: [...queryKeys.users.all, 'messages'] }),
  
  // Invalidate specific message type (inbox/sent)
  userMessagesByType: (type) => queryClient.invalidateQueries({ queryKey: queryKeys.users.messages(type) }),
  
  // Invalidate specific message
  userMessage: (messageId) => queryClient.invalidateQueries({ queryKey: queryKeys.users.messageDetail(messageId) }),
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
