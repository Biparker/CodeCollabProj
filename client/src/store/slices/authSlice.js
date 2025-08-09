import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      // Don't automatically log in after registration - user needs to verify email
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resendVerificationEmail = createAsyncThunk(
  'auth/resendVerification',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/request-password-reset', { email });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const verifyPasswordResetToken = createAsyncThunk(
  'auth/verifyPasswordResetToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.get(`/auth/verify-password-reset/${token}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  needsVerification: false,
  registrationSuccess: false,
  passwordResetRequested: false,
  passwordResetSuccess: false,
  passwordResetTokenValid: false,
  passwordResetToken: null,
  passwordResetUrl: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;
      state.needsVerification = false;
      state.registrationSuccess = false;
      state.passwordResetRequested = false;
      state.passwordResetSuccess = false;
      state.passwordResetTokenValid = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
    clearNeedsVerification: (state) => {
      state.needsVerification = false;
    },
    clearPasswordResetState: (state) => {
      state.passwordResetRequested = false;
      state.passwordResetSuccess = false;
      state.passwordResetTokenValid = false;
      state.passwordResetToken = null;
      state.passwordResetUrl = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationSuccess = true;
        state.error = null;
        // Don't set isAuthenticated to true - user needs to verify email
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.needsVerification = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
        // Check if the error is due to unverified email
        if (action.payload?.needsVerification) {
          state.needsVerification = true;
        }
      })
      // Resend Verification
      .addCase(resendVerificationEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendVerificationEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendVerificationEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to send verification email';
      })
      // Request Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordResetRequested = true;
        state.error = null;
        // Store development mode data
        if (action.payload.resetToken) {
          state.passwordResetToken = action.payload.resetToken;
          state.passwordResetUrl = action.payload.resetUrl;
        }
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to request password reset';
      })
      // Verify Password Reset Token
      .addCase(verifyPasswordResetToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPasswordResetToken.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordResetTokenValid = true;
        state.error = null;
      })
      .addCase(verifyPasswordResetToken.rejected, (state, action) => {
        state.loading = false;
        state.passwordResetTokenValid = false;
        state.error = action.payload?.message || 'Invalid or expired reset token';
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.passwordResetSuccess = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to reset password';
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        // Clear the token from localStorage when getCurrentUser fails
        localStorage.removeItem('token');
      });
  },
});

export const { 
  logout, 
  clearError, 
  clearRegistrationSuccess, 
  clearNeedsVerification,
  clearPasswordResetState
} = authSlice.actions;
export default authSlice.reducer; 