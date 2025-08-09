import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { fetchProjectById } from '../../store/slices/projectsSlice';
import { fetchComments, createComment } from '../../store/slices/commentsSlice';
import { requestCollaboration, handleCollaborationRequest } from '../../store/slices/projectsSlice';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { currentProject, loading, error } = useSelector((state) => state.projects);
  const { comments, loading: commentsLoading, error: commentsError } = useSelector((state) => state.comments);

  const [comment, setComment] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [collaborationStatus, setCollaborationStatus] = useState(null);
  const [showCollaborationDialog, setShowCollaborationDialog] = useState(false);

  // Fetch project data and comments
  useEffect(() => {
    if (projectId) {
      console.log('🔍 Fetching project and comments for:', projectId);
      dispatch(fetchProjectById(projectId));
      dispatch(fetchComments(projectId));
    }
  }, [dispatch, projectId]);

  // Check collaboration status when project loads
  useEffect(() => {
    if (currentProject && user) {
      console.log('🔍 Checking collaboration status:', {
        projectId: currentProject._id,
        userId: user._id,
        collaborators: currentProject.collaborators
      });
      
      const userCollaboration = currentProject.collaborators?.find(
        collab => collab.userId === user._id || collab.userId._id === user._id
      );
      
      console.log('🤝 User collaboration found:', userCollaboration);
      setCollaborationStatus(userCollaboration?.status || null);
    }
  }, [currentProject, user]);

  const handleEdit = () => {
    console.log('🔧 Edit button clicked for project:', projectId);
    console.log('👤 Current user:', user);
    console.log('👑 Is owner:', isOwner);
    navigate(`/projects/${projectId}/edit`);
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    // TODO: Implement project deletion
    // dispatch(deleteProject(projectId));
    setShowDeleteDialog(false);
    navigate('/projects');
  };

  const handleCollaborate = async () => {
    if (!user) {
      alert('Please log in to request collaboration');
      return;
    }

    // Check if user is already a collaborator
    const isAlreadyCollaborator = currentProject.collaborators?.some(
      collab => (collab.userId === user._id || collab.userId._id === user._id) && 
                (collab.status === 'accepted' || collab.status === 'pending')
    );

    if (isAlreadyCollaborator) {
      alert('You have already requested collaboration or are already a collaborator');
      return;
    }

    try {
      console.log('🤝 Requesting collaboration for project:', projectId);
      const result = await dispatch(requestCollaboration(projectId)).unwrap();
      console.log('✅ Collaboration request sent:', result);
      
      // Refresh project data to show updated collaboration status
      dispatch(fetchProjectById(projectId));
      
      alert('Collaboration request sent successfully!');
    } catch (error) {
      console.error('❌ Error requesting collaboration:', error);
      alert(error.message || 'Failed to request collaboration');
    }
  };

  const handleCollaborationResponse = async (userId, status) => {
    try {
      console.log('🤝 Handling collaboration request:', { userId, status });
      const result = await dispatch(handleCollaborationRequest({ 
        projectId, 
        userId, 
        status 
      })).unwrap();
      console.log('✅ Collaboration request handled:', result);
      
      // Refresh project data
      dispatch(fetchProjectById(projectId));
      
      alert(`Collaboration request ${status} successfully!`);
    } catch (error) {
      console.error('❌ Error handling collaboration request:', error);
      alert(error.message || 'Failed to handle collaboration request');
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      dispatch(createComment({ projectId, commentData: { content: comment } }))
        .then((result) => {
          if (result.meta.requestStatus === 'fulfilled') {
            setComment('');
            setCommentSuccess(true);
            setTimeout(() => setCommentSuccess(false), 3000);
          }
        });
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading project details...</Typography>
      </Container>
    );
  }

  if (error) {
    // Ensure we never render an object as a React child
    const errorMessage = typeof error === 'object' 
      ? error.message || error.error || JSON.stringify(error)
      : String(error);
    
    return (
      <Container>
        <Typography color="error">
          Error: {errorMessage}
        </Typography>
      </Container>
    );
  }

  if (!currentProject) {
    return (
      <Container>
        <Typography>Project not found</Typography>
      </Container>
    );
  }

  // Additional safety check to ensure currentProject is valid
  if (typeof currentProject !== 'object' || currentProject === null) {
    return (
      <Container>
        <Typography color="error">Invalid project data</Typography>
      </Container>
    );
  }

  // Safety check for missing owner data
  if (!currentProject.owner) {
    console.warn('Project owner data is missing for project:', currentProject._id);
  }

  const isOwner = user?._id === currentProject.owner?._id;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Project Details
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage project information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Project Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  {typeof currentProject.title === 'string' ? currentProject.title : 'Untitled Project'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={typeof currentProject.status === 'string' ? currentProject.status : 'Unknown'}
                    color={
                      currentProject.status === 'completed'
                        ? 'success'
                        : currentProject.status === 'in_progress'
                        ? 'primary'
                        : 'default'
                    }
                  />
                  <Chip
                    label={`Owner: ${currentProject.owner?.username || 'Unknown'}`}
                    variant="outlined"
                  />
                </Box>
              </Box>
              {isOwner ? (
                <Box>
                  <IconButton onClick={handleEdit} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={handleDelete} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box>
                  {!user ? (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate('/login')}
                    >
                      Login to Collaborate
                    </Button>
                  ) : collaborationStatus === 'pending' ? (
                    <Button
                      variant="outlined"
                      color="warning"
                      disabled
                    >
                      Request Pending
                    </Button>
                  ) : collaborationStatus === 'accepted' ? (
                    <Button
                      variant="contained"
                      color="success"
                      disabled
                    >
                      Collaborator
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCollaborate}
                    >
                      Request Collaboration
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            <Typography variant="body1" paragraph>
              {typeof currentProject.description === 'string' ? currentProject.description : 'No description available.'}
            </Typography>

            {/* Project Metadata */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      <strong>Created:</strong> {new Date(currentProject.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      <strong>Updated:</strong> {new Date(currentProject.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                    <Typography variant="body2">
                      <strong>Collaborators:</strong> {currentProject.collaborators?.length || 0}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  {currentProject.githubUrl && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <GitHubIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Link href={currentProject.githubUrl} target="_blank" rel="noopener noreferrer">
                        <Typography variant="body2">GitHub Repository</Typography>
                      </Link>
                    </Box>
                  )}
                  {currentProject.liveUrl && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LanguageIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Link href={currentProject.liveUrl} target="_blank" rel="noopener noreferrer">
                        <Typography variant="body2">Live Demo</Typography>
                      </Link>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>

            {/* Technologies */}
            {currentProject.technologies && currentProject.technologies.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Technologies
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentProject.technologies.map((tech) => (
                    <Chip key={tech} label={tech} color="primary" variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Required Skills */}
            {currentProject.requiredSkills && currentProject.requiredSkills.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentProject.requiredSkills.map((skill) => (
                    <Chip key={skill} label={skill} />
                  ))}
                </Box>
              </Box>
            )}

            {/* Tags */}
            {currentProject.tags && currentProject.tags.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {currentProject.tags.map((tag) => (
                    <Chip key={tag} label={tag} variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}

            {/* Resources */}
            {currentProject.resources && currentProject.resources.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Resources
                </Typography>
                <List>
                  {currentProject.resources.map((resource) => (
                    <ListItem key={resource._id}>
                      <ListItemText
                        primary={resource.name}
                        secondary={
                          <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                            {resource.url}
                          </Link>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Pending Collaboration Requests (for project owners) */}
            {isOwner && currentProject.collaborators && currentProject.collaborators.filter(c => c.status === 'pending').length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom color="warning.main">
                  Pending Collaboration Requests
                </Typography>
                <List>
                  {currentProject.collaborators
                    .filter(collaborator => collaborator.status === 'pending')
                    .map((collaborator) => (
                    <ListItem key={collaborator._id || collaborator.userId?._id}>
                      <ListItemAvatar>
                        <Avatar>{collaborator.username?.[0] || collaborator.userId?.username?.[0] || 'C'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={collaborator.username || collaborator.userId?.username || 'Unknown User'}
                        secondary={collaborator.email || collaborator.userId?.email || 'No email'}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleCollaborationResponse(
                            collaborator.userId._id || collaborator.userId, 
                            'accepted'
                          )}
                        >
                          Accept
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleCollaborationResponse(
                            collaborator.userId._id || collaborator.userId, 
                            'rejected'
                          )}
                        >
                          Reject
                        </Button>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* Collaborators */}
            {currentProject.collaborators && currentProject.collaborators.filter(c => c.status === 'accepted').length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Collaborators
                </Typography>
                <List>
                  {currentProject.collaborators
                    .filter(collaborator => collaborator.status === 'accepted')
                    .map((collaborator) => (
                    <ListItem key={collaborator._id || collaborator.userId?._id}>
                      <ListItemAvatar>
                        <Avatar>{collaborator.username?.[0] || collaborator.userId?.username?.[0] || 'C'}</Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={collaborator.username || collaborator.userId?.username || 'Unknown User'}
                        secondary={collaborator.email || collaborator.userId?.email || 'No email'}
                      />
                      <Chip 
                        label="Accepted" 
                        color="success" 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Paper>
        </Grid>

                    {/* Comments Section */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Comments
                </Typography>

                {user && (
                  <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      placeholder="Write a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={<SendIcon />}
                      disabled={!comment.trim() || commentsLoading}
                    >
                      {commentsLoading ? <CircularProgress size={20} /> : 'Post Comment'}
                    </Button>
                  </Box>
                )}

                {commentSuccess && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    Comment posted successfully!
                  </Alert>
                )}

                {commentsError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {commentsError}
                  </Alert>
                )}

                {commentsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <List>
                    {comments && comments.length > 0 ? (
                      comments.map((comment) => (
                        <React.Fragment key={comment._id}>
                          <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                              <Avatar>
                                {comment.userId?.username?.[0] || 'U'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Typography component="span" variant="subtitle2">
                                    {comment.userId?.username || 'Unknown User'}
                                  </Typography>
                                  <Typography component="span" variant="caption" color="text.secondary">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              }
                              secondary={comment.content}
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))
                    ) : (
                      <ListItem>
                        <ListItemText
                          primary="No comments yet"
                          secondary="Be the first to comment on this project!"
                        />
                      </ListItem>
                    )}
                  </List>
                )}
              </Paper>
            </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this project? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProjectDetail; 