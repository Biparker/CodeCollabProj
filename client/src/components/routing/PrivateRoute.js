import React from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../hooks/auth';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, token } = useAuth();
  
  console.log('🔐 PrivateRoute Debug (TanStack Query):');
  console.log('- isAuthenticated:', isAuthenticated);
  console.log('- isLoading:', isLoading);
  console.log('- token exists:', !!token);
  console.log('- user:', user);

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
    console.log('🚫 Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('✅ Authenticated, showing protected content');
  return children;
};

export default PrivateRoute; 