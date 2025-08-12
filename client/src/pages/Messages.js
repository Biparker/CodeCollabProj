import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Inbox as InboxIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useMessages, useDeleteMessage } from '../hooks/users/useMessaging';
import MessageList from '../components/messaging/MessageList';
import MessageForm from '../components/messaging/MessageForm';
import MessageThread from '../components/messaging/MessageThread';

const Messages = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);

  // Fetch messages
  const { 
    data: inboxMessages = [], 
    isLoading: loadingInbox,
    error: inboxError,
    refetch: refetchInbox
  } = useMessages('inbox');
  
  const { 
    data: sentMessages = [], 
    isLoading: loadingSent,
    error: sentError,
    refetch: refetchSent
  } = useMessages('sent');

  // Delete message mutation
  const deleteMessageMutation = useDeleteMessage({
    onSuccess: () => {
      refetchInbox();
      refetchSent();
      if (selectedMessage) {
        setSelectedMessage(null);
      }
    }
  });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedMessage(null);
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  const handleComposeMessage = () => {
    setShowCompose(true);
  };

  const handleCloseCompose = () => {
    setShowCompose(false);
  };

  const handleComposeSuccess = () => {
    setShowCompose(false);
    refetchSent();
  };

  const handleReplyMessage = (message) => {
    setReplyToMessage(message);
    setShowReply(true);
  };

  const handleCloseReply = () => {
    setShowReply(false);
    setReplyToMessage(null);
  };

  const handleReplySuccess = () => {
    setShowReply(false);
    setReplyToMessage(null);
    refetchSent();
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessageMutation.mutate(messageId);
    }
  };

  const getCurrentMessages = () => {
    return activeTab === 0 ? inboxMessages : sentMessages;
  };

  const getCurrentLoading = () => {
    return activeTab === 0 ? loadingInbox : loadingSent;
  };

  const getCurrentError = () => {
    return activeTab === 0 ? inboxError : sentError;
  };

  const getUnreadCount = () => {
    return inboxMessages.filter(msg => !msg.isRead).length;
  };

  if (selectedMessage) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <MessageThread
          message={selectedMessage}
          onBack={handleBackToList}
          onReply={handleReplyMessage}
          onDelete={handleDeleteMessage}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Messages
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleComposeMessage}
        >
          Compose Message
        </Button>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            icon={
              <Badge badgeContent={getUnreadCount()} color="primary">
                <InboxIcon />
              </Badge>
            }
            label="Inbox" 
            iconPosition="start"
          />
          <Tab 
            icon={<SendIcon />} 
            label="Sent" 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Error handling */}
      {getCurrentError() && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load messages: {getCurrentError().message}
        </Alert>
      )}

      {/* Message list */}
      <MessageList
        messages={getCurrentMessages()}
        loading={getCurrentLoading()}
        onMessageClick={handleMessageClick}
        onDeleteMessage={handleDeleteMessage}
        onReplyMessage={activeTab === 0 ? handleReplyMessage : null}
      />

      {/* Compose Message Dialog */}
      <Dialog 
        open={showCompose} 
        onClose={handleCloseCompose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="between" alignItems="center">
            Compose New Message
            <IconButton onClick={handleCloseCompose} sx={{ ml: 'auto' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <MessageForm
            onSuccess={handleComposeSuccess}
            onCancel={handleCloseCompose}
          />
        </DialogContent>
      </Dialog>

      {/* Reply Message Dialog */}
      <Dialog 
        open={showReply} 
        onClose={handleCloseReply}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="between" alignItems="center">
            Reply to Message
            <IconButton onClick={handleCloseReply} sx={{ ml: 'auto' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <MessageForm
            replyToMessage={replyToMessage}
            recipientId={replyToMessage?.sender?._id}
            recipientUser={replyToMessage?.sender}
            onSuccess={handleReplySuccess}
            onCancel={handleCloseReply}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Messages;
