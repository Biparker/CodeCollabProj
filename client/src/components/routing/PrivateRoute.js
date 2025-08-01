import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  console.log('🔐 PrivateRoute Debug:');
  console.log('- isAuthenticated:', isAuthenticated);
  console.log('- token exists:', !!token);
  console.log('- user:', user);
  console.log('- localStorage token:', localStorage.getItem('token'));

  if (!isAuthenticated) {
    console.log('🚫 Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  console.log('✅ Authenticated, showing protected content');
  return children;
};

export default PrivateRoute; 