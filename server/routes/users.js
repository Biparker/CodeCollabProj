const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  updateProfile, 
  searchUsers,
  sendMessage,
  getMessages,
  markMessageAsRead,
  getMyProfile
} = require('../controllers/userController');
const { profileUpdateValidator, messageValidator } = require('../middleware/validators');
const auth = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (public profiles)
// @access  Public
router.get('/', getAllUsers);

// @route   GET /api/users/search
// @desc    Search users by skills or name
// @access  Public
router.get('/search', searchUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', getUserById);

// @route   GET /api/users/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/profile/me', auth, getMyProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, profileUpdateValidator, updateProfile);

// @route   POST /api/users/messages
// @desc    Send a message to another user
// @access  Private
router.post('/messages', auth, messageValidator, sendMessage);

// @route   GET /api/users/messages
// @desc    Get user's messages (inbox/sent)
// @access  Private
router.get('/messages', auth, getMessages);

// @route   PUT /api/users/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/messages/:messageId/read', auth, markMessageAsRead);

module.exports = router; 