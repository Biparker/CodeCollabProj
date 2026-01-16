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
const { passwordValidator } = require('../utils/passwordValidator');
const { VALIDATION_LIMITS } = require('../config/constants');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .custom(passwordValidator)
    .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'),
  body('username')
    .isLength({ min: VALIDATION_LIMITS.USERNAME_MIN_LENGTH, max: VALIDATION_LIMITS.USERNAME_MAX_LENGTH })
    .withMessage(`Username must be between ${VALIDATION_LIMITS.USERNAME_MIN_LENGTH} and ${VALIDATION_LIMITS.USERNAME_MAX_LENGTH} characters`)
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
    .custom(passwordValidator)
    .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .custom(passwordValidator)
    .withMessage('New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character')
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

// Diagnostic endpoint to check uploads directory (temporary)
router.get('/debug-uploads', auth, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const uploadPath = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadPath)) {
      return res.json({ error: 'Uploads directory does not exist', path: uploadPath });
    }
    
    const files = fs.readdirSync(uploadPath);
    res.json({ 
      uploadPath, 
      fileCount: files.length,
      files: files.slice(0, 20), // Show first 20 files
      lookingFor: 'avatar-1768494999781-537473339.png',
      found: files.includes('avatar-1768494999781-537473339.png')
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

module.exports = router; 