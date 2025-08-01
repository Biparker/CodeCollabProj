import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  fetchComments,
  addComment,
  updateComment,
  deleteComment,
} from '../../store/slices/commentsSlice';

const Comments = ({ projectId }) => {
  const dispatch = useDispatch();
  const { comments, loading } = useSelector((state) => state.comments);
  const { user } = useSelector((state) => state.auth);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    dispatch(fetchComments(projectId));
  }, [dispatch, projectId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      await dispatch(addComment({ projectId, content: newComment }));
      setNewComment('');
    }
  };

  const handleUpdateComment = async (commentId) => {
    if (editContent.trim()) {
      await dispatch(
        updateComment({
          projectId,
          commentId,
          content: editContent,
        })
      );
      setEditingComment(null);
      setEditContent('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await dispatch(deleteComment({ projectId, commentId }));
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
            disabled={!newComment.trim() || loading}
          >
            Post Comment
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
                      disabled={editingComment === comment._id}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteComment(comment._id)}
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
                      disabled={!editContent.trim() || loading}
                    >
                      Save
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