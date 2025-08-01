import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Search, Message, Visibility, FilterList } from '@mui/icons-material';
import { searchUsers, sendMessage } from '../store/slices/userSlice';

const MemberSearch = () => {
  const dispatch = useDispatch();
  const { searchResults, searchLoading, searchError } = useSelector((state) => state.user);
  const { user } = useSelector((state) => state.auth);

  const [searchParams, setSearchParams] = useState({
    query: '',
    skills: '',
    experience: '',
    availability: '',
    location: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageDialog, setMessageDialog] = useState(false);
  const [messageData, setMessageData] = useState({
    subject: '',
    content: ''
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    Object.keys(searchParams).forEach(key => {
      if (searchParams[key]) {
        params[key] = searchParams[key];
      }
    });
    dispatch(searchUsers(params));
  };

  const handleSendMessage = async () => {
    try {
      await dispatch(sendMessage({
        recipientId: selectedUser._id,
        subject: messageData.subject,
        content: messageData.content
      })).unwrap();
      setMessageDialog(false);
      setMessageData({ subject: '', content: '' });
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleViewProfile = (user) => {
    setSelectedUser(user);
  };

  const handleMessageUser = (user) => {
    setSelectedUser(user);
    setMessageDialog(true);
  };

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const availabilityOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'evenings', label: 'Evenings' },
    { value: 'flexible', label: 'Flexible' }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Find Collaborators
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Search for members with specific skills and experience
        </Typography>

        {/* Search Form */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box component="form" onSubmit={handleSearch}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search by name, skills, or bio"
                  name="query"
                  value={searchParams.query}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, query: e.target.value }))}
                  placeholder="e.g., React, Python, Full Stack"
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Skills (comma-separated)"
                  name="skills"
                  value={searchParams.skills}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="React, Node.js, MongoDB"
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<FilterList />}
                >
                  Filters
                </Button>
              </Grid>

              <Grid item xs={12} md={3}>
                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={searchLoading}
                  startIcon={<Search />}
                >
                  {searchLoading ? 'Searching...' : 'Search'}
                </Button>
              </Grid>
            </Grid>

            {/* Advanced Filters */}
            {showFilters && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Experience Level</InputLabel>
                      <Select
                        name="experience"
                        value={searchParams.experience}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, experience: e.target.value }))}
                      >
                        <MenuItem value="">Any Experience</MenuItem>
                        {experienceLevels.map(level => (
                          <MenuItem key={level.value} value={level.value}>
                            {level.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Availability</InputLabel>
                      <Select
                        name="availability"
                        value={searchParams.availability}
                        onChange={(e) => setSearchParams(prev => ({ ...prev, availability: e.target.value }))}
                      >
                        <MenuItem value="">Any Availability</MenuItem>
                        {availabilityOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Location"
                      name="location"
                      value={searchParams.location}
                      onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="City, Country"
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Error Display */}
        {searchError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {searchError}
          </Alert>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Grid container spacing={3}>
            {searchResults.map((member) => (
              <Grid item xs={12} md={6} lg={4} key={member._id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ mr: 2 }}>
                        {member.firstName ? member.firstName[0] : member.username[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="h6">
                          {member.firstName && member.lastName 
                            ? `${member.firstName} ${member.lastName}`
                            : member.username
                          }
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          @{member.username}
                        </Typography>
                      </Box>
                    </Box>

                    {member.bio && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {member.bio}
                      </Typography>
                    )}

                    {member.skills && member.skills.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Skills:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {member.skills.slice(0, 5).map((skill) => (
                            <Chip key={skill} label={skill} size="small" />
                          ))}
                          {member.skills.length > 5 && (
                            <Chip label={`+${member.skills.length - 5} more`} size="small" />
                          )}
                        </Box>
                      </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      {member.experience && (
                        <Chip 
                          label={member.experience} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      )}
                      {member.availability && (
                        <Chip 
                          label={member.availability} 
                          size="small" 
                          color="secondary" 
                          variant="outlined"
                        />
                      )}
                    </Box>

                    {member.location && (
                      <Typography variant="body2" color="text.secondary">
                        📍 {member.location}
                      </Typography>
                    )}
                  </CardContent>

                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<Visibility />}
                      onClick={() => handleViewProfile(member)}
                    >
                      View Profile
                    </Button>
                    {member._id !== user?.id && (
                      <Button
                        size="small"
                        startIcon={<Message />}
                        onClick={() => handleMessageUser(member)}
                      >
                        Message
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {searchResults.length === 0 && !searchLoading && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No members found matching your criteria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search parameters
            </Typography>
          </Box>
        )}
      </Box>

      {/* Message Dialog */}
      <Dialog open={messageDialog} onClose={() => setMessageDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Send Message to {selectedUser?.firstName && selectedUser?.lastName 
            ? `${selectedUser.firstName} ${selectedUser.lastName}`
            : selectedUser?.username
          }
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Subject"
            value={messageData.subject}
            onChange={(e) => setMessageData(prev => ({ ...prev, subject: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={messageData.content}
            onChange={(e) => setMessageData(prev => ({ ...prev, content: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMessageDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleSendMessage}
            variant="contained"
            disabled={!messageData.subject.trim() || !messageData.content.trim()}
          >
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MemberSearch; 