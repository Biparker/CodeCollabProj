/**
 * Validation utility tests
 */

import {
  isValidEmail,
  validatePassword,
  validateUsername,
  isValidURL,
  validateForm,
  ValidationRules,
} from '../../utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject passwords without uppercase', () => {
      const result = validatePassword('lowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without lowercase', () => {
      const result = validatePassword('UPPERCASE123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject passwords without special characters', () => {
      const result = validatePassword('NoSpecial123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  describe('validateUsername', () => {
    it('should validate correct usernames', () => {
      const result = validateUsername('validuser123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject usernames that are too short', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters long');
    });

    it('should reject usernames that are too long', () => {
      const result = validateUsername('a'.repeat(31));
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must not exceed 30 characters');
    });

    it('should reject usernames with invalid characters', () => {
      const result = validateUsername('user-name');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Username can only contain letters, numbers, and underscores'
      );
    });
  });

  describe('isValidURL', () => {
    it('should validate correct URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('http://example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidURL('not-a-url')).toBe(false);
      expect(isValidURL('javascript:alert(1)')).toBe(false);
      expect(isValidURL('')).toBe(false);
      expect(isValidURL(null)).toBe(false);
    });
  });

  describe('validateForm', () => {
    interface TestFormData {
      email: string;
      password: string;
      username: string;
      [key: string]: unknown;
    }

    it('should validate form with correct data', () => {
      const formData: TestFormData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        username: 'testuser',
      };

      const rules: ValidationRules<TestFormData> = {
        email: { type: 'email', required: true },
        password: { type: 'password', required: true },
        username: { type: 'username', required: true },
      };

      const result = validateForm(formData, rules);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return errors for invalid form data', () => {
      const formData: TestFormData = {
        email: 'invalid-email',
        password: 'weak',
        username: 'ab',
      };

      const rules: ValidationRules<TestFormData> = {
        email: { type: 'email', required: true },
        password: { type: 'password', required: true },
        username: { type: 'username', required: true },
      };

      const result = validateForm(formData, rules);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });
});
