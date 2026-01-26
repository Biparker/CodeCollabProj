import { test, expect } from '@playwright/test';
import { loginAs, TEST_USERS } from './fixtures/auth.fixture';

/**
 * E2E tests for the Dashboard page
 * Tests verify that user stats, projects, and navigation work correctly
 */
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user1 before each test
    await loginAs(page, TEST_USERS.user1.email, TEST_USERS.user1.password);
  });

  test('should display user stats cards', async ({ page }) => {
    // Verify the three stats cards are visible
    await expect(page.getByText('Total Projects')).toBeVisible();
    await expect(page.getByText('Active Collaborations')).toBeVisible();
    await expect(page.getByText('Technologies Used')).toBeVisible();
  });

  test('should show user projects section', async ({ page }) => {
    // Verify the My Projects heading is visible
    await expect(page.getByRole('heading', { name: 'My Projects' })).toBeVisible();
  });

  test('should navigate to create project page when clicking Create New Project button', async ({
    page,
  }) => {
    // Click the Create New Project button
    await page.getByRole('link', { name: 'Create New Project' }).click();

    // Verify navigation to the create project page
    await expect(page).toHaveURL(/\/projects\/create/);
  });
});
