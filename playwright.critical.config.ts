import { defineConfig, devices } from '@playwright/test';

/**
 * Minimal Playwright config for CRITICAL smoke tests only
 * Runs fast subset (~20-30 tests) for PR validation
 */
export default defineConfig({
  testDir: './tests/e2e-critical',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'list' : 'html',
  timeout: 60000, // 60s for critical tests
  expect: {
    timeout: 15000,
  },

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'off' : 'retain-on-failure',
    navigationTimeout: 15000,
    actionTimeout: 10000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only start local servers if testing locally (not against Railway)
  webServer: process.env.BASE_URL ? undefined : [
    {
      command: 'npm run server',
      url: 'http://localhost:5001/api/auth/me',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'PORT=3000 npm run client',
      url: 'http://localhost:3000',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
