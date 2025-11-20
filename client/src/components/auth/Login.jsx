import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { useAuth, useLogin } from '../../hooks/auth';
import LoginForm from './LoginForm';
import VerificationAlert from './VerificationAlert';

/**
 * Login Component
 * Main login page that handles authentication flow
 */
const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // TanStack Query mutations
  const loginMutation = useLogin();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear needs verification when component unmounts
  useEffect(() => {
    return () => {
      setNeedsVerification(false);
    };
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      loginMutation.mutate(formData, {
        onSuccess: () => {
          navigate('/dashboard');
        },
        onError: (error) => {
          // Check if the error is due to unverified email
          if (error?.response?.data?.needsVerification) {
            setNeedsVerification(true);
          }
        },
      });
    }
  };

  if (needsVerification) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <VerificationAlert 
            email={formData.email} 
            onBack={() => setNeedsVerification(false)} 
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <LoginForm
          formData={formData}
          formErrors={formErrors}
          isLoading={loginMutation.isPending}
          error={loginMutation.error}
          onChange={setFormData}
          onSubmit={handleSubmit}
        />
      </Box>
    </Container>
  );
};

export default Login; 