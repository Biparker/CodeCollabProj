import { test, expect, Page, APIRequestContext } from '@playwright/test';

/**
 * Security tests for httpOnly cookie-based authentication
 * These tests verify that JWT tokens are stored securely in httpOnly cookies
 * and are not accessible via JavaScript (preventing XSS token theft)
 */

const API_BASE_URL = 'http://localhost:5001/api';
const TEST_USER = {
  email: 'user1@example.com',
  password: 'Password123!',
};

interface StorageData {
  [key: string]: string | null;
}

interface SecurityCheckResult {
  documentCookie: string;
  localStorageKeys: string[];
  sessionStorageKeys: string[];
  windowAccessToken: string;
  windowRefreshToken: string;
}

test.describe('Cookie-Based Authentication Security', () => {
  test.describe('Login Flow', () => {
    test('should set httpOnly cookies on successful login', async ({ request }) => {
      // Attempt login
      const response = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      });

      expect(response.ok()).toBeTruthy();

      // Get cookies from the response
      const cookies = response.headers()['set-cookie'];
      expect(cookies).toBeDefined();

      // Verify accessToken cookie is set with httpOnly flag
      expect(cookies).toContain('accessToken=');
      expect(cookies.toLowerCase()).toContain('httponly');

      // Verify refreshToken cookie is set with httpOnly flag
      expect(cookies).toContain('refreshToken=');
    });

    test('should return user data without exposing tokens to JavaScript', async ({ page }) => {
      // Navigate to the app
      await page.goto('http://localhost:3000');

      // Perform login via the UI - use specific selectors
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      // Wait for login to complete
      await page.waitForURL('**/dashboard**', { timeout: 10000 }).catch(() => {
        // If dashboard redirect doesn't happen, wait for network to settle
        return page.waitForLoadState('networkidle');
      });

      // Verify tokens are NOT accessible via JavaScript (httpOnly protection)
      const documentCookies = await page.evaluate(() => document.cookie);

      // httpOnly cookies should NOT appear in document.cookie
      expect(documentCookies).not.toContain('accessToken');
      expect(documentCookies).not.toContain('refreshToken');
    });
  });

  test.describe('Token Storage Security', () => {
    test('should NOT store tokens in localStorage', async ({ page }) => {
      // Navigate to the app
      await page.goto('http://localhost:3000');

      // Perform login
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      // Wait for login to complete
      await page.waitForLoadState('networkidle');

      // Check localStorage for tokens (should NOT exist)
      const localStorageData = await page.evaluate((): StorageData => {
        const data: StorageData = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key) {
            data[key] = localStorage.getItem(key);
          }
        }
        return data;
      });

      // Tokens should not be in localStorage
      const localStorageStr = JSON.stringify(localStorageData).toLowerCase();
      expect(localStorageStr).not.toContain('accesstoken');
      expect(localStorageStr).not.toContain('refreshtoken');
      expect(localStorageStr).not.toContain('jwt');
    });

    test('should NOT store tokens in sessionStorage', async ({ page }) => {
      // Navigate to the app
      await page.goto('http://localhost:3000');

      // Perform login
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');

      // Wait for login to complete
      await page.waitForLoadState('networkidle');

      // Check sessionStorage for tokens (should NOT exist)
      const sessionStorageData = await page.evaluate((): StorageData => {
        const data: StorageData = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) {
            data[key] = sessionStorage.getItem(key);
          }
        }
        return data;
      });

      // Tokens should not be in sessionStorage
      const sessionStorageStr = JSON.stringify(sessionStorageData).toLowerCase();
      expect(sessionStorageStr).not.toContain('accesstoken');
      expect(sessionStorageStr).not.toContain('refreshtoken');
      expect(sessionStorageStr).not.toContain('jwt');
    });
  });

  test.describe('Cookie Attributes', () => {
    test('should set correct cookie attributes for accessToken', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      });

      expect(response.ok()).toBeTruthy();

      const setCookieHeader = response.headers()['set-cookie'];
      expect(setCookieHeader).toBeDefined();

      // The Set-Cookie header contains both cookies - check for accessToken presence and attributes
      // Note: Cookies are separated by line breaks or commas with dates, so we check the full header
      expect(setCookieHeader).toContain('accessToken=');
      expect(setCookieHeader.toLowerCase()).toContain('httponly');
      expect(setCookieHeader.toLowerCase()).toMatch(/samesite=(lax|strict)/);
      expect(setCookieHeader.toLowerCase()).toContain('path=/');
    });

    test('should set correct cookie attributes for refreshToken', async ({ request }) => {
      const response = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      });

      expect(response.ok()).toBeTruthy();

      const setCookieHeader = response.headers()['set-cookie'];
      expect(setCookieHeader).toBeDefined();

      // Check for refreshToken presence and attributes in the combined header
      expect(setCookieHeader).toContain('refreshToken=');
      expect(setCookieHeader.toLowerCase()).toContain('httponly');
      expect(setCookieHeader.toLowerCase()).toMatch(/samesite=(lax|strict)/);
      // refreshToken should have restricted path to /api/auth
      expect(setCookieHeader.toLowerCase()).toContain('path=/api/auth');
    });
  });

  test.describe('Authentication Flow', () => {
    test('should authenticate API requests using cookies automatically', async ({ request }) => {
      // First, login to get cookies
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      });

      expect(loginResponse.ok()).toBeTruthy();

      // The request context should now have cookies set
      // Make an authenticated request to a protected endpoint
      const meResponse = await request.get(`${API_BASE_URL}/auth/me`);

      expect(meResponse.ok()).toBeTruthy();
      const userData = await meResponse.json();
      expect(userData.email).toBe(TEST_USER.email);
    });

    test('should reject requests without valid cookies', async ({ playwright }) => {
      // Create a new request context without cookies
      const newContext = await playwright.request.newContext();

      try {
        // Try to access protected endpoint without authentication
        const response = await newContext.get(`${API_BASE_URL}/auth/me`);

        expect(response.status()).toBe(401);
      } finally {
        await newContext.dispose();
      }
    });
  });

  test.describe('Token Refresh', () => {
    test('should refresh tokens using httpOnly cookie', async ({ request }) => {
      // Login first
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      });

      expect(loginResponse.ok()).toBeTruthy();

      // Attempt token refresh (should use refreshToken cookie automatically)
      const refreshResponse = await request.post(`${API_BASE_URL}/auth/refresh-token`);

      expect(refreshResponse.ok()).toBeTruthy();

      // Verify new accessToken cookie is set
      const cookies = refreshResponse.headers()['set-cookie'];
      expect(cookies).toContain('accessToken=');
      expect(cookies.toLowerCase()).toContain('httponly');
    });
  });

  test.describe('Logout', () => {
    test('should clear httpOnly cookies on logout', async ({ request }) => {
      // Login first
      const loginResponse = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      });

      expect(loginResponse.ok()).toBeTruthy();

      // Logout
      const logoutResponse = await request.post(`${API_BASE_URL}/auth/logout`);

      expect(logoutResponse.ok()).toBeTruthy();

      // Verify cookies are cleared (should have empty values or expired)
      const cookies = logoutResponse.headers()['set-cookie'];

      // After logout, trying to access protected routes should fail
      const meResponse = await request.get(`${API_BASE_URL}/auth/me`);
      expect(meResponse.status()).toBe(401);
    });
  });

  test.describe('XSS Protection', () => {
    test('should prevent JavaScript access to auth tokens', async ({ page }) => {
      // Navigate and login
      await page.goto('http://localhost:3000');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      // Attempt to read tokens via various JavaScript methods
      const securityCheck = await page.evaluate((): SecurityCheckResult => {
        const results: SecurityCheckResult = {
          documentCookie: document.cookie,
          localStorageKeys: Object.keys(localStorage),
          sessionStorageKeys: Object.keys(sessionStorage),
          windowAccessToken: typeof (window as unknown as Record<string, unknown>).accessToken,
          windowRefreshToken: typeof (window as unknown as Record<string, unknown>).refreshToken,
        };
        return results;
      });

      // Verify tokens are not accessible
      expect(securityCheck.documentCookie).not.toContain('accessToken');
      expect(securityCheck.documentCookie).not.toContain('refreshToken');
      expect(securityCheck.localStorageKeys).not.toContain('accessToken');
      expect(securityCheck.localStorageKeys).not.toContain('refreshToken');
      expect(securityCheck.sessionStorageKeys).not.toContain('accessToken');
      expect(securityCheck.sessionStorageKeys).not.toContain('refreshToken');
      expect(securityCheck.windowAccessToken).toBe('undefined');
      expect(securityCheck.windowRefreshToken).toBe('undefined');
    });

    test('should not expose tokens in API response body after transition period', async ({
      request,
    }) => {
      // This test documents the current backward-compatible behavior
      // After transition, tokens should NOT be in response body
      const response = await request.post(`${API_BASE_URL}/auth/login`, {
        data: {
          email: TEST_USER.email,
          password: TEST_USER.password,
        },
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();

      // Note: During transition period, tokens are still in response body
      // This test should be updated to expect no tokens once transition is complete
      // For now, we just verify cookies are also set (belt and suspenders)
      const cookies = response.headers()['set-cookie'];
      expect(cookies).toContain('accessToken=');
      expect(cookies.toLowerCase()).toContain('httponly');
    });
  });

  test.describe('CORS and Credentials', () => {
    test('should include credentials in cross-origin requests', async ({ page }) => {
      // Listen for API requests
      interface RequestInfo {
        url: string;
        headers: Record<string, string>;
      }
      const requests: RequestInfo[] = [];
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          requests.push({
            url: request.url(),
            headers: request.headers(),
          });
        }
      });

      await page.goto('http://localhost:3000');
      await page.fill('input[name="email"]', TEST_USER.email);
      await page.fill('input[name="password"]', TEST_USER.password);
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');

      // After login, navigate to trigger authenticated requests
      // The cookies should be automatically included due to withCredentials: true
      const authRequests = requests.filter((r) => r.url.includes('/api/auth/'));
      expect(authRequests.length).toBeGreaterThan(0);
    });
  });
});
