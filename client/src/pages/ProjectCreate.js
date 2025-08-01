import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  Grid,
  Chip,
} from '@mui/material';
import { CloudUpload, Add, Delete } from '@mui/icons-material';
import { createProject } from '../store/slices/projectsSlice';

const ProjectCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [],
    githubUrl: '',
    liveUrl: '',
  });

  const [newTechnology, setNewTechnology] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setValidationError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setValidationError('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setValidationError('Image size must be less than 5MB');
        return;
      }

      setSelectedImage(file);
      setValidationError('');

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTechnology = () => {
    if (newTechnology.trim() && !formData.technologies.includes(newTechnology.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, newTechnology.trim()],
      });
      setNewTechnology('');
    }
  };

  const handleRemoveTechnology = (techToRemove) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(tech => tech !== techToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setValidationError('Project title is required');
      return;
    }

    if (!formData.description.trim()) {
      setValidationError('Project description is required');
      return;
    }

    if (formData.technologies.length === 0) {
      setValidationError('At least one technology is required');
      return;
    }

    try {
      const projectData = new FormData();
      projectData.append('title', formData.title);
      projectData.append('description', formData.description);
      projectData.append('technologies', JSON.stringify(formData.technologies));
      projectData.append('githubUrl', formData.githubUrl);
      projectData.append('liveUrl', formData.liveUrl);
      
      if (selectedImage) {
        projectData.append('image', selectedImage);
      }

      console.log('Sending project data:', {
        title: formData.title,
        description: formData.description,
        technologies: formData.technologies,
        githubUrl: formData.githubUrl,
        liveUrl: formData.liveUrl,
        hasImage: !!selectedImage
      });

      console.log('About to dispatch createProject...');
      const result = await dispatch(createProject(projectData)).unwrap();
      console.log('Project created successfully:', result);
      navigate('/projects');
    } catch (error) {
      console.error('Project creation failed:', error);
      console.error('Error details:', {
        message: error.message,
        errors: error.errors,
        response: error.response?.data
      });
      
      if (error.errors && Array.isArray(error.errors)) {
        console.log('Validation errors found:', error.errors);
        const errorMessages = error.errors.map(err => err.msg || err.message || 'Unknown error').join(', ');
        setValidationError(`Validation errors: ${errorMessages}`);
      } else if (error.message) {
        setValidationError(error.message);
      } else {
        setValidationError('Failed to create project. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create New Project
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
            Share your amazing project with the CodeCollab community!
          </Typography>
          
          {(error || validationError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || validationError}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Project Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Project Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="Describe what your project does and what makes it special"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Technologies Used
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size="small"
                      placeholder="Add technology (e.g., React, Node.js)"
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTechnology())}
                      disabled={loading}
                    />
                    <Button
                      variant="outlined"
                      onClick={handleAddTechnology}
                      disabled={!newTechnology.trim() || loading}
                      startIcon={<Add />}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.technologies.map((tech) => (
                      <Chip
                        key={tech}
                        label={tech}
                        onDelete={() => handleRemoveTechnology(tech)}
                        deleteIcon={<Delete />}
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GitHub Repository URL"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="https://github.com/username/project"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Live Demo URL"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="https://your-project.com"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ border: '2px dashed #ccc', borderRadius: 2, p: 3, textAlign: 'center' }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageChange}
                    disabled={loading}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      disabled={loading}
                    >
                      Upload Project Image
                    </Button>
                  </label>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Upload a screenshot or logo for your project (max 5MB)
                  </Typography>
                  
                  {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                      <img
                        src={imagePreview}
                        alt="Project preview"
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
                      />
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                  >
                    {loading ? 'Creating Project...' : 'Create Project'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/projects')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProjectCreate; 