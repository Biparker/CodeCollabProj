import { test, expect } from '@playwright/test';
import { TEST_USERS, loginAsRole } from './fixtures/auth.fixture';

/**
 * E2E tests for admin dashboard functionality
 * Tests admin access, user management, and role-based access control
 */
test.describe('Admin', () => {
  test.describe('Admin Access', () => {
    test('admin can access /admin dashboard and see Admin Dashboard heading with stats', async ({
      page,
    }) => {
      // Login as admin
      await loginAsRole(page, 'admin');

      // Navigate to admin dashboard
      await page.goto('http://localhost:3000/admin');

      // Wait for the admin dashboard to load
      await page.waitForLoadState('networkidle');

      // Verify Admin Dashboard heading is visible
      await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();

      // Verify stats are displayed (stat cards should be present)
      // Use .first() since stat cards may have label and value matching the text
      // Check for Total Users stat card
      await expect(page.getByText('Total Users').first()).toBeVisible();

      // Check for Active Users stat card
      await expect(page.getByText('Active Users').first()).toBeVisible();

      // Check for Total Projects stat card
      await expect(page.getByText('Total Projects').first()).toBeVisible();

      // Check for Active Sessions stat card
      await expect(page.getByText('Active Sessions').first()).toBeVisible();
    });
  });

  test.describe('User Management', () => {
    test('admin can click User Management to see user table', async ({ page }) => {
      // Login as admin
      await loginAsRole(page, 'admin');

      // Navigate to admin dashboard
      await page.goto('http://localhost:3000/admin');

      // Wait for the admin dashboard to load
      await page.waitForLoadState('networkidle');

      // Click on User Management in the sidebar
      await page.click('text=User Management');

      // Wait for navigation to user management page
      await page.waitForURL('**/admin/users**');

      // Verify User Management heading is visible
      await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();

      // Verify users table is displayed
      // Check for table headers
      await expect(page.getByRole('columnheader', { name: 'User' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Role' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Joined' })).toBeVisible();
      await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible();
    });
  });

  test.describe('Access Control', () => {
    test('regular user accessing /admin should see access denied message', async ({ page }) => {
      // Login as regular user
      await loginAsRole(page, 'user1');

      // Try to navigate to admin dashboard
      await page.goto('http://localhost:3000/admin');

      // Wait for the page to load
      await page.waitForLoadState('networkidle');

      // Verify access denied message is shown
      await expect(page.getByText('Access denied')).toBeVisible();
      await expect(
        page.getByText("You don't have sufficient privileges to view this page")
      ).toBeVisible();

      // Verify the Admin Dashboard is NOT shown
      await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).not.toBeVisible();
    });
  });
});
