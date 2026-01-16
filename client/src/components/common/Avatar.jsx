import React from 'react';
import { Avatar as MuiAvatar, Box } from '@mui/material';

// Generate a consistent color from a string (username/email)
const stringToColor = (string) => {
  if (!string) return '#1976d2';

  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a hue between 0-360
  const hue = Math.abs(hash % 360);
  // Use consistent saturation and lightness for pleasant colors
  return `hsl(${hue}, 65%, 45%)`;
};

// Get initials from user object
const getInitials = (user) => {
  if (!user) return '?';

  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const username = user.username || '';

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (firstName) {
    return firstName[0].toUpperCase();
  }

  if (username) {
    return username[0].toUpperCase();
  }

  return '?';
};

// Size presets
const sizeMap = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  xxl: 120,
};

const Avatar = ({
  user,
  size = 'md',
  showOnlineStatus = false,
  onClick,
  sx = {},
  ...props
}) => {
  const dimension = typeof size === 'number' ? size : sizeMap[size] || sizeMap.md;
  const fontSize = dimension * 0.4;

  const initials = getInitials(user);
  const bgColor = stringToColor(user?.username || user?.email || '');

  // Construct the full image URL
  const getImageUrl = () => {
    console.log('🔍 Avatar component - user object:', user);
    console.log('🔍 Avatar component - profileImage:', user?.profileImage);
    
    if (!user?.profileImage) {
      console.log('❌ No profileImage found');
      return null;
    }

    // If it's already a full URL, use it directly
    if (user.profileImage.startsWith('http')) {
      console.log('✅ Using full URL:', user.profileImage);
      return user.profileImage;
    }

    // Get the API base URL
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    console.log('🔍 API URL:', apiUrl);

    // Check if profileImage is a GridFS ObjectId (24 hex characters)
    // or an old-style file path (starts with /uploads/)
    if (/^[0-9a-fA-F]{24}$/.test(user.profileImage)) {
      // GridFS: use the avatar endpoint
      const url = `${apiUrl}/users/avatar/${user.profileImage}`;
      console.log('✅ Using GridFS URL:', url);
      return url;
    }

    // Legacy: old file path format (e.g., /uploads/avatar-xxx.png)
    // Extract base URL by removing /api suffix if present
    let baseUrl = apiUrl;
    if (apiUrl.endsWith('/api')) {
      baseUrl = apiUrl.substring(0, apiUrl.length - 4);
    }
    const finalUrl = `${baseUrl}${user.profileImage}`;
    console.log('🔧 Base URL after cleanup:', baseUrl);
    console.log('✅ Using legacy file URL:', finalUrl);
    return finalUrl;
  };

  const imageUrl = getImageUrl();
  console.log('🖼️ Final image URL:', imageUrl);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        ...sx,
      }}
    >
      <MuiAvatar
        src={imageUrl}
        alt={user?.username || 'User'}
        onClick={onClick}
        sx={{
          width: dimension,
          height: dimension,
          fontSize: fontSize,
          bgcolor: bgColor,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': onClick ? {
            transform: 'scale(1.05)',
            boxShadow: 2,
          } : {},
        }}
        {...props}
      >
        {initials}
      </MuiAvatar>

      {showOnlineStatus && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: dimension * 0.25,
            height: dimension * 0.25,
            bgcolor: 'success.main',
            borderRadius: '50%',
            border: '2px solid white',
          }}
        />
      )}
    </Box>
  );
};

export default Avatar;
