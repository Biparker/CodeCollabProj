import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import { login, resendVerificationEmail, clearNeedsVerification } from '../../store/slices/authSlice';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error, needsVerification } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear needs verification when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearNeedsVerification());
    };
  }, [dispatch]);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      dispatch(login(formData));
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (resendEmail) {
      const result = await dispatch(resendVerificationEmail(resendEmail));
      if (!result.error) {
        setResendSuccess(true);
        setShowResendForm(false);
      }
    }
  };

  if (needsVerification) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              <AlertTitle>Email Verification Required</AlertTitle>
              Please verify your email address before logging in. Check your inbox for a verification email.
            </Alert>

            {!showResendForm ? (
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  onClick={() => setShowResendForm(true)}
                  variant="outlined"
                  color="primary"
                  sx={{ mr: 2 }}
                >
                  Send Verification Email
                </Button>
                <Button
                  onClick={() => dispatch(clearNeedsVerification())}
                  variant="text"
                  color="primary"
                >
                  Back to Login
                </Button>
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Send Verification Email
                </Typography>
                <form onSubmit={handleResendVerification}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    margin="normal"
                    required
                  />
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ mr: 2 }}
                    >
                      Send Verification Email
                    </Button>
                    <Button
                      onClick={() => setShowResendForm(false)}
                      variant="text"
                      color="primary"
                    >
                      Cancel
                    </Button>
                  </Box>
                </form>
              </Box>
            )}

            {resendSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Verification email sent successfully! Please check your inbox.
              </Alert>
            )}
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
            Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot your password?
              </Link>
            </Typography>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register">
                Register here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 