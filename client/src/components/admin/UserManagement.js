import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as UnblockIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useAdminUsers, useAdminUserMutations } from '../../hooks/admin';

const UserRow = ({ user, onEdit, onView, onSuspend, onUnsuspend, onDelete }) => {
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'moderator': return 'warning';
      default: return 'primary';
    }
  };

  const getStatusColor = (user) => {
    if (user.isSuspended) return 'error';
    if (!user.isActive) return 'default';
    return 'success';
  };

  const getStatusLabel = (user) => {
    if (user.isSuspended) return 'Suspended';
    if (!user.isActive) return 'Inactive';
    return 'Active';
  };

  return (
    <TableRow hover>
      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {user.username}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            {user.email}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip 
          label={user.role} 
          color={getRoleColor(user.role)} 
          size="small"
          sx={{ textTransform: 'capitalize' }}
        />
      </TableCell>
      <TableCell>
        <Chip 
          label={getStatusLabel(user)} 
          color={getStatusColor(user)} 
          size="small"
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2">
          {new Date(user.createdAt).toLocaleDateString()}
        </Typography>
      </TableCell>
      <TableCell>
        <Box display="flex" gap={1}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => onView(user)}>
              <ViewIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Edit Role">
            <IconButton size="small" onClick={() => onEdit(user)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          
          {user.isSuspended ? (
            <Tooltip title="Unsuspend">
              <IconButton 
                size="small" 
                color="success"
                onClick={() => onUnsuspend(user._id)}
              >
                <UnblockIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Suspend">
              <IconButton 
                size="small" 
                color="warning"
                onClick={() => onSuspend(user)}
              >
                <BlockIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {user.role !== 'admin' && (
            <Tooltip title="Delete">
              <IconButton 
                size="small" 
                color="error"
                onClick={() => onDelete(user)}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
};

const EditRoleDialog = ({ open, user, onClose, onSave }) => {
  const [role, setRole] = useState(user?.role || 'user');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(user._id, { role });
      onClose();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User Role</DialogTitle>
      <DialogContent>
        <Box py={2}>
          <Typography variant="body2" gutterBottom>
            User: <strong>{user?.username} ({user?.email})</strong>
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="moderator">Moderator</MenuItem>
              <MenuItem value="admin">Administrator</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SuspendDialog = ({ open, user, onClose, onSave }) => {
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!reason.trim()) return;
    
    setLoading(true);
    try {
      const suspensionData = { reason };
      if (duration) {
        suspensionData.duration = parseInt(duration) * 24 * 60 * 60 * 1000; // Convert days to ms
      }
      await onSave(user._id, suspensionData);
      onClose();
      setReason('');
      setDuration('');
    } catch (error) {
      console.error('Failed to suspend user:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Suspend User</DialogTitle>
      <DialogContent>
        <Box py={2}>
          <Typography variant="body2" gutterBottom>
            User: <strong>{user?.username} ({user?.email})</strong>
          </Typography>
          
          <TextField
            label="Suspension Reason"
            fullWidth
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 2 }}
            required
          />
          
          <TextField
            label="Duration (days)"
            type="number"
            fullWidth
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            sx={{ mt: 2 }}
            helperText="Leave empty for indefinite suspension"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained"
          color="warning"
          disabled={loading || !reason.trim()}
        >
          {loading ? <CircularProgress size={20} /> : 'Suspend User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const UserManagement = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [suspendDialog, setSuspendDialog] = useState({ open: false, user: null });

  const params = {
    page: page + 1,
    limit: rowsPerPage,
    ...(search && { search }),
    ...(roleFilter !== 'all' && { role: roleFilter }),
    ...(statusFilter && { status: statusFilter })
  };

  const { data, isLoading, error } = useAdminUsers(params);
  const { updateUserRole, suspendUser, unsuspendUser, deleteUser } = useAdminUserMutations();

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditRole = (user) => {
    setEditDialog({ open: true, user });
  };

  const handleSuspendUser = (user) => {
    setSuspendDialog({ open: true, user });
  };

  const handleUpdateRole = async (userId, roleData) => {
    await updateUserRole.mutateAsync({ userId, roleData });
  };

  const handleSuspend = async (userId, suspensionData) => {
    await suspendUser.mutateAsync({ userId, suspensionData });
  };

  const handleUnsuspend = async (userId) => {
    await unsuspendUser.mutateAsync(userId);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to deactivate ${user.username}?`)) {
      await deleteUser.mutateAsync({ userId: user._id, permanent: false });
    }
  };

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">
          Failed to load users: {error?.message || 'Unknown error'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
          <TextField
            label="Search users"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="moderator">Moderator</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="suspended">Suspended</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                data?.users?.map((user) => (
                  <UserRow
                    key={user._id}
                    user={user}
                    onEdit={handleEditRole}
                    onView={(user) => console.log('View user:', user)} // TODO: Implement user details view
                    onSuspend={handleSuspendUser}
                    onUnsuspend={handleUnsuspend}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {data?.pagination && (
          <TablePagination
            component="div"
            count={data.pagination.total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        )}
      </Paper>

      {/* Dialogs */}
      <EditRoleDialog
        open={editDialog.open}
        user={editDialog.user}
        onClose={() => setEditDialog({ open: false, user: null })}
        onSave={handleUpdateRole}
      />
      
      <SuspendDialog
        open={suspendDialog.open}
        user={suspendDialog.user}
        onClose={() => setSuspendDialog({ open: false, user: null })}
        onSave={handleSuspend}
      />
    </Box>
  );
};

export default UserManagement;
