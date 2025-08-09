import React, { useState, useMemo } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useProjects, useProjectSearch } from '../../hooks/projects';

const ProjectList = () => {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');

  // Build filters object for API call
  const filters = useMemo(() => {
    const filterObj = {};
    if (statusFilter !== 'all') filterObj.status = statusFilter;
    if (skillFilter) filterObj.requiredSkills = skillFilter;
    return filterObj;
  }, [statusFilter, skillFilter]);

  // TanStack Query hooks
  const { 
    data: projects = [], 
    isLoading, 
    error,
    refetch 
  } = useProjects(filters);
  
  const { 
    data: searchResults = [], 
    isLoading: isSearching 
  } = useProjectSearch(searchQuery, {
    enabled: searchQuery.length > 2, // Only search if query is 3+ characters
  });

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSkillFilter = (e) => {
    setSkillFilter(e.target.value);
  };

  // Determine which projects to display
  const displayProjects = searchQuery.length > 2 ? searchResults : projects;

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            Retry
          </Button>
        }>
          Failed to load projects: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Search and Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Projects"
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
                  </InputAdornment>
                ),
              }}
              helperText={searchQuery.length > 0 && searchQuery.length <= 2 ? "Type at least 3 characters to search" : ""}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={handleStatusFilter}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="ideation">Ideation</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Required Skill</InputLabel>
              <Select
                value={skillFilter}
                label="Required Skill"
                onChange={handleSkillFilter}
              >
                <MenuItem value="">All Skills</MenuItem>
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="react">React</MenuItem>
                <MenuItem value="node">Node.js</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Projects Grid */}
      <Grid container spacing={3}>
        {displayProjects?.length > 0 ? (
          displayProjects.map((project) => (
            <Grid item key={project._id} xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {project.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {project.description}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {project.requiredSkills && project.requiredSkills.map((skill) => (
                      <Chip
                        key={skill}
                        label={skill}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  <Box sx={{ mt: 2 }}>
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
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    component={RouterLink}
                    to={`/projects/${project._id}`}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography align="center">
              {searchQuery.length > 2 ? 'No projects found matching your search' : 'No projects found'}
            </Typography>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default ProjectList; 