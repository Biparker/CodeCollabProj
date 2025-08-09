import React, { useState } from 'react';
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
import { useRequestPasswordReset } from '../../hooks/auth';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const requestPasswordResetMutation = useRequestPasswordReset();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordResetData, setPasswordResetData] = useState(null);

  const validateEmail = () => {
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateEmail()) {
      requestPasswordResetMutation.mutate(email, {
        onSuccess: (data) => {
          console.log('✅ Password reset requested successfully:', data);
          setPasswordResetData(data);
        },
        onError: (error) => {
          console.error('❌ Password reset request failed:', error);
        },
      });
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  if (passwordResetData) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              <AlertTitle>Password Reset Link Generated</AlertTitle>
              {process.env.NODE_ENV === 'development' ? (
                <>
                  Development mode: A password reset link has been generated. 
                  You can copy the link below or click it to reset your password.
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', mb: 1 }}>
                      {passwordResetData.resetUrl}
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={`/reset-password?token=${passwordResetData.resetToken}`}
                      variant="contained"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Click to Reset Password
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  If an account with that email exists, a password reset link has been sent to your email address.
                  Please check your inbox and follow the instructions to reset your password.
                </>
              )}
            </Alert>

            <Box sx={{ textAlign: 'center' }}>
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                color="primary"
                sx={{ mr: 2 }}
              >
                Back to Login
              </Button>
              <Button
                onClick={() => {
                  setPasswordResetData(null);
                  setEmail('');
                }}
                variant="outlined"
                color="primary"
              >
                Send Another Email
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
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Forgot Password
          </Typography>
          
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>

          {requestPasswordResetMutation.error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {requestPasswordResetMutation.error?.response?.data?.message || 
               requestPasswordResetMutation.error?.message || 
               'Failed to send password reset email'}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={emailError}
              disabled={requestPasswordResetMutation.isPending}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={requestPasswordResetMutation.isPending}
            >
              {requestPasswordResetMutation.isPending ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                Back to Login
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
