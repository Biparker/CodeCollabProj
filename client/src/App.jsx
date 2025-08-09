import React, { useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Typography, Button, Box } from '@mui/material';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/routing/PrivateRoute';
import Home from './pages/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ProjectList from './pages/ProjectList';
import ProjectCreate from './pages/ProjectCreate';
import ProjectForm from './components/projects/ProjectForm';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MemberSearch from './pages/MemberSearch';
import Members from './pages/Members';
import ProjectDetail from './pages/ProjectDetail';
import EmailVerification from './pages/EmailVerification';
import { getCurrentUser } from './store/slices/authSlice';

function About() {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom>About Page</Typography>
        <Button variant="contained" component={Link} to="/">Go to Home</Button>
      </Box>
    </Container>
  );
}

function App() {
  const dispatch = useDispatch();

  // Memoize theme to prevent unnecessary re-renders
  const theme = useMemo(() => createTheme({
    palette: {
      primary: { main: '#1976d2' },
      secondary: { main: '#dc004e' },
    },
    // Add performance optimizations
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          // Optimize CSS rendering
          '*': {
            boxSizing: 'border-box',
          },
          html: {
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
        },
      },
    },
  }), []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔐 App startup - Token exists:', !!token);
    
    if (token) {
      console.log('🔄 Dispatching getCurrentUser');
      dispatch(getCurrentUser());
    } else {
      console.log('❌ No token found - user not authenticated');
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={<EmailVerification />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route
              path="/projects/create"
              element={
                <PrivateRoute>
                  <ProjectCreate />
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/members"
              element={
                <PrivateRoute>
                  <Members />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:projectId"
              element={
                <PrivateRoute>
                  <ProjectDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/projects/:projectId/edit"
              element={
                <PrivateRoute>
                  <ProjectForm />
                </PrivateRoute>
              }
            />
            <Route path="/about" element={<About />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App; 