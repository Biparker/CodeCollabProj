import React, { useMemo, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert, Button, Box, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Message as MessageIcon, Close as CloseIcon } from '@mui/icons-material';
import { useUsers } from '../hooks/users';
import { useProjects } from '../hooks/projects';
import MessageForm from '../components/messaging/MessageForm';

const Members = () => {
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users and projects using TanStack Query
  const { 
    data: users = [], 
    isLoading: usersLoading, 
    error: usersError,
    refetch: refetchUsers 
  } = useUsers();
  
  const { 
    data: projects = [], 
    isLoading: projectsLoading, 
    error: projectsError,
    refetch: refetchProjects 
  } = useProjects();

  const loading = usersLoading || projectsLoading;
  const error = usersError || projectsError;

  // Memoized helper: get projects for a user
  const getUserProjects = useMemo(() => {
    return (userId) => {
      return projects.filter(p => {
        // Handle both populated and unpopulated owner fields
        const ownerId = typeof p.owner === 'object' && p.owner !== null ? p.owner._id : p.owner;
        return (
          ownerId && ownerId.toString() === userId.toString()
        ) || (
          p.collaborators && p.collaborators.some(c =>
            (typeof c.userId === 'object' && c.userId !== null
              ? c.userId._id
              : c.userId
            )?.toString() === userId.toString()
          )
        );
      });
    };
  }, [projects]);

  const handleMessageUser = (user) => {
    setSelectedUser(user);
    setShowMessageForm(true);
  };

  const handleCloseMessageForm = () => {
    setShowMessageForm(false);
    setSelectedUser(null);
  };

  const handleMessageSent = () => {
    setShowMessageForm(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading members...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Error Loading Members
          </Typography>
          {error?.response?.data?.message || error?.message || 'Failed to load members data'}
        </Alert>
        <Button 
          variant="contained" 
          onClick={() => {
            refetchUsers();
            refetchProjects();
          }}
        >
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Members</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Availability</TableCell>
              <TableCell>Project Name(s)</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => {
              const userProjects = getUserProjects(user._id);
              return (
                <TableRow key={user._id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.skills && user.skills.length > 0
                      ? user.skills.join(', ')
                      : '—'}
                  </TableCell>
                  <TableCell>
                    {user.experience ? user.experience : '—'}
                  </TableCell>
                  <TableCell>
                    {user.availability ? user.availability : '—'}
                  </TableCell>
                  <TableCell>
                    {userProjects.length > 0 ? (
                      userProjects.map((p, idx) => (
                        <span key={p._id}>
                          <Typography
                            variant="h6"
                            component={RouterLink}
                            to={`/projects#${p._id}`}
                            style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}
                            gutterBottom
                          >
                            {p.title}
                          </Typography>
                          {idx < userProjects.length - 1 && ', '}
                        </span>
                      ))
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<MessageIcon />}
                      onClick={() => handleMessageUser(user)}
                      sx={{ minWidth: 'auto' }}
                    >
                      Message
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Message Form Dialog */}
      <Dialog 
        open={showMessageForm} 
        onClose={handleCloseMessageForm}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="between" alignItems="center">
            Send Message to {selectedUser?.username}
            <IconButton onClick={handleCloseMessageForm} sx={{ ml: 'auto' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <MessageForm
              recipientId={selectedUser._id}
              recipientUser={selectedUser}
              onSuccess={handleMessageSent}
              onCancel={handleCloseMessageForm}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Members; 