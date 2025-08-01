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
import axios from 'axios';
import api from '../utils/api'; // Add this import

const EmailVerification = () => {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false); // Track if verification has already been attempted
  const verificationPromise = useRef(null); // Store the verification promise

  // Get token from either URL params or query string
  const token = paramToken || searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
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
      verificationPromise.current = (async () => {
        try {
          console.log('Making verification request...');
          const response = await api.get(`/auth/verify-email/${token}`);
          console.log('Verification success:', response.data);
          setStatus('success');
          setMessage(response.data.message);
          return response;
        } catch (error) {
          console.error('=== VERIFICATION ERROR DEBUG ===');
          console.error('Full error object:', error);
          console.error('Error message:', error.message);
          console.error('Error response exists?', !!error.response);
          if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
            console.error('Error headers:', error.response.headers);
          }
          console.error('Token being used:', token);
          console.error('=== END DEBUG ===');
          setStatus('error');
          setMessage(error.response?.data?.message || 'Verification failed');
          throw error;
        }
      })();

      return verificationPromise.current;
    };

    verifyEmail();
  }, [token]);

  const getContent = () => {
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