import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
  IconButton,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { fetchProjectById, createProject, updateProject } from '../../store/slices/projectsSlice';

const ProjectForm = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { currentProject, loading } = useSelector((state) => state.projects);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [],
    requiredSkills: [],
    tags: [],
    githubUrl: '',
    liveUrl: '',
    resources: [{ name: '', url: '' }],
    status: 'ideation',
  });

  const [formErrors, setFormErrors] = useState({});

  const commonSkills = [
    'JavaScript',
    'Python',
    'Java',
    'React',
    'Node.js',
    'TypeScript',
    'HTML',
    'CSS',
    'MongoDB',
    'SQL',
    'Git',
    'Docker',
  ];

  useEffect(() => {
    if (projectId) {
      console.log('🔍 Fetching project for editing:', projectId);
      dispatch(fetchProjectById(projectId));
    }
  }, [projectId, dispatch]);

  useEffect(() => {
    if (currentProject && projectId) {
      console.log('📝 Setting form data for editing:', currentProject);
      console.log('📋 Current requiredSkills:', currentProject.requiredSkills);
      setFormData({
        title: currentProject.title || '',
        description: currentProject.description || '',
        technologies: currentProject.technologies || [],
        requiredSkills: currentProject.requiredSkills || [],
        tags: currentProject.tags || [],
        githubUrl: currentProject.githubUrl || '',
        liveUrl: currentProject.liveUrl || '',
        resources: currentProject.resources?.length
          ? currentProject.resources
          : [{ name: '', url: '' }],
        status: currentProject.status || 'ideation',
      });
    }
  }, [currentProject, projectId]);

  const validateForm = () => {
    const errors = {};
    if (!formData.title) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    // Removed required skills validation since it's not mandatory

    formData.resources.forEach((resource, index) => {
      if (resource.name && !resource.url) {
        errors[`resource${index}Url`] = 'URL is required if name is provided';
      }
      if (!resource.name && resource.url) {
        errors[`resource${index}Name`] = 'Name is required if URL is provided';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSkillsChange = (event, newValue) => {
    console.log('🔧 Skills changed:', newValue);
    setFormData({
      ...formData,
      requiredSkills: newValue,
    });
  };

  const handleTagsChange = (event, newValue) => {
    setFormData({
      ...formData,
      tags: newValue,
    });
  };

  const handleResourceChange = (index, field, value) => {
    const newResources = [...formData.resources];
    newResources[index] = {
      ...newResources[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      resources: newResources,
    });
  };

  const addResource = () => {
    setFormData({
      ...formData,
      resources: [...formData.resources, { name: '', url: '' }],
    });
  };

  const removeResource = (index) => {
    const newResources = formData.resources.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      resources: newResources.length ? newResources : [{ name: '', url: '' }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 Form submission started');
    console.log('📋 Form data:', formData);
    console.log('🔍 Project ID:', projectId);
    
    // Check authentication
    const token = localStorage.getItem('token');
    console.log('🔐 Authentication token exists:', !!token);
    
    if (validateForm()) {
      console.log('✅ Form validation passed');
      const filteredResources = formData.resources.filter(
        (resource) => resource.name && resource.url
      );

      // Ensure arrays are properly formatted
      const projectData = {
        ...formData,
        resources: filteredResources,
        requiredSkills: Array.isArray(formData.requiredSkills) ? formData.requiredSkills : [],
        technologies: Array.isArray(formData.technologies) ? formData.technologies : [],
        tags: Array.isArray(formData.tags) ? formData.tags : [],
      };

      console.log('📤 Sending project data:', projectData);
      console.log('🔍 Data types:', {
        requiredSkills: typeof projectData.requiredSkills,
        technologies: typeof projectData.technologies,
        tags: typeof projectData.tags,
        resources: typeof projectData.resources
      });

      try {
        if (projectId) {
          console.log('🔄 Updating project:', projectId, projectData);
          const result = await dispatch(updateProject({ projectId, projectData })).unwrap();
          console.log('✅ Project updated successfully:', result);
        } else {
          console.log('➕ Creating new project:', projectData);
          const result = await dispatch(createProject(projectData)).unwrap();
          console.log('✅ Project created successfully:', result);
        }
        console.log('🚀 Navigating to projects page');
        navigate('/projects');
      } catch (error) {
        console.error('❌ Error saving project:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          data: error.data
        });
        
        // Better error handling with more specific messages
        let errorMessage = 'Error saving project. Please try again.';
        
        if (error.message) {
          errorMessage = `Error saving project: ${error.message}`;
        } else if (error.status === 401) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (error.status === 403) {
          errorMessage = 'You are not authorized to edit this project.';
        } else if (error.status === 404) {
          errorMessage = 'Project not found.';
        } else if (error.status === 422) {
          errorMessage = 'Invalid data. Please check your input.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        alert(errorMessage);
      }
    } else {
      console.log('❌ Form validation failed:', formErrors);
      alert('Please fix the form errors before submitting.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {projectId ? 'Edit Project' : 'Create Project'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="GitHub URL (optional)"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/project"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Live URL (optional)"
                name="liveUrl"
                value={formData.liveUrl}
                onChange={handleChange}
                placeholder="https://your-project.com"
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={commonSkills}
                value={formData.technologies}
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    technologies: newValue,
                  });
                }}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Technologies Used"
                    placeholder="Select or type technologies"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={commonSkills}
                value={formData.requiredSkills}
                onChange={handleSkillsChange}
                isOptionEqualToValue={(option, value) => option === value}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Required Skills (optional)"
                    error={!!formErrors.requiredSkills}
                    helperText={formErrors.requiredSkills}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={formData.tags}
                onChange={handleTagsChange}
                renderInput={(params) => (
                  <TextField {...params} label="Tags (optional)" />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="ideation">Ideation</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Resources (optional)
              </Typography>
              {formData.resources.map((resource, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    label="Resource Name"
                    value={resource.name}
                    onChange={(e) =>
                      handleResourceChange(index, 'name', e.target.value)
                    }
                    error={!!formErrors[`resource${index}Name`]}
                    helperText={formErrors[`resource${index}Name`]}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Resource URL"
                    value={resource.url}
                    onChange={(e) =>
                      handleResourceChange(index, 'url', e.target.value)
                    }
                    error={!!formErrors[`resource${index}Url`]}
                    helperText={formErrors[`resource${index}Url`]}
                    sx={{ flex: 2 }}
                  />
                  <IconButton
                    onClick={() => removeResource(index)}
                    disabled={formData.resources.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={addResource}
                sx={{ mt: 1 }}
              >
                Add Resource
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/projects')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading
                    ? 'Saving...'
                    : projectId
                    ? 'Update Project'
                    : 'Create Project'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ProjectForm; 