const { validationResult } = require('express-validator');
const User = require('../models/User');
const Message = require('../models/Message');
const { uploadToGridFS, downloadFromGridFS, deleteFromGridFS, getFileInfo } = require('../utils/gridfs');

// Get all users (public profiles)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ isProfilePublic: true })
      .select('-password -email')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      firstName,
      lastName,
      bio,
      skills,
      experience,
      location,
      timezone,
      availability,
      portfolioLinks,
      socialLinks,
      isProfilePublic
    } = req.body;
    
    const userId = req.user._id;

    // Build update object
    const updateFields = {};
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (bio !== undefined) updateFields.bio = bio;
    if (skills !== undefined) updateFields.skills = skills;
    if (experience !== undefined) updateFields.experience = experience;
    if (location !== undefined) updateFields.location = location;
    if (timezone !== undefined) updateFields.timezone = timezone;
    if (availability !== undefined) updateFields.availability = availability;
    if (portfolioLinks !== undefined) updateFields.portfolioLinks = portfolioLinks;
    if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;
    if (isProfilePublic !== undefined) updateFields.isProfilePublic = isProfilePublic;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Search users by skills, name, or other criteria
const searchUsers = async (req, res) => {
  try {
    const { 
      query, 
      skills, 
      experience, 
      availability, 
      location 
    } = req.query;
    
    const searchCriteria = { isProfilePublic: true };
    
    // Text search
    if (query) {
      searchCriteria.$or = [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } },
        { bio: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      searchCriteria.skills = { $in: skillsArray };
    }
    
    // Experience filter
    if (experience) {
      searchCriteria.experience = experience;
    }
    
    // Availability filter
    if (availability) {
      searchCriteria.availability = availability;
    }
    
    // Location filter
    if (location) {
      searchCriteria.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(searchCriteria)
      .select('-password -email')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error searching users', error: error.message });
  }
};

// Send a message to another user
const sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, subject, content } = req.body;
    const senderId = req.user._id;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if recipient has public profile
    if (!recipient.isProfilePublic) {
      return res.status(403).json({ message: 'Cannot send message to private profile' });
    }

    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      subject,
      content
    });

    await message.save();
    await message.populate('sender', 'username firstName lastName');
    await message.populate('recipient', 'username firstName lastName');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
};

// Get user's messages (inbox)
const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'inbox' } = req.query;

    let query;
    if (type === 'sent') {
      query = { sender: userId };
    } else {
      query = { recipient: userId };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username firstName lastName')
      .populate('recipient', 'username firstName lastName')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findOneAndUpdate(
      { _id: messageId, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error marking message as read', error: error.message });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Find and delete message if user is sender or recipient
    const message = await Message.findOneAndDelete({
      _id: messageId,
      $or: [
        { sender: userId },
        { recipient: userId }
      ]
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found or access denied' });
    }

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
};

// Get user's own profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Upload user avatar (using Railway volume filesystem storage)
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user._id;
    const fs = require('fs');
    const path = require('path');

    // Get current user to check for existing avatar
    const currentUser = await User.findById(userId);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar file if it exists (and it's a file path, not GridFS ID)
    const oldAvatarPath = currentUser.profileImage;
    if (oldAvatarPath && oldAvatarPath.startsWith('/uploads/')) {
      const uploadPath = global.uploadPath || path.join(__dirname, '../uploads');
      const oldFilePath = path.join(uploadPath, path.basename(oldAvatarPath));
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`🗑️  Deleted old avatar: ${oldFilePath}`);
        }
      } catch (deleteError) {
        console.warn('Could not delete old avatar:', deleteError.message);
      }
    }

    // Store the file path (e.g., /uploads/avatar-123456.jpg)
    const avatarPath = `/uploads/${req.file.filename}`;
    console.log(`✅ Avatar saved successfully: ${avatarPath}`);

    // Update user with new avatar path
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: avatarPath },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Avatar uploaded successfully',
      profileImage: user.profileImage,
      avatar: avatarPath,
      user
    });
  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    res.status(500).json({ message: 'Error uploading avatar', error: error.message });
  }
};

// Helper function to get file extension
const getExtension = (filename) => {
  const lastDot = filename.lastIndexOf('.');
  return lastDot !== -1 ? filename.substring(lastDot) : '';
};

// Delete user avatar (using GridFS)
const deleteAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const fs = require('fs');
    const path = require('path');

    // Get current user to find existing avatar
    const currentUser = await User.findById(userId);

    // Delete avatar file if it exists (and it's a file path)
    if (currentUser && currentUser.profileImage && currentUser.profileImage.startsWith('/uploads/')) {
      const uploadPath = global.uploadPath || path.join(__dirname, '../uploads');
      const filePath = path.join(uploadPath, path.basename(currentUser.profileImage));
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Deleted avatar: ${filePath}`);
        }
      } catch (deleteError) {
        console.warn('Could not delete avatar file:', deleteError.message);
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage: null },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Avatar deleted successfully',
      user
    });
  } catch (error) {
    console.error('❌ Error deleting avatar:', error);
    res.status(500).json({ message: 'Error deleting avatar', error: error.message });
  }
};

// Get avatar from GridFS
const getAvatar = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Validate fileId format (MongoDB ObjectId is 24 hex chars)
    if (!fileId || !/^[0-9a-fA-F]{24}$/.test(fileId)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }

    // Get file info to set correct content type
    const fileInfo = await getFileInfo(fileId);

    if (!fileInfo) {
      return res.status(404).json({ message: 'Avatar not found' });
    }

    // Set response headers
    const headers = {
      'Content-Type': fileInfo.contentType || 'image/jpeg',
      'Cache-Control': 'public, max-age=31536000', // 1 year cache
      'X-Content-Type-Options': 'nosniff',
    };

    // Allow cross-origin access in development (frontend on different port)
    if (process.env.NODE_ENV !== 'production') {
      headers['Cross-Origin-Resource-Policy'] = 'cross-origin';
    }

    res.set(headers);

    // Stream the file from GridFS
    const downloadStream = downloadFromGridFS(fileId);

    downloadStream.on('error', (error) => {
      console.error('GridFS download error:', error);
      if (!res.headersSent) {
        // Reset Content-Type for JSON error response
        res.set('Content-Type', 'application/json');
        res.status(500).json({ message: 'Error downloading avatar' });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching avatar', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  searchUsers,
  sendMessage,
  getMessages,
  markMessageAsRead,
  deleteMessage,
  getMyProfile,
  uploadAvatar,
  deleteAvatar,
  getAvatar
}; 