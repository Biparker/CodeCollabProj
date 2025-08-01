const { body } = require('express-validator');

const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 2 })
    .withMessage('Username must be at least 2 characters long')
];

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const profileUpdateValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must not exceed 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Skill cannot be empty'),
  body('experience')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
    .withMessage('Invalid experience level'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location must not exceed 100 characters'),
  body('timezone')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Timezone must not exceed 50 characters'),
  body('availability')
    .optional()
    .isIn(['full-time', 'part-time', 'weekends', 'evenings', 'flexible'])
    .withMessage('Invalid availability'),
  body('portfolioLinks')
    .optional()
    .isArray()
    .withMessage('Portfolio links must be an array'),
  body('portfolioLinks.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Portfolio link name is required'),
  body('portfolioLinks.*.url')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!value.match(/^https?:\/\/.+/)) {
          throw new Error('Portfolio link must be a valid URL');
        }
      }
      return true;
    })
    .withMessage('Portfolio link must be a valid URL'),
  body('socialLinks.github')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!value.match(/^https?:\/\/.+/)) {
          throw new Error('GitHub URL must be a valid URL');
        }
      }
      return true;
    })
    .withMessage('GitHub URL must be a valid URL'),
  body('socialLinks.linkedin')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!value.match(/^https?:\/\/.+/)) {
          throw new Error('LinkedIn URL must be a valid URL');
        }
      }
      return true;
    })
    .withMessage('LinkedIn URL must be a valid URL'),
  body('socialLinks.twitter')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!value.match(/^https?:\/\/.+/)) {
          throw new Error('Twitter URL must be a valid URL');
        }
      }
      return true;
    })
    .withMessage('Twitter URL must be a valid URL'),
  body('socialLinks.website')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!value.match(/^https?:\/\/.+/)) {
          throw new Error('Website URL must be a valid URL');
        }
      }
      return true;
    })
    .withMessage('Website URL must be a valid URL'),
  body('isProfilePublic')
    .optional()
    .isBoolean()
    .withMessage('Profile visibility must be a boolean')
];

const projectValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('technologies')
    .optional()
    .custom((value) => {
      if (value) {
        try {
          const parsed = JSON.parse(value);
          if (!Array.isArray(parsed)) {
            throw new Error('Technologies must be an array');
          }
          // Allow empty array for technologies
        } catch (e) {
          throw new Error('Invalid technologies format');
        }
      }
      return true;
    }),
  body('githubUrl')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!value.match(/^https?:\/\/.+/)) {
          throw new Error('GitHub URL must be a valid URL');
        }
      }
      return true;
    })
    .withMessage('GitHub URL must be a valid URL'),
  body('liveUrl')
    .optional()
    .trim()
    .custom((value) => {
      if (value && value.trim() !== '') {
        if (!value.match(/^https?:\/\/.+/)) {
          throw new Error('Live URL must be a valid URL');
        }
      }
      return true;
    })
    .withMessage('Live URL must be a valid URL'),
  body('requiredSkills')
    .optional()
    .isArray()
    .withMessage('Required skills must be an array'),
  body('requiredSkills.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Skill cannot be empty'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Tag cannot be empty'),
  body('resources')
    .optional()
    .isArray()
    .withMessage('Resources must be an array'),
  body('resources.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Resource name is required'),
  body('resources.*.url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Resource URL must be valid'),
  body('status')
    .optional()
    .isIn(['ideation', 'in_progress', 'completed'])
    .withMessage('Invalid project status')
];

const messageValidator = [
  body('recipientId')
    .notEmpty()
    .withMessage('Recipient ID is required')
    .isMongoId()
    .withMessage('Invalid recipient ID'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Message subject is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Subject must be between 1 and 100 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

const commentValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
];

module.exports = {
  registerValidator,
  loginValidator,
  profileUpdateValidator,
  projectValidator,
  commentValidator,
  messageValidator
}; 