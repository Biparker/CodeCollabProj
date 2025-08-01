import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../store/slices/authSlice';

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleCollaborationRequest = (projectId, userId, status) => {
    // TODO: Implement collaboration request handling
    console.log('Handle collaboration request:', { projectId, userId, status });
  };

  if (!user) {
    return (
      <Container>
        <Typography>Loading...</Typography>
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
                              onClick={() =>
                                handleCollaborationRequest(
                                  request.project._id,
                                  request.user._id,
                                  'accepted'
                                )
                              }
                            >
                              Accept
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() =>
                                handleCollaborationRequest(
                                  request.project._id,
                                  request.user._id,
                                  'rejected'
                                )
                              }
                            >
                              Reject
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