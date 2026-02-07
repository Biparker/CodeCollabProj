// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Playwright configuration for E2E security tests
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  expect: {
    timeout: 5000
  },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
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
      url: 'http://localhost:5001',
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
