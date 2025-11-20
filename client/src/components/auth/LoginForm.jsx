import React from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Box,
  Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Login Form Component
 * Handles the login form UI and validation
 */
const LoginForm = ({ formData, formErrors, isLoading, error, onChange, onSubmit }) => {
  const handleChange = (e) => {
    onChange({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Login
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.response?.data?.message || error.message || 'Login failed'}
        </Alert>
      )}

      <form onSubmit={onSubmit}>
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
          autoComplete="email"
          autoFocus
          aria-label="Email address"
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
          autoComplete="current-password"
          aria-label="Password"
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          size="large"
          disabled={isLoading}
          sx={{ mt: 3 }}
          aria-label="Submit login form"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2" aria-label="Forgot password">
            Forgot your password?
          </Link>
        </Typography>
        <Typography variant="body2">
          Don't have an account?{' '}
          <Link component={RouterLink} to="/register" aria-label="Register new account">
            Register here
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default LoginForm;

