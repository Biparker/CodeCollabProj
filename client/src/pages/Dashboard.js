import React, { useMemo } from 'react';
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
  Alert,
} from '@mui/material';
import { Add, Code, People, CalendarToday } from '@mui/icons-material';
import { useAuth } from '../hooks/auth';
import { useProjects } from '../hooks/projects';
import { DashboardSkeleton } from '../components/common/Skeletons';

const Dashboard = () => {
  // Auth and project data
  const { user, isAuthenticated } = useAuth();
  const { 
    data: projects = [], 
    isLoading: loading, 
    error,
    refetch 
  } = useProjects();

  // Filter projects for the current user (owned or collaborated)
  const userProjects = useMemo(() => {
    return projects.filter(project => {
      const isOwner = project.owner?._id === user?._id;
      const isCollaborator = project.collaborators?.some(collab => 
        collab._id === user?._id || collab.userId === user?._id || collab.userId?._id === user?._id
      );
      return isOwner || isCollaborator;
    });
  }, [projects, user]);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <DashboardSkeleton />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Error Loading Dashboard
            </Typography>
            {error?.response?.data?.message || error?.message || 'Failed to load dashboard data'}
          </Alert>
          <Button variant="contained" onClick={() => refetch()}>
            Try Again
          </Button>
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