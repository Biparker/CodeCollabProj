const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const { sendVerificationEmail } = require('../services/emailService');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      username
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    console.log(`🔐 Generated verification token for ${email}: ${verificationToken}`);

    await user.save();
    console.log(`👤 User saved to database: ${user._id}`);

    // Send verification email
    console.log(`📧 Attempting to send verification email to: ${email}`);
    const emailSent = await sendVerificationEmail(email, verificationToken, username);

    if (!emailSent) {
      console.log('❌ Failed to send verification email');
      return res.status(201).json({
        message: 'Account created successfully, but verification email could not be sent. Please contact support.',
        user: {
          id: user._id,
          email: user.email,
          username: user.username
        }
      });
    }

    console.log('✅ Verification email sent successfully');
    res.status(201).json({
      message: 'Account created successfully. Please check your email to verify your account.',
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({ 
        message: 'Please verify your email address before logging in. Check your inbox for a verification email.',
        needsVerification: true
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log('🔍 VERIFY EMAIL DEBUG:');
    console.log('- Token received:', token);
    console.log('- Token length:', token ? token.length : 'null');
    console.log('- Current timestamp:', Date.now());

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    console.log('- User found:', !!user);
    if (user) {
      console.log('- User email:', user.email);
      console.log('- Token expires at:', user.emailVerificationExpires);
      console.log('- Time until expiry:', user.emailVerificationExpires - Date.now(), 'ms');
    } else {
      // Check if user exists with this token but expired
      const expiredUser = await User.findOne({ emailVerificationToken: token });
      if (expiredUser) {
        console.log('- Found user with EXPIRED token');
        console.log('- Expired at:', expiredUser.emailVerificationExpires);
        console.log('- Current time:', Date.now());
      } else {
        console.log('- No user found with this token at all');
      }
    }

    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid or expired verification token' 
      });
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ 
      message: 'Email verified successfully. You can now log in to your account.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error: error.message });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, user.username);

    if (!emailSent) {
      return res.status(500).json({ 
        message: 'Failed to send verification email. Please try again later.' 
      });
    }

    res.json({ 
      message: 'Verification email sent successfully. Please check your inbox.' 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sending verification email', error: error.message });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  getCurrentUser
}; 