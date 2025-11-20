/**
 * Shared validation utility functions
 * Provides consistent validation across the application
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password is required'] };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export const validateUsername = (username) => {
  const errors = [];
  
  if (!username || typeof username !== 'string') {
    return { isValid: false, errors: ['Username is required'] };
  }
  
  const trimmed = username.trim();
  
  if (trimmed.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (trimmed.length > 30) {
    errors.push('Username must not exceed 30 characters');
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid
 */
export const isValidURL = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validate form data object
 * @param {Object} formData - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = formData[field];
    
    // Required check
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = rule.requiredMessage || `${field} is required`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && !value.trim())) {
      return;
    }
    
    // Email validation
    if (rule.type === 'email' && !isValidEmail(value)) {
      errors[field] = rule.message || 'Invalid email format';
      return;
    }
    
    // Password validation
    if (rule.type === 'password') {
      const passwordValidation = validatePassword(value);
      if (!passwordValidation.isValid) {
        errors[field] = passwordValidation.errors[0] || 'Invalid password';
        return;
      }
    }
    
    // Username validation
    if (rule.type === 'username') {
      const usernameValidation = validateUsername(value);
      if (!usernameValidation.isValid) {
        errors[field] = usernameValidation.errors[0] || 'Invalid username';
        return;
      }
    }
    
    // URL validation
    if (rule.type === 'url' && !isValidURL(value)) {
      errors[field] = rule.message || 'Invalid URL format';
      return;
    }
    
    // Min length
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = rule.message || `${field} must be at least ${rule.minLength} characters`;
      return;
    }
    
    // Max length
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = rule.message || `${field} must not exceed ${rule.maxLength} characters`;
      return;
    }
    
    // Custom validator
    if (rule.validator && typeof rule.validator === 'function') {
      const customError = rule.validator(value, formData);
      if (customError) {
        errors[field] = customError;
        return;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  isValidEmail,
  validatePassword,
  validateUsername,
  isValidURL,
  validateForm
};

