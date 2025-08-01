import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
} from '@mui/material';
import { Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    skills: [],
    github: '',
    linkedin: '',
    website: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        bio: user.profile.bio || '',
        skills: user.profile.skills || [],
        github: user.profile.github || '',
        linkedin: user.profile.linkedin || '',
        website: user.profile.website || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const errors = {};
    if (formData.github && !isValidUrl(formData.github)) {
      errors.github = 'Invalid GitHub URL';
    }
    if (formData.linkedin && !isValidUrl(formData.linkedin)) {
      errors.linkedin = 'Invalid LinkedIn URL';
    }
    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = 'Invalid website URL';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // TODO: Implement profile update
      // dispatch(updateProfile(formData));
      setIsEditing(false);
    }
  };

  if (!user) {
    return (
      <Container>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar
              src={user.profile?.avatar}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            >
              {user.username[0]}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {user.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Chip
                label={`${user.projects?.length || 0} Projects`}
                sx={{ mr: 1 }}
              />
              <Chip
                label={`${user.collaborations?.length || 0} Collaborations`}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Profile Details */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Profile Information</Typography>
              <IconButton
                onClick={() => setIsEditing(!isEditing)}
                color="primary"
              >
                {isEditing ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            </Box>

            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Bio"
                      name="bio"
                      multiline
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="GitHub Profile"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      error={!!formErrors.github}
                      helperText={formErrors.github}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="LinkedIn Profile"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      error={!!formErrors.linkedin}
                      helperText={formErrors.linkedin}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Personal Website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      error={!!formErrors.website}
                      helperText={formErrors.website}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            ) : (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Bio
                </Typography>
                <Typography variant="body1" paragraph>
                  {user.profile?.bio || 'No bio provided'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  {user.profile?.skills?.map((skill) => (
                    <Chip key={skill} label={skill} />
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" gutterBottom>
                  Social Links
                </Typography>
                <List>
                  {user.profile?.github && (
                    <ListItem>
                      <ListItemText
                        primary="GitHub"
                        secondary={user.profile.github}
                      />
                    </ListItem>
                  )}
                  {user.profile?.linkedin && (
                    <ListItem>
                      <ListItemText
                        primary="LinkedIn"
                        secondary={user.profile.linkedin}
                      />
                    </ListItem>
                  )}
                  {user.profile?.website && (
                    <ListItem>
                      <ListItemText
                        primary="Website"
                        secondary={user.profile.website}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {user.recentActivity?.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar>{activity.type[0]}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.timestamp).toLocaleDateString()}
                    />
                  </ListItem>
                  {index < user.recentActivity.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile; 