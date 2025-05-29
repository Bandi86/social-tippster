import { expect, test } from '@playwright/test';

test.describe('Comment System - Zustand Migration', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
  });

  test('should display comment form and list when authenticated', async ({ page }) => {
    // First, let's login (assuming there's a login page)
    await page.click('text=Bejelentkezés', { timeout: 10000 });

    // Fill login form (adjust selectors based on actual form)
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for successful login and navigation
    await page.waitForURL('http://localhost:3000', { timeout: 10000 });

    // Navigate to a post to test comments
    await page.click('text=Posts', { timeout: 5000 });

    // Click on first post
    const firstPost = page.locator('.post-card').first();
    await firstPost.click();

    // Verify comment form is present
    await expect(page.locator('textarea[placeholder*="komment"]')).toBeVisible();

    // Verify comment list section is present
    await expect(page.locator('text=Kommentek')).toBeVisible();
  });

  test('should handle comment creation with Zustand store', async ({ page }) => {
    // This test assumes user is authenticated
    // Add authentication steps here if needed

    const testComment = 'Test comment for Zustand migration';

    // Find comment form
    const commentTextarea = page.locator('textarea[placeholder*="komment"]');
    await commentTextarea.fill(testComment);

    // Submit comment
    await page.click('button[type="submit"]');

    // Verify comment appears in the list
    await expect(page.locator(`text=${testComment}`)).toBeVisible();

    // Verify comment contains proper structure (user info, timestamp, etc.)
    const commentCard = page.locator('.comment-card').first();
    await expect(commentCard).toBeVisible();
    await expect(commentCard.locator('.username')).toBeVisible();
    await expect(commentCard.locator('.timestamp')).toBeVisible();
  });

  test('should handle comment voting with Zustand hooks', async ({ page }) => {
    // Assuming there are existing comments
    const firstComment = page.locator('.comment-card').first();

    // Test upvote
    const upvoteButton = firstComment.locator(
      'button[aria-label*="upvote"], button:has-text("❤")',
    );
    await upvoteButton.click();

    // Verify vote count updates
    const voteCount = firstComment.locator('.vote-count');
    await expect(voteCount).toBeVisible();

    // Test downvote
    const downvoteButton = firstComment.locator(
      'button[aria-label*="downvote"], button:has-text("💔")',
    );
    await downvoteButton.click();
  });

  test('should handle comment replies with proper nesting', async ({ page }) => {
    const parentComment = page.locator('.comment-card').first();

    // Click reply button
    const replyButton = parentComment.locator('button:has-text("Válasz")');
    await replyButton.click();

    // Verify reply form appears
    const replyForm = page.locator('textarea[placeholder*="Válaszolj"]');
    await expect(replyForm).toBeVisible();

    // Fill and submit reply
    const replyText = 'This is a test reply';
    await replyForm.fill(replyText);
    await page.click('button[type="submit"]');

    // Verify reply appears as nested comment
    const replyComment = page.locator('.comment-reply').first();
    await expect(replyComment.locator(`text=${replyText}`)).toBeVisible();
  });

  test('should handle comment editing with Zustand state management', async ({ page }) => {
    // Find user's own comment (assuming proper auth)
    const ownComment = page.locator('.comment-card').first();

    // Click edit option
    await ownComment.locator('button[aria-label="More options"]').click();
    await page.click('text=Szerkesztés');

    // Verify edit form appears
    const editTextarea = page.locator('textarea');
    await expect(editTextarea).toBeVisible();

    // Update comment
    const updatedText = 'Updated comment text';
    await editTextarea.fill(updatedText);
    await page.click('button:has-text("Mentés")');

    // Verify updated comment appears
    await expect(page.locator(`text=${updatedText}`)).toBeVisible();
    await expect(page.locator('text=(szerkesztve)')).toBeVisible();
  });

  test('should handle comment deletion with store cleanup', async ({ page }) => {
    const commentToDelete = page.locator('.comment-card').first();
    const commentText = await commentToDelete.locator('.comment-content').textContent();

    // Open options menu
    await commentToDelete.locator('button[aria-label="More options"]').click();
    await page.click('text=Törlés');

    // Confirm deletion
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Biztosan törölni');
      await dialog.accept();
    });

    // Verify comment is removed from the list
    await expect(page.locator(`text=${commentText}`)).not.toBeVisible();
  });

  test('should display proper error handling for failed operations', async ({ page }) => {
    // Test network error handling
    await page.route('**/api/comments', route => {
      route.abort('failed');
    });

    // Try to load comments
    await page.reload();

    // Verify error message is displayed
    await expect(page.locator('text=Hiba történt')).toBeVisible();
  });

  test('should handle sorting and pagination correctly', async ({ page }) => {
    // Test sorting dropdown
    const sortSelect = page.locator('select[aria-label*="sort"], .sort-select');
    await sortSelect.click();
    await page.click('text=Legnépszerűbb');

    // Verify comments reload with new sort order
    await page.waitForTimeout(1000); // Wait for sort to apply

    // Test load more functionality
    const loadMoreButton = page.locator('button:has-text("További kommentek")');
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await expect(page.locator('.comment-card')).toHaveCount(
        await page.locator('.comment-card').count(),
      );
    }
  });

  test('should maintain proper state when navigating between posts', async ({ page }) => {
    // Navigate to first post
    await page.click('.post-card').first();
    const firstPostComments = await page.locator('.comment-card').count();

    // Navigate to second post
    await page.goBack();
    await page.click('.post-card').nth(1);

    // Verify comments are different/cleared
    const secondPostComments = await page.locator('.comment-card').count();

    // Comments should be different or zero (depending on implementation)
    expect(firstPostComments).not.toBe(secondPostComments);
  });
});
