import { test, expect } from '@playwright/test';
import { loginAsRole, TEST_USERS } from './fixtures/auth.fixture';

/**
 * E2E tests for the Messaging feature
 * Tests inbox viewing, composing messages, and sent tab functionality
 */
test.describe('Messaging', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as user1 before each test
    await loginAsRole(page, 'user1');
  });

  test('should display messages inbox', async ({ page }) => {
    // Navigate to messages page
    await page.goto('http://localhost:3000/messages');

    // Verify the page title is visible
    await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();

    // Verify Inbox tab is visible and active
    const inboxTab = page.getByRole('tab', { name: /inbox/i });
    await expect(inboxTab).toBeVisible();
    await expect(inboxTab).toHaveAttribute('aria-selected', 'true');

    // Verify Sent tab is also visible
    await expect(page.getByRole('tab', { name: /sent/i })).toBeVisible();

    // Verify Compose Message button is visible
    await expect(page.getByRole('button', { name: /compose message/i })).toBeVisible();
  });

  test('should open compose message dialog and allow composing a message', async ({ page }) => {
    // Navigate to messages page
    await page.goto('http://localhost:3000/messages');

    // Click Compose Message button
    await page.getByRole('button', { name: /compose message/i }).click();

    // Wait for dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verify dialog title - use heading role to be specific
    await expect(page.getByRole('heading', { name: 'Compose New Message' })).toBeVisible();

    // Verify form fields are present
    // Recipient autocomplete field - use first() in case dialog has multiple comboboxes
    const recipientField = page.getByRole('combobox').first();
    await expect(recipientField).toBeVisible();

    // Subject field
    const subjectField = page.getByLabel(/subject/i);
    await expect(subjectField).toBeVisible();

    // Message/Content field
    const messageField = page.getByLabel(/message/i);
    await expect(messageField).toBeVisible();

    // Fill in the recipient - click the autocomplete and select a user
    await recipientField.click();
    // Wait for users to load and select user2 from the dropdown
    await page.waitForTimeout(500); // Give time for users list to load
    // Type to filter and select user2
    await recipientField.fill('user2');
    // Wait for options to appear and click the first matching option
    await page.getByRole('option').first().click();

    // Fill in subject
    await subjectField.fill('Test Subject from E2E');

    // Fill in message content
    await messageField.fill('This is a test message content from E2E testing.');

    // Verify Send Message button is visible
    const sendButton = page.getByRole('button', { name: /send message/i });
    await expect(sendButton).toBeVisible();

    // Click send
    await sendButton.click();

    // Wait for dialog to close (indicating success)
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 10000 });
  });

  test('should switch to Sent tab and display sent messages', async ({ page }) => {
    // Navigate to messages page
    await page.goto('http://localhost:3000/messages');

    // Verify Inbox tab is initially selected
    const inboxTab = page.getByRole('tab', { name: /inbox/i });
    await expect(inboxTab).toHaveAttribute('aria-selected', 'true');

    // Click on Sent tab
    const sentTab = page.getByRole('tab', { name: /sent/i });
    await sentTab.click();

    // Verify Sent tab is now selected
    await expect(sentTab).toHaveAttribute('aria-selected', 'true');

    // Verify Inbox tab is no longer selected
    await expect(inboxTab).toHaveAttribute('aria-selected', 'false');

    // The sent messages list should be visible (even if empty)
    // Wait for any loading to complete
    await page.waitForLoadState('networkidle');

    // The page should still show the Messages heading
    await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();
  });

  test('should close compose dialog when cancel is clicked', async ({ page }) => {
    // Navigate to messages page
    await page.goto('http://localhost:3000/messages');

    // Click Compose Message button
    await page.getByRole('button', { name: /compose message/i }).click();

    // Wait for dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click the close/cancel button (X icon or Cancel button)
    const closeButton = page.getByRole('button', { name: /cancel/i });
    if (await closeButton.isVisible()) {
      await closeButton.click();
    } else {
      // Try clicking the X icon button
      await page.locator('button:has([data-testid="CloseIcon"])').click();
    }

    // Verify dialog is closed
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('should validate required fields in compose form', async ({ page }) => {
    // Navigate to messages page
    await page.goto('http://localhost:3000/messages');

    // Click Compose Message button
    await page.getByRole('button', { name: /compose message/i }).click();

    // Wait for dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click send without filling any fields
    await page.getByRole('button', { name: /send message/i }).click();

    // Verify validation errors appear - use .first() in case of multiple matches
    await expect(page.getByText(/please select a recipient/i).first()).toBeVisible();
    await expect(page.getByText(/subject is required/i).first()).toBeVisible();
    await expect(page.getByText(/message content is required/i).first()).toBeVisible();
  });
});
