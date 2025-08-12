import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Autocomplete,
  Alert,
  CircularProgress
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { useUsers } from '../../hooks/users';
import { useSendMessage } from '../../hooks/users/useMessaging';

const MessageForm = ({ 
  recipientId = null, 
  recipientUser = null,
  replyToMessage = null,
  onSuccess,
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    recipientId: recipientId || '',
    subject: replyToMessage ? `Re: ${replyToMessage.subject}` : '',
    content: ''
  });
  const [selectedRecipient, setSelectedRecipient] = useState(recipientUser);
  const [errors, setErrors] = useState({});

  // Fetch users for recipient selection
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  
  // Send message mutation
  const sendMessageMutation = useSendMessage({
    onSuccess: () => {
      setFormData({ recipientId: '', subject: '', content: '' });
      setSelectedRecipient(null);
      setErrors({});
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      setErrors({ submit: error.message || 'Failed to send message' });
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleRecipientChange = (event, newValue) => {
    setSelectedRecipient(newValue);
    setFormData(prev => ({ 
      ...prev, 
      recipientId: newValue ? newValue._id : '' 
    }));
    if (errors.recipientId) {
      setErrors(prev => ({ ...prev, recipientId: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipientId) {
      newErrors.recipientId = 'Please select a recipient';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Message content is required';
    }
    if (formData.subject.length > 100) {
      newErrors.subject = 'Subject must be 100 characters or less';
    }
    if (formData.content.length > 1000) {
      newErrors.content = 'Message must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    sendMessageMutation.mutate({
      recipientId: formData.recipientId,
      subject: formData.subject.trim(),
      content: formData.content.trim()
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {replyToMessage ? 'Reply to Message' : 'Send New Message'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        {/* Recipient Selection */}
        {!recipientId && (
          <Autocomplete
            options={users}
            getOptionLabel={(option) => 
              `${option.username} (${option.firstName} ${option.lastName})`
            }
            value={selectedRecipient}
            onChange={handleRecipientChange}
            loading={loadingUsers}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Recipient"
                error={!!errors.recipientId}
                helperText={errors.recipientId}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingUsers ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{ mb: 2 }}
              />
            )}
          />
        )}

        {/* Subject */}
        <TextField
          fullWidth
          label="Subject"
          value={formData.subject}
          onChange={(e) => handleInputChange('subject', e.target.value)}
          error={!!errors.subject}
          helperText={errors.subject || `${formData.subject.length}/100 characters`}
          inputProps={{ maxLength: 100 }}
          sx={{ mb: 2 }}
        />

        {/* Content */}
        <TextField
          fullWidth
          label="Message"
          multiline
          rows={6}
          value={formData.content}
          onChange={(e) => handleInputChange('content', e.target.value)}
          error={!!errors.content}
          helperText={errors.content || `${formData.content.length}/1000 characters`}
          inputProps={{ maxLength: 1000 }}
          sx={{ mb: 2 }}
        />

        {/* Error Alert */}
        {errors.submit && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.submit}
          </Alert>
        )}

        {/* Actions */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          {onCancel && (
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={sendMessageMutation.isPending}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            startIcon={sendMessageMutation.isPending ? 
              <CircularProgress size={20} /> : <SendIcon />
            }
            disabled={sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default MessageForm;
