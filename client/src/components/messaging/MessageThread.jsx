import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Button,
  Divider,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Reply as ReplyIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';
import { useMessage, useMarkMessageAsRead } from '../../hooks/users/useMessaging';

const MessageThread = ({ 
  messageId, 
  onBack, 
  onReply, 
  onDelete,
  message: propMessage 
}) => {
  // Fetch message if not provided as prop
  const { 
    data: fetchedMessage, 
    isLoading, 
    error 
  } = useMessage(messageId, {
    enabled: !propMessage && !!messageId
  });

  const message = propMessage || fetchedMessage;

  // Mark as read mutation
  const markAsReadMutation = useMarkMessageAsRead();

  // Mark message as read when opened
  useEffect(() => {
    if (message && !message.isRead) {
      markAsReadMutation.mutate(message._id);
    }
  }, [message, markAsReadMutation]);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <Typography>Loading message...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Failed to load message: {error.message}
      </Alert>
    );
  }

  if (!message) {
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Message not found
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            {onBack && (
              <IconButton onClick={onBack} size="small">
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6">
              Message Details
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {!message.isRead && (
              <Chip 
                label="Unread" 
                size="small" 
                color="primary"
                icon={<MarkEmailReadIcon />}
              />
            )}
            {onReply && (
              <Button
                size="small"
                startIcon={<ReplyIcon />}
                onClick={() => onReply(message)}
              >
                Reply
              </Button>
            )}
            {onDelete && (
              <IconButton
                size="small"
                onClick={() => onDelete(message._id)}
                sx={{ color: 'error.main' }}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        {/* Message metadata */}
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ width: 40, height: 40 }}>
            {(message.sender?.firstName?.[0] || message.sender?.username?.[0] || 'U').toUpperCase()}
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="subtitle2">
              From: {message.sender?.firstName && message.sender?.lastName
                ? `${message.sender.firstName} ${message.sender.lastName}`
                : message.sender?.username || 'Unknown User'
              }
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {message.sender?.email}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" color="text.secondary">
              {format(new Date(message.createdAt), 'PPP')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
            </Typography>
          </Box>
        </Box>

        <Divider />

        {/* Subject */}
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {message.subject}
        </Typography>
      </Paper>

      {/* Message content */}
      <Paper sx={{ p: 3 }}>
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6,
            minHeight: '200px'
          }}
        >
          {message.content}
        </Typography>
      </Paper>

      {/* Footer info */}
      <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {message.isRead 
            ? `Read ${message.readAt ? format(new Date(message.readAt), 'PPp') : 'recently'}`
            : 'Unread'
          }
        </Typography>
      </Box>
    </Box>
  );
};

export default MessageThread;
