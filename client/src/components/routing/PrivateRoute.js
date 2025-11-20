import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../hooks/auth';

import logger from '../../utils/logger';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  
  // Only log in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug('🔐 PrivateRoute Debug (TanStack Query):');
    logger.debug('- isAuthenticated:', isAuthenticated);
    logger.debug('- isLoading:', isLoading);
    logger.debug('- token exists:', !!token);
    logger.debug('- user:', user);
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('🚫 Not authenticated, redirecting to login');
    }
    return <Navigate to="/login" replace />;
  }
  
  if (process.env.NODE_ENV === 'development') {
    logger.debug('✅ Authenticated, showing protected content');
  }
  return children;
};

export default PrivateRoute; 