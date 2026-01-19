import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Alert,
  AlertTitle,
  Button,
  CircularProgress,
} from '@mui/material';
import api from '../utils/api';

type VerificationStatus = 'verifying' | 'success' | 'error';

interface VerifyResponse {
  message: string;
}

const EmailVerification: React.FC = () => {
  const { token: paramToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);
  const verificationPromise = useRef<Promise<VerifyResponse> | null>(null);

  // Get token from either URL params or query string
  const token = paramToken || searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async (): Promise<VerifyResponse | undefined> => {
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      // If verification is already in progress, wait for it
      if (verificationPromise.current) {
        console.log('Verification already in progress, waiting...');
        return verificationPromise.current;
      }

      // If already verified, don't verify again
      if (hasVerified.current) {
        console.log('Already verified, skipping...');
        return;
      }

      console.log('Starting verification for token:', token);
      hasVerified.current = true;

      // Create and store the verification promise
      verificationPromise.current = (async (): Promise<VerifyResponse> => {
        try {
          console.log('Making verification request...');
          const response = await api.get<VerifyResponse>(`/auth/verify-email/${token}`);
          console.log('Verification success:', response.data);
          setStatus('success');
          setMessage(response.data.message);
          return response.data;
        } catch (error) {
          console.error('=== VERIFICATION ERROR DEBUG ===');
          console.error('Full error object:', error);
          const axiosError = error as {
            response?: { data?: { message?: string } };
            message?: string;
          };
          console.error('Error message:', axiosError.message);
          console.error('Error response exists?', !!axiosError.response);
          if (axiosError.response) {
            console.error('Error data:', axiosError.response.data);
          }
          console.error('Token being used:', token);
          console.error('=== END DEBUG ===');
          setStatus('error');
          setMessage(axiosError.response?.data?.message || 'Verification failed');
          throw error;
        }
      })();

      return verificationPromise.current;
    };

    verifyEmail();
  }, [token]);

  const getContent = (): React.ReactNode => {
    switch (status) {
      case 'verifying':
        return (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">Verifying your email...</Typography>
          </Box>
        );

      case 'success':
        return (
          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Email Verified Successfully!</AlertTitle>
            {message}
          </Alert>
        );

      case 'error':
        return (
          <Alert severity="error" sx={{ mb: 3 }}>
            <AlertTitle>Verification Failed</AlertTitle>
            {message}
          </Alert>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Email Verification
          </Typography>

          {getContent()}

          {(status === 'success' || status === 'error') && (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                onClick={() => navigate('/login')}
                variant="contained"
                color="primary"
                size="large"
              >
                Go to Login
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerification;
