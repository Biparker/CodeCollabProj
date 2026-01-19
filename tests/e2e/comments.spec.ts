import { test, expect } from '@playwright/test';
import { loginAsRole, TEST_USERS } from './fixtures/auth.fixture';

/**
 * E2E tests for the Comments functionality on project detail pages
 * Tests viewing comments section and adding new comments
 */
test.describe('Comments', () => {
  test.beforeEach(async ({ page }) => {
    // Login as user1 before each test
    await loginAsRole(page, 'user1');
  });

  test('should display comments section on project detail page', async ({ page }) => {
    // Navigate to projects list
    await page.goto('http://localhost:3000/projects');

    // Wait for projects to load
    await page.waitForSelector('text=Projects', { timeout: 10000 });

    // Click "View Details" on the first project card
    const viewDetailsButton = page.locator('text=View Details').first();
    await viewDetailsButton.waitFor({ state: 'visible', timeout: 10000 });
    await viewDetailsButton.click();

    // Wait for project detail page to load
    await page.waitForURL('**/projects/**', { timeout: 10000 });

    // Verify the Comments heading is visible
    const commentsHeading = page.locator('h5:has-text("Comments"), h6:has-text("Comments")');
    await expect(commentsHeading).toBeVisible({ timeout: 10000 });

    // Verify the comment textarea is present (for logged-in users)
    const commentTextarea = page.locator('textarea[placeholder="Write a comment..."]');
    await expect(commentTextarea).toBeVisible();

    // Verify the Post Comment button is present
    const postButton = page.locator('button:has-text("Post Comment")');
    await expect(postButton).toBeVisible();
  });

  test('should add a comment to a project', async ({ page }) => {
    // Navigate to projects list
    await page.goto('http://localhost:3000/projects');

    // Wait for projects to load
    await page.waitForSelector('text=Projects', { timeout: 10000 });

    // Click "View Details" on the first project card
    const viewDetailsButton = page.locator('text=View Details').first();
    await viewDetailsButton.waitFor({ state: 'visible', timeout: 10000 });
    await viewDetailsButton.click();

    // Wait for project detail page to load
    await page.waitForURL('**/projects/**', { timeout: 10000 });

    // Wait for the Comments section to be visible
    const commentsHeading = page.locator('h5:has-text("Comments"), h6:has-text("Comments")');
    await expect(commentsHeading).toBeVisible({ timeout: 10000 });

    // Generate a unique comment text with timestamp to verify it appears
    const uniqueCommentText = `Test comment from E2E test - ${Date.now()}`;

    // Fill the comment textarea
    const commentTextarea = page.locator('textarea[placeholder="Write a comment..."]');
    await expect(commentTextarea).toBeVisible();
    await commentTextarea.fill(uniqueCommentText);

    // Click the Post Comment button
    const postButton = page.locator('button:has-text("Post Comment")');
    await expect(postButton).toBeEnabled();
    await postButton.click();

    // Wait for either success message or the comment to appear in the list
    // The app shows a success alert "Comment posted successfully!"
    const successIndicator = page
      .locator('text=Comment posted successfully!, text="' + uniqueCommentText + '"')
      .first();

    // Wait for either the success message or the comment text to appear
    await expect(
      page
        .locator(`text=${uniqueCommentText}`)
        .or(page.locator('text=Comment posted successfully!'))
    ).toBeVisible({ timeout: 15000 });

    // Verify the textarea is cleared after successful submission
    await expect(commentTextarea).toHaveValue('');
  });

  test('should show existing comments in the comments list', async ({ page }) => {
    // Navigate to projects list
    await page.goto('http://localhost:3000/projects');

    // Wait for projects to load
    await page.waitForSelector('text=Projects', { timeout: 10000 });

    // Click "View Details" on the first project card
    const viewDetailsButton = page.locator('text=View Details').first();
    await viewDetailsButton.waitFor({ state: 'visible', timeout: 10000 });
    await viewDetailsButton.click();

    // Wait for project detail page to load
    await page.waitForURL('**/projects/**', { timeout: 10000 });

    // Wait for the Comments section to be visible
    const commentsHeading = page.locator('h5:has-text("Comments"), h6:has-text("Comments")');
    await expect(commentsHeading).toBeVisible({ timeout: 10000 });

    // Verify comments list is present - either with comments or "No comments yet" message
    const commentsList = page.locator('ul').filter({ has: page.locator('li') });
    const noCommentsText = page.locator('text=No comments yet');

    // Either there are comments in a list or the "No comments yet" message
    await expect(commentsList.or(noCommentsText)).toBeVisible({ timeout: 10000 });
  });

  test('should disable Post Comment button when textarea is empty', async ({ page }) => {
    // Navigate to projects list
    await page.goto('http://localhost:3000/projects');

    // Wait for projects to load
    await page.waitForSelector('text=Projects', { timeout: 10000 });

    // Click "View Details" on the first project card
    const viewDetailsButton = page.locator('text=View Details').first();
    await viewDetailsButton.waitFor({ state: 'visible', timeout: 10000 });
    await viewDetailsButton.click();

    // Wait for project detail page to load
    await page.waitForURL('**/projects/**', { timeout: 10000 });

    // Wait for the Comments section to be visible
    const commentsHeading = page.locator('h5:has-text("Comments"), h6:has-text("Comments")');
    await expect(commentsHeading).toBeVisible({ timeout: 10000 });

    // Verify Post Comment button is disabled when textarea is empty
    const postButton = page.locator('button:has-text("Post Comment")');
    const commentTextarea = page.locator('textarea[placeholder="Write a comment..."]');

    // Make sure textarea is empty
    await commentTextarea.fill('');

    // Button should be disabled
    await expect(postButton).toBeDisabled();

    // Fill in some text
    await commentTextarea.fill('Test comment');

    // Button should now be enabled
    await expect(postButton).toBeEnabled();

    // Clear the text
    await commentTextarea.fill('');

    // Button should be disabled again
    await expect(postButton).toBeDisabled();
  });
});
