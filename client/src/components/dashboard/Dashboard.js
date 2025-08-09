import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/auth';
import { useHandleCollaborationRequest } from '../../hooks/projects';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const handleCollaborationMutation = useHandleCollaborationRequest();

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleCollaborationRequest = (projectId, userId, status) => {
    handleCollaborationMutation.mutate(
      { projectId, userId, status },
      {
        onSuccess: (result) => {
          console.log('✅ Collaboration request handled:', result);
          // The user data should automatically refresh through TanStack Query
        },
        onError: (error) => {
          console.error('❌ Error handling collaboration request:', error);
          alert(error?.response?.data?.message || error?.message || 'Failed to handle collaboration request');
        },
      }
    );
  };

  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Authentication Required
          </Typography>
          You must be logged in to view your dashboard.
        </Alert>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Container>
    );
  }
  

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* My Projects Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">My Projects</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
              >
                Create Project
              </Button>
            </Box>
            <List>
              {user.projects?.length > 0 ? (
                user.projects.map((project) => (
                  <React.Fragment key={project._id}>
                    <ListItem button onClick={() => handleViewProject(project._id)}>
                      <ListItemText
                        primary={project.title}
                        secondary={project.description}
                      />
                      <ListItemSecondaryAction>
                        <Chip
                          label={project.status}
                          color={
                            project.status === 'completed'
                              ? 'success'
                              : project.status === 'in_progress'
                              ? 'primary'
                              : 'default'
                          }
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No projects yet" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Collaboration Requests Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>
              Collaboration Requests
            </Typography>
            <List>
              {user.collaborationRequests?.length > 0 ? (
                user.collaborationRequests.map((request) => (
                  <React.Fragment key={request._id}>
                    <ListItem>
                      <ListItemText
                        primary={`${request.user.username} wants to collaborate on ${request.project.title}`}
                        secondary={`Status: ${request.status}`}
                      />
                      {request.status === 'pending' && (
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={handleCollaborationMutation.isPending}
                              onClick={() =>
                                handleCollaborationRequest(
                                  request.project._id,
                                  request.user._id,
                                  'accepted'
                                )
                              }
                            >
                              {handleCollaborationMutation.isPending ? 'Processing...' : 'Accept'}
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              disabled={handleCollaborationMutation.isPending}
                              onClick={() =>
                                handleCollaborationRequest(
                                  request.project._id,
                                  request.user._id,
                                  'rejected'
                                )
                              }
                            >
                              {handleCollaborationMutation.isPending ? 'Processing...' : 'Reject'}
                            </Button>
                          </Box>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No pending collaboration requests" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 