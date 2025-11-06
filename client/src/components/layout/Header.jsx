import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
} from '@mui/material';
import { 
  AccountCircle, 
  Menu as MenuIcon,
  Message as MessageIcon 
} from '@mui/icons-material';
import { useAuth, useLogout } from '../../hooks/auth';
import { useMessages } from '../../hooks/users/useMessaging';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const logoutMutation = useLogout();
  
  // Get unread message count
  const { data: inboxMessages = [] } = useMessages('inbox', {
    enabled: isAuthenticated, // Only fetch if authenticated
  });
  const unreadCount = inboxMessages.filter(msg => !msg.isRead).length;
  
  console.log('Header isAuthenticated (TanStack Query):', isAuthenticated, 'user:', user);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login');
        handleClose();
      },
    });
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <img
            src="/CC-Logo-ColorBg.png"
            alt="Casual Coding Meetup Group Logo"
            style={{
              height: '40px',
              width: 'auto',
            }}
          />
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              CodeCollabProj
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                lineHeight: 1,
                opacity: 0.9,
              }}
            >
              Casual Coding Meetup Group
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/projects"
              >
                Projects
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/members"
              >
                Members
              </Button>
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/messages"
                title="Messages"
              >
                <Badge badgeContent={unreadCount} color="error">
                  <MessageIcon />
                </Badge>
              </IconButton>
              <Button
                color="inherit"
                component={RouterLink}
                to="/dashboard"
              >
                Dashboard
              </Button>
              {/* Admin Panel Link - only show for admins and moderators */}
              {(user?.role === 'admin' || user?.role === 'moderator') && (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin"
                  sx={{ 
                    bgcolor: 'error.main',
                    '&:hover': { bgcolor: 'error.dark' },
                    borderRadius: 1,
                    px: 2
                  }}
                >
                  Admin
                </Button>
              )}
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                {user?.avatar ? (
                  <Avatar
                    src={user.avatar}
                    alt={user.username}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem component={RouterLink} to="/profile" onClick={handleClose}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/projects">
                Projects
              </Button>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 