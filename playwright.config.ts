import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E security tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Reduce retries to prevent long runs on persistent failures
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'list' : 'html',
  // Individual test timeout - 30 seconds should be enough
  timeout: 30000,
  // Global timeout for entire test run - 10 minutes max
  globalTimeout: process.env.CI ? 10 * 60 * 1000 : undefined,
  // Expect timeout - 10 seconds for assertions
  expect: {
    timeout: 10000,
  },

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Disable video in CI to speed up tests
    video: process.env.CI ? 'off' : 'retain-on-failure',
    // Navigation timeout
    navigationTimeout: 15000,
    // Action timeout (clicks, fills, etc.)
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only start local servers if not testing against remote preview URL
  webServer: process.env.BASE_URL ? undefined : [
    {
      command: 'npm run server',
      url: 'http://localhost:5001/api/auth/me',
      ignoreHTTPSErrors: true,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      cwd: '.',
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'PORT=3000 npm run client',
      url: 'http://localhost:3000',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      cwd: '.',
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
});
