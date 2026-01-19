import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E security tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 60000,

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'npm run server',
      url: 'http://localhost:5001/api/auth/me',
      ignoreHTTPSErrors: true,
      timeout: 120 * 1000,
      reuseExistingServer: true,
      cwd: '.',
    },
    {
      command: 'npm run client',
      url: 'http://localhost:3000',
      timeout: 120 * 1000,
      reuseExistingServer: true,
      cwd: '.',
    },
  ],
});
