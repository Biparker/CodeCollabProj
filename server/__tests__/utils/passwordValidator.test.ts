/**
 * Password validator tests
 */

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
}

interface PasswordValidatorModule {
  validatePassword: (password: string | null | undefined) => PasswordValidationResult;
  passwordValidator: (value: string) => boolean;
}

const { validatePassword, passwordValidator } =
  require('../../utils/passwordValidator') as PasswordValidatorModule;

describe('Password Validator', () => {
  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject passwords that are too short', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject passwords without required characters', () => {
      const result = validatePassword('lowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should handle null/undefined passwords', () => {
      const result1 = validatePassword(null);
      const result2 = validatePassword(undefined);
      expect(result1.isValid).toBe(false);
      expect(result2.isValid).toBe(false);
    });
  });

  describe('passwordValidator', () => {
    it('should pass for valid passwords', () => {
      expect(() => passwordValidator('ValidPass123!')).not.toThrow();
    });

    it('should throw for invalid passwords', () => {
      expect(() => passwordValidator('weak')).toThrow();
    });
  });
});
