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

const ProjectForm = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const { currentProject, loading } = useSelector((state) => state.projects);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requiredSkills: [],
    tags: [],
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
      // TODO: Implement project fetching for editing
      // dispatch(fetchProjectById(projectId));
      if (currentProject) {
        setFormData({
          title: currentProject.title,
          description: currentProject.description,
          requiredSkills: currentProject.requiredSkills,
          tags: currentProject.tags || [],
          resources: currentProject.resources?.length
            ? currentProject.resources
            : [{ name: '', url: '' }],
          status: currentProject.status,
        });
      }
    }
  }, [projectId, currentProject, dispatch]);

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

    if (!formData.requiredSkills.length) {
      errors.requiredSkills = 'At least one skill is required';
    }

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
    if (validateForm()) {
      const filteredResources = formData.resources.filter(
        (resource) => resource.name && resource.url
      );

      const projectData = {
        ...formData,
        resources: filteredResources,
      };

      if (projectId) {
        // TODO: Implement project update
        // dispatch(updateProject({ projectId, projectData }));
      } else {
        // TODO: Implement project creation
        // dispatch(createProject(projectData));
      }
      navigate('/projects');
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

            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={commonSkills}
                value={formData.requiredSkills}
                onChange={handleSkillsChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Required Skills"
                    error={!!formErrors.requiredSkills}
                    helperText={formErrors.requiredSkills}
                    required
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