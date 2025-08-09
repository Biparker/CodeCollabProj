import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Paper,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/auth';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '../../hooks/comments';

const Comments = ({ projectId }) => {
  // Auth and data fetching
  const { user } = useAuth();
  const { 
    data: comments = [], 
    isLoading: loading, 
    error,
    refetch: refetchComments 
  } = useComments(projectId);

  // Mutations
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  // Local state
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      createCommentMutation.mutate({ 
        projectId, 
        content: newComment 
      }, {
        onSuccess: (data) => {
          console.log('✅ Comment added successfully:', data);
          setNewComment('');
        },
        onError: (error) => {
          console.error('❌ Failed to add comment:', error);
        },
      });
    }
  };

  const handleUpdateComment = (commentId) => {
    if (editContent.trim()) {
      updateCommentMutation.mutate({
        commentId,
        commentData: {
          projectId,
          content: editContent,
        }
      }, {
        onSuccess: (data) => {
          console.log('✅ Comment updated successfully:', data);
          setEditingComment(null);
          setEditContent('');
        },
        onError: (error) => {
          console.error('❌ Failed to update comment:', error);
        },
      });
    }
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate({ 
        projectId, 
        commentId 
      }, {
        onSuccess: (data) => {
          console.log('✅ Comment deleted successfully:', data);
        },
        onError: (error) => {
          console.error('❌ Failed to delete comment:', error);
        },
      });
    }
  };

  const startEditing = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Comments
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Comments
          </Typography>
          {error?.response?.data?.message || error?.message || 'Failed to load comments'}
        </Alert>
        <Button variant="contained" onClick={refetchComments}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Comments
      </Typography>

      {/* Add Comment Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <form onSubmit={handleAddComment}>
          <TextField
            fullWidth
            multiline
            rows={2}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={<SendIcon />}
            disabled={!newComment.trim() || createCommentMutation.isPending}
          >
            {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
          </Button>
        </form>
      </Paper>

      {/* Comments List */}
      <List>
        {comments.map((comment) => (
          <React.Fragment key={comment._id}>
            <ListItem
              alignItems="flex-start"
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                <ListItemAvatar>
                  <Avatar src={comment.author.avatar}>
                    {comment.author.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1">
                      {comment.author.name}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {new Date(comment.createdAt).toLocaleString()}
                    </Typography>
                  }
                />
                {user && user._id === comment.author._id && (
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => startEditing(comment)}
                      disabled={editingComment === comment._id || updateCommentMutation.isPending}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComment(comment._id)}
                      disabled={deleteCommentMutation.isPending}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {editingComment === comment._id ? (
                <Box sx={{ width: '100%', mt: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleUpdateComment(comment._id)}
                      disabled={!editContent.trim() || updateCommentMutation.isPending}
                    >
                      {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={cancelEditing}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Typography
                  variant="body1"
                  sx={{ ml: 7, whiteSpace: 'pre-wrap' }}
                >
                  {comment.content}
                </Typography>
              )}
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Comments; 