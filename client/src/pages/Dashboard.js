import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Add, Code, People, CalendarToday } from '@mui/icons-material';
import { fetchProjects } from '../store/slices/projectsSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { projects, loading, error } = useSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  // Filter projects for the current user (owned or collaborated)
  const userProjects = projects.filter(project => {
    const isOwner = project.owner?._id === user?._id;
    const isCollaborator = project.collaborators?.some(collab => 
      collab._id === user?._id || collab.userId === user?._id
    );
    return isOwner || isCollaborator;
  });

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome back, {user?.username || 'User'}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with your projects today.
          </Typography>
        </Box>

        {/* User Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Projects
                </Typography>
                <Typography variant="h4">
                  {userProjects.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Active Collaborations
                </Typography>
                <Typography variant="h4">
                  {userProjects.reduce((sum, project) => 
                    sum + (project.collaborators?.length || 0), 0
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Technologies Used
                </Typography>
                <Typography variant="h4">
                  {new Set(userProjects.flatMap(p => p.technologies || [])).size}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* My Projects Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              My Projects
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              component={RouterLink}
              to="/projects/create"
            >
              Create New Project
            </Button>
          </Box>

          <Grid container spacing={3}>
            {userProjects.map((project) => {
              const isOwner = project.owner?._id === user?._id;
              return (
                <Grid item xs={12} sm={6} md={4} key={project._id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                          {project.title}
                        </Typography>
                        <Chip 
                          label={isOwner ? 'Owner' : 'Collaborator'} 
                          size="small" 
                          color={isOwner ? 'primary' : 'secondary'}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {project.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        {project.technologies && project.technologies.map((tech) => (
                          <Chip
                            key={tech}
                            label={tech}
                            size="small"
                            sx={{ mr: 1, mb: 1 }}
                          />
                        ))}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <People sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">
                            {project.collaborators?.length || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 0.5 }} />
                          <Typography variant="body2">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button size="small" component={RouterLink} to={`/projects/${project._id}`}>
                        View Details
                      </Button>
                      {isOwner && (
                        <Button size="small" component={RouterLink} to={`/projects/${project._id}/edit`}>
                          Edit
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {userProjects.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No projects yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start by creating your first project or joining an existing one.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                component={RouterLink}
                to="/projects/create"
              >
                Create Your First Project
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard; 