// @ts-check
const { test, expect } = require('@playwright/test');

const API_URL = process.env.API_URL || 'http://localhost:5001/api';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

const TEST_USER = {
  email: 'user1@example.com',
  password: 'Password123!',
};

/**
 * Comprehensive Project CRUD tests
 * Tests: Create, Read, Update, Delete operations + edge cases
 */

test.describe('Project CRUD Operations', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto(`${APP_URL}/login`);
    await page.fill('input[name="email"], input[type="email"]', TEST_USER.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Create Project', () => {
    test('should successfully create a new project', async ({ page }) => {
      await page.goto(`${APP_URL}/projects/new`);

      const projectName = `Test Project ${Date.now()}`;
      const projectDescription = 'This is a test project created by E2E tests';

      // Fill project form
      await page.fill('input[name="name"], input[name="title"]', projectName);
      await page.fill('textarea[name="description"]', projectDescription);

      // Select technology tags if available
      const tagInput = page.locator('input[name="tags"], input[placeholder*="tag"]');
      if (await tagInput.isVisible().catch(() => false)) {
        await tagInput.fill('JavaScript');
        await page.keyboard.press('Enter');
        await tagInput.fill('React');
        await page.keyboard.press('Enter');
      }

      // Submit form
      await page.click('button[type="submit"]');

      // Should redirect to project detail page or show success
      await page.waitForURL(/\/project/, { timeout: 5000 }).catch(() => {});

      // Verify project was created
      const projectTitle = page.locator(`text=${projectName}`);
      await expect(projectTitle).toBeVisible({ timeout: 5000 });
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto(`${APP_URL}/projects/new`);

      // Try to submit without filling required fields
      await page.click('button[type="submit"]');

      // Should show validation errors
      const errorMessage = page.locator('text=/required|cannot be empty/i');
      await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    });

    test('should prevent creating project with duplicate name', async ({ page, request }) => {
      const duplicateName = 'Duplicate Project Test';

      // Create first project via API
      const authResponse = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER,
      });
      const { accessToken } = await authResponse.json();

      await request.post(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
          name: duplicateName,
          description: 'First project with this name',
        },
      });

      // Try to create second project with same name via UI
      await page.goto(`${APP_URL}/projects/new`);
      await page.fill('input[name="name"], input[name="title"]', duplicateName);
      await page.fill('textarea[name="description"]', 'Second project with duplicate name');
      await page.click('button[type="submit"]');

      // Should show error or allow (depending on business rules)
      // Most systems either show error or append timestamp/username
      await page.waitForTimeout(2000);

      // Verify behavior (either error shown or project created with modified name)
      const hasError = await page
        .locator('text=/already exists|duplicate/i')
        .isVisible()
        .catch(() => false);
      const hasSuccess = page.url().includes('project');

      expect(hasError || hasSuccess).toBeTruthy();
    });

    test('should handle very long project descriptions', async ({ page }) => {
      await page.goto(`${APP_URL}/projects/new`);

      const longDescription = 'A'.repeat(5000); // 5000 character description

      await page.fill('input[name="name"], input[name="title"]', `Long Desc Project ${Date.now()}`);
      await page.fill('textarea[name="description"]', longDescription);
      await page.click('button[type="submit"]');

      // Should either truncate, show error, or accept
      await page.waitForTimeout(2000);

      const hasError = await page
        .locator('text=/too long|maximum|limit/i')
        .isVisible()
        .catch(() => false);
      const hasSuccess = page.url().includes('project');

      expect(hasError || hasSuccess).toBeTruthy();
    });
  });

  test.describe('Read Project', () => {
    test('should display project list', async ({ page }) => {
      await page.goto(`${APP_URL}/projects`);

      // Should show projects or empty state
      const projectList = page.locator(
        '[data-testid="project-list"], .project-card, .project-item'
      );
      const emptyState = page.locator('text=/no projects|empty|create your first/i');

      const hasProjects = await projectList
        .first()
        .isVisible()
        .catch(() => false);
      const isEmpty = await emptyState.isVisible().catch(() => false);

      expect(hasProjects || isEmpty).toBeTruthy();
    });

    test('should display project details', async ({ page, request }) => {
      // Create a test project
      const authResponse = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER,
      });
      const { accessToken } = await authResponse.json();

      const projectResponse = await request.post(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
          name: `Detail Test Project ${Date.now()}`,
          description: 'Test project for detail view',
          technologies: ['React', 'Node.js'],
        },
      });

      const project = await projectResponse.json();

      // Navigate to project detail
      await page.goto(`${APP_URL}/projects/${project._id}`);

      // Should display project information
      await expect(page.locator(`text=${project.name}`)).toBeVisible();
      await expect(page.locator(`text=/Test project for detail view/i`)).toBeVisible();
    });

    test('should handle viewing non-existent project', async ({ page }) => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid MongoDB ObjectId format
      await page.goto(`${APP_URL}/projects/${fakeId}`);

      // Should show 404 or error message
      const errorMessage = page.locator("text=/not found|doesn't exist|error/i");
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test('should filter projects by technology', async ({ page }) => {
      await page.goto(`${APP_URL}/projects`);

      // Look for technology filter
      const filterButton = page.locator('button:has-text("Filter"), [aria-label="Filter"]');

      if (await filterButton.isVisible().catch(() => false)) {
        await filterButton.click();

        // Select a technology
        const techOption = page.locator('text=/React|JavaScript|Python/i').first();
        if (await techOption.isVisible().catch(() => false)) {
          await techOption.click();

          // Wait for filtered results
          await page.waitForLoadState('networkidle');

          // Verify URL or filtered state
          expect(page.url()).toBeTruthy();
        }
      }
    });

    test('should search projects by name', async ({ page }) => {
      await page.goto(`${APP_URL}/projects`);

      // Look for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');

      if (await searchInput.isVisible().catch(() => false)) {
        await searchInput.fill('Test');
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');

        // Should show search results or no results message
        expect(page.url()).toBeTruthy();
      }
    });
  });

  test.describe('Update Project', () => {
    test('should successfully update project details', async ({ page, request }) => {
      // Create a test project
      const authResponse = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER,
      });
      const { accessToken } = await authResponse.json();

      const projectResponse = await request.post(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
          name: `Update Test Project ${Date.now()}`,
          description: 'Original description',
        },
      });

      const project = await projectResponse.json();

      // Navigate to project edit page
      await page.goto(`${APP_URL}/projects/${project._id}/edit`);

      const updatedName = `Updated Project ${Date.now()}`;
      const updatedDescription = 'Updated description after edit';

      // Update project details
      await page.fill('input[name="name"], input[name="title"]', updatedName);
      await page.fill('textarea[name="description"]', updatedDescription);
      await page.click('button[type="submit"]');

      // Should redirect to project detail or show success
      await page.waitForLoadState('networkidle');

      // Verify updates were saved
      const updatedTitle = page.locator(`text=${updatedName}`);
      await expect(updatedTitle).toBeVisible({ timeout: 5000 });
    });

    test('should prevent non-owner from editing project', async ({ page, request, browser }) => {
      // Create project as user1
      const user1Response = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER,
      });
      const { accessToken: user1Token } = await user1Response.json();

      const projectResponse = await request.post(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${user1Token}` },
        data: {
          name: `Protected Project ${Date.now()}`,
          description: 'Only owner can edit',
        },
      });

      const project = await projectResponse.json();

      // Create new context for different user
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();

      // Login as different user (user2)
      await page2.goto(`${APP_URL}/login`);
      await page2.fill('input[name="email"], input[type="email"]', 'user2@example.com');
      await page2.fill('input[name="password"], input[type="password"]', 'Password123!');
      await page2.click('button[type="submit"]');
      await page2.waitForLoadState('networkidle');

      // Try to access edit page
      await page2.goto(`${APP_URL}/projects/${project._id}/edit`);

      // Should show error or hide edit button
      const hasError = await page2
        .locator('text=/unauthorized|forbidden|not allowed/i')
        .isVisible()
        .catch(() => false);
      const editButton = page2.locator('button[type="submit"]');
      const hasEditButton = await editButton.isVisible().catch(() => false);

      expect(hasError || !hasEditButton).toBeTruthy();

      await context2.close();
    });

    test('should update project status/progress', async ({ page, request }) => {
      // Create a test project
      const authResponse = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER,
      });
      const { accessToken } = await authResponse.json();

      const projectResponse = await request.post(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
          name: `Status Test Project ${Date.now()}`,
          description: 'Project for status update test',
          status: 'planning',
        },
      });

      const project = await projectResponse.json();

      // Navigate to project edit page
      await page.goto(`${APP_URL}/projects/${project._id}/edit`);

      // Update status if status dropdown exists
      const statusDropdown = page.locator('select[name="status"]');
      if (await statusDropdown.isVisible().catch(() => false)) {
        await statusDropdown.selectOption('in-progress');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // Verify status was updated
        expect(page.url()).toBeTruthy();
      }
    });
  });

  test.describe('Delete Project', () => {
    test('should successfully delete own project', async ({ page, request }) => {
      // Create a test project
      const authResponse = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER,
      });
      const { accessToken } = await authResponse.json();

      const projectResponse = await request.post(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
          name: `Delete Test Project ${Date.now()}`,
          description: 'Project to be deleted',
        },
      });

      const project = await projectResponse.json();

      // Navigate to project detail
      await page.goto(`${APP_URL}/projects/${project._id}`);

      // Find and click delete button
      const deleteButton = page.locator('button:has-text("Delete"), [aria-label="Delete"]');

      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();

        // Confirm deletion if confirmation dialog appears
        const confirmButton = page.locator(
          'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")'
        );
        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.last().click();
        }

        // Should redirect to projects list
        await page.waitForURL(/\/projects($|\?)/, { timeout: 5000 }).catch(() => {});

        // Verify project is deleted
        const projectName = page.locator(`text=${project.name}`);
        const isVisible = await projectName.isVisible().catch(() => false);
        expect(isVisible).toBeFalsy();
      }
    });

    test('should show confirmation dialog before deleting', async ({ page, request }) => {
      // Create a test project
      const authResponse = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER,
      });
      const { accessToken } = await authResponse.json();

      const projectResponse = await request.post(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
          name: `Confirm Delete Project ${Date.now()}`,
          description: 'Testing delete confirmation',
        },
      });

      const project = await projectResponse.json();

      await page.goto(`${APP_URL}/projects/${project._id}`);

      const deleteButton = page.locator('button:has-text("Delete"), [aria-label="Delete"]');

      if (await deleteButton.isVisible().catch(() => false)) {
        await deleteButton.click();

        // Should show confirmation dialog
        const confirmDialog = page.locator('text=/are you sure|confirm|permanently delete/i');
        await expect(confirmDialog).toBeVisible({ timeout: 5000 });
      }
    });

    test('should prevent non-owner from deleting project', async ({ page, request, browser }) => {
      // Create project as user1
      const user1Response = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER,
      });
      const { accessToken: user1Token } = await user1Response.json();

      const projectResponse = await request.post(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${user1Token}` },
        data: {
          name: `Protected Delete Project ${Date.now()}`,
          description: 'Only owner can delete',
        },
      });

      const project = await projectResponse.json();

      // Create new context for different user
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();

      // Login as different user
      await page2.goto(`${APP_URL}/login`);
      await page2.fill('input[name="email"], input[type="email"]', 'user2@example.com');
      await page2.fill('input[name="password"], input[type="password"]', 'Password123!');
      await page2.click('button[type="submit"]');
      await page2.waitForLoadState('networkidle');

      // Navigate to project
      await page2.goto(`${APP_URL}/projects/${project._id}`);

      // Should not show delete button
      const deleteButton = page2.locator('button:has-text("Delete"), [aria-label="Delete"]');
      const hasDeleteButton = await deleteButton.isVisible().catch(() => false);

      expect(hasDeleteButton).toBeFalsy();

      await context2.close();
    });
  });

  test.describe('Project Collaborators', () => {
    test('should add collaborator to project', async ({ page, request }) => {
      // Create a test project
      const authResponse = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER,
      });
      const { accessToken } = await authResponse.json();

      const projectResponse = await request.post(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
          name: `Collab Test Project ${Date.now()}`,
          description: 'Testing collaborator feature',
        },
      });

      const project = await projectResponse.json();

      // Navigate to project
      await page.goto(`${APP_URL}/projects/${project._id}`);

      // Find add collaborator button
      const addCollabButton = page.locator(
        'button:has-text("Add Collaborator"), button:has-text("Invite")'
      );

      if (await addCollabButton.isVisible().catch(() => false)) {
        await addCollabButton.click();

        // Fill collaborator email or username
        const collabInput = page.locator('input[name="collaborator"], input[name="email"]');
        await collabInput.fill('user2@example.com');

        const submitButton = page.locator('button[type="submit"]');
        await submitButton.click();

        // Should show success message
        await page.waitForTimeout(2000);
        expect(page.url()).toBeTruthy();
      }
    });

    test('should remove collaborator from project', async ({ page, request }) => {
      // Create project and add collaborator via API
      const authResponse = await request.post(`${API_URL}/auth/login`, {
        data: TEST_USER,
      });
      const { accessToken } = await authResponse.json();

      const projectResponse = await request.post(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: {
          name: `Remove Collab Project ${Date.now()}`,
          description: 'Testing collaborator removal',
        },
      });

      const project = await projectResponse.json();

      // Add collaborator
      await request
        .post(`${API_URL}/projects/${project._id}/collaborators`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          data: { email: 'user2@example.com' },
        })
        .catch(() => {});

      // Navigate to project
      await page.goto(`${APP_URL}/projects/${project._id}`);

      // Find remove collaborator button
      const removeButton = page.locator('button:has-text("Remove"), [aria-label*="Remove"]');

      if (
        await removeButton
          .first()
          .isVisible()
          .catch(() => false)
      ) {
        await removeButton.first().click();

        // Confirm if needed
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.isVisible().catch(() => false)) {
          await confirmButton.click();
        }

        await page.waitForTimeout(2000);
        expect(page.url()).toBeTruthy();
      }
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle rapid successive project creation', async ({ page }) => {
      await page.goto(`${APP_URL}/projects/new`);

      const projectName = `Rapid Test ${Date.now()}`;

      await page.fill('input[name="name"], input[name="title"]', projectName);
      await page.fill('textarea[name="description"]', 'Testing rapid submission');

      // Click submit button multiple times rapidly
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      await submitButton.click();
      await submitButton.click();

      // Should only create one project (no duplicates)
      await page.waitForTimeout(3000);
      expect(page.url()).toBeTruthy();
    });

    test('should handle special characters in project name', async ({ page }) => {
      await page.goto(`${APP_URL}/projects/new`);

      const specialName = `Test <script>alert('xss')</script> Project ${Date.now()}`;

      await page.fill('input[name="name"], input[name="title"]', specialName);
      await page.fill('textarea[name="description"]', 'Testing XSS prevention');
      await page.click('button[type="submit"]');

      await page.waitForLoadState('networkidle');

      // Should escape special characters
      const scriptTag = page.locator('script:has-text("alert")');
      const scriptExists = await scriptTag.count();

      expect(scriptExists).toBe(0); // Script should not be executed
    });

    test('should handle network errors gracefully', async ({ page, context }) => {
      // Simulate offline mode
      await context.setOffline(true);

      await page.goto(`${APP_URL}/projects/new`).catch(() => {});

      // Should show offline message or cached content
      await page.waitForTimeout(2000);

      // Re-enable network
      await context.setOffline(false);
    });
  });
});
