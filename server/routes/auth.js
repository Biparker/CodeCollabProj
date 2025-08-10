const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  changePassword,
  getActiveSessions,
  verifyEmail,
  resendVerificationEmail,
  getCurrentUser,
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPassword
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const resendVerificationValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
];

const requestPasswordResetValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password must be different from current password');
      }
      return true;
    })
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', auth, logout);
router.post('/logout-all', auth, logoutAll);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationValidation, resendVerificationEmail);
router.get('/me', auth, getCurrentUser);

// Session management routes
router.get('/sessions', auth, getActiveSessions);
router.put('/change-password', auth, changePasswordValidation, changePassword);

// Password reset routes
router.post('/request-password-reset', requestPasswordResetValidation, requestPasswordReset);
router.get('/verify-password-reset/:token', verifyPasswordResetToken);
router.post('/reset-password', resetPasswordValidation, resetPassword);

module.exports = router; 