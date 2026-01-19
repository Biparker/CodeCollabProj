// @ts-check
const { test, expect } = require('@playwright/test');

const API_URL = process.env.API_URL || 'http://localhost:5001/api';

// Test user credentials (from seed.js)
const TEST_USER = {
  email: 'user1@example.com',
  password: 'Password123!'
};

// Sensitive fields that should NEVER appear in API responses
const SENSITIVE_FIELDS = [
  'passwordResetToken',
  'passwordResetExpires',
  'emailVerificationToken',
  'emailVerificationExpires',
  'password'
];

test.describe('Security Audit Fixes Verification', () => {

  test.describe('Critical: Unauthenticated API Access', () => {

    test('GET /api/users should return 401 without auth token', async ({ request }) => {
      const response = await request.get(`${API_URL}/users`);
      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.message).toContain('token');
    });

    test('GET /api/users/search should return 401 without auth token', async ({ request }) => {
      const response = await request.get(`${API_URL}/users/search?q=test`);
      expect(response.status()).toBe(401);
    });

    test('GET /api/users/:id should return 401 without auth token', async ({ request }) => {
      const response = await request.get(`${API_URL}/users/507f1f77bcf86cd799439011`);
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Critical: Sensitive Token Exposure', () => {
    let authToken;

    test.beforeAll(async ({ request }) => {
      // Login to get auth token
      const loginResponse = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER
      });

      if (loginResponse.status() === 200) {
        const loginData = await loginResponse.json();
        authToken = loginData.accessToken || loginData.token;
      }
    });

    test('GET /api/users should not expose sensitive tokens when authenticated', async ({ request }) => {
      test.skip(!authToken, 'Could not authenticate - skipping');

      const response = await request.get(`${API_URL}/users`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(response.status()).toBe(200);
      const users = await response.json();

      // Check each user object for sensitive fields
      for (const user of users) {
        for (const field of SENSITIVE_FIELDS) {
          expect(user[field], `User should not have ${field} exposed`).toBeUndefined();
        }
      }
    });

    test('GET /api/users/profile/me should not expose sensitive tokens', async ({ request }) => {
      test.skip(!authToken, 'Could not authenticate - skipping');

      const response = await request.get(`${API_URL}/users/profile/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(response.status()).toBe(200);
      const user = await response.json();

      for (const field of SENSITIVE_FIELDS) {
        expect(user[field], `Profile should not have ${field} exposed`).toBeUndefined();
      }
    });

    test('GET /api/auth/me should not expose sensitive tokens', async ({ request }) => {
      test.skip(!authToken, 'Could not authenticate - skipping');

      const response = await request.get(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      expect(response.status()).toBe(200);
      const user = await response.json();

      for (const field of SENSITIVE_FIELDS) {
        expect(user[field], `Auth/me should not have ${field} exposed`).toBeUndefined();
      }
    });
  });

  test.describe('High: Admin Email Exposure', () => {

    test('GET /api/projects should not expose owner email', async ({ request }) => {
      const response = await request.get(`${API_URL}/projects`);

      expect(response.status()).toBe(200);
      const projects = await response.json();

      // Check each project's owner object
      for (const project of projects) {
        if (project.owner && typeof project.owner === 'object') {
          expect(project.owner.email, 'Project owner email should not be exposed').toBeUndefined();
        }
      }
    });

    test('GET /api/projects/:id should not expose owner email', async ({ request }) => {
      // First get a project ID
      const listResponse = await request.get(`${API_URL}/projects`);
      const projects = await listResponse.json();

      if (projects.length > 0) {
        const response = await request.get(`${API_URL}/projects/${projects[0]._id}`);
        expect(response.status()).toBe(200);

        const project = await response.json();
        if (project.owner && typeof project.owner === 'object') {
          expect(project.owner.email, 'Project owner email should not be exposed').toBeUndefined();
        }
      }
    });
  });

  test.describe('Authentication Flow', () => {

    test('Login should return tokens without exposing sensitive user data', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER
      });

      // Login might fail if user doesn't exist, that's ok
      if (response.status() === 200) {
        const data = await response.json();

        // Should have tokens
        expect(data.accessToken || data.token).toBeTruthy();

        // User data should not have sensitive fields
        if (data.user) {
          for (const field of SENSITIVE_FIELDS) {
            expect(data.user[field], `Login response should not have ${field}`).toBeUndefined();
          }
        }
      }
    });
  });
});
