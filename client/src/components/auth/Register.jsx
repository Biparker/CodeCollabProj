import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useAuth, useRegister } from '../../hooks/auth';

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // TanStack Query mutation
  const registerMutation = useRegister();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear registration success message when component unmounts
  useEffect(() => {
    return () => {
      setRegistrationSuccess(false);
    };
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const { confirmPassword, ...registerData } = formData;
      registerMutation.mutate(registerData, {
        onSuccess: (data) => {
          setRegistrationSuccess(true);
          // If auto-login in development mode, navigate to dashboard
          if (data.token && data.user) {
            navigate('/dashboard');
          }
        },
      });
    }
  };

  if (registrationSuccess) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Registration Successful!</AlertTitle>
              We've sent a verification email to <strong>{formData.email}</strong>. 
              Please check your inbox and click the verification link to activate your account.
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              If you don't see the email, please check your spam folder. 
              You can also request a new verification email from the login page.
            </Typography>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
                size="large"
              >
                Go to Login
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Register
          </Typography>

          {registerMutation.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {registerMutation.error?.response?.data?.message || registerMutation.error.message || 'Registration failed'}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              error={!!formErrors.username}
              helperText={formErrors.username}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
              margin="normal"
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={registerMutation.isPending}
              sx={{ mt: 3 }}
            >
              {registerMutation.isPending ? 'Registering...' : 'Register'}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login">
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 