import { test, expect } from '@playwright/test';
import { loginAsRole } from './fixtures/auth.fixture';

/**
 * E2E tests for the Profile page
 * Tests user profile viewing and editing functionality
 */
test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login as a regular user before each test
    await loginAsRole(page, 'user1');
  });

  test('should display Profile Settings heading', async ({ page }) => {
    // Navigate to the profile page
    await page.goto('http://localhost:3000/profile');

    // Wait for the profile page to load
    await page.waitForLoadState('networkidle');

    // Verify the "Profile Settings" heading is visible
    const heading = page.getByRole('heading', { name: 'Profile Settings' });
    await expect(heading).toBeVisible();
  });

  test('should edit bio and save profile successfully', async ({ page }) => {
    // Navigate to the profile page
    await page.goto('http://localhost:3000/profile');

    // Wait for the profile page to load
    await page.waitForLoadState('networkidle');

    // Wait for the form to be ready (Bio textarea should be visible)
    const bioField = page.locator('textarea[name="bio"]');
    await expect(bioField).toBeVisible();

    // Generate a unique bio to verify the update
    const uniqueBio = `E2E test bio - ${Date.now()}`;

    // Clear the existing bio and fill with new content
    await bioField.fill(uniqueBio);

    // Click the "Save Profile" button
    const saveButton = page.getByRole('button', { name: /Save Profile/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // The button should show "Saving..." while the request is in progress
    // Then return to "Save Profile" when complete
    // Wait for the button to return to normal state (indicates save completed)
    await expect(saveButton).toContainText('Save Profile', { timeout: 10000 });

    // Verify no error alert is displayed (success indication)
    const errorAlert = page.locator('.MuiAlert-standardError');
    await expect(errorAlert).not.toBeVisible();
  });
});
