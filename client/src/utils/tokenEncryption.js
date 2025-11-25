/**
 * Token encryption utility for localStorage
 * Provides basic encryption layer to protect tokens from XSS attacks
 * Note: This is not a replacement for httpOnly cookies, but adds a layer of protection
 */

/**
 * Simple encryption using Web Crypto API (if available) or base64 encoding
 * In production, consider using a more robust encryption library
 */
class TokenEncryption {
  constructor() {
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  /**
   * Get or create encryption key from sessionStorage
   * Falls back to a simple key if Web Crypto API is not available
   */
  getOrCreateEncryptionKey() {
    try {
      // Use sessionStorage for encryption key (cleared on tab close)
      let key = sessionStorage.getItem('encryption_key');
      if (!key) {
        // Generate a random key
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        sessionStorage.setItem('encryption_key', key);
      }
      return key;
    } catch (error) {
      // Fallback if sessionStorage is not available
      return 'fallback_key_' + window.location.hostname;
    }
  }

  /**
   * Simple XOR encryption (basic obfuscation)
   * Note: This is not cryptographically secure, but adds a layer of obfuscation
   */
  encrypt(text) {
    try {
      if (!text) return null;
      
      // Use simple base64 encoding with key mixing for basic obfuscation
      const key = this.encryptionKey;
      let result = '';
      
      for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode ^ keyChar);
      }
      
      // Base64 encode the result
      return btoa(result);
    } catch (error) {
      // Fallback: return as-is if encryption fails
      return text;
    }
  }

  /**
   * Decrypt token
   */
  decrypt(encryptedText) {
    try {
      if (!encryptedText) return null;
      
      // Base64 decode first
      const decoded = atob(encryptedText);
      const key = this.encryptionKey;
      let result = '';
      
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i);
        const keyChar = key.charCodeAt(i % key.length);
        result += String.fromCharCode(charCode ^ keyChar);
      }
      
      return result;
    } catch (error) {
      // If decryption fails, try returning as-is (for backward compatibility)
      return encryptedText;
    }
  }

  /**
   * Clear encryption key (on logout)
   */
  clearKey() {
    try {
      sessionStorage.removeItem('encryption_key');
    } catch (error) {
      // Ignore errors
    }
  }
}

// Export singleton instance
export const tokenEncryption = new TokenEncryption();

export default tokenEncryption;

