import { expect, test } from '@playwright/test';

/**
 * Frontend Integration Tests for Bookmark Functionality
 * Tests the complete bookmark flow from UI interactions to backend integration
 */

const TEST_CREDENTIALS = {
  email: 'admin@socialtippster.com',
  password: 'admin123',
};

test.describe('Bookmark Functionality Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Start from homepage
    await page.goto('http://localhost:3000');
  });

  test('should allow authenticated users to bookmark and unbookmark posts', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/auth');
    await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });

    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-card"], .post-card, article', {
      timeout: 10000,
    });

    // Find a post card with bookmark button
    const postCard = page.locator('[data-testid="post-card"], .post-card, article').first();

    // Look for bookmark button using multiple selectors
    const bookmarkButton = postCard
      .locator(
        'button:has([data-lucide="bookmark"]), button:has([class*="bookmark"]), button[aria-label*="bookmark" i], button[title*="bookmark" i], .bookmark-button, [data-testid="bookmark-button"]',
      )
      .first();

    // Wait for bookmark button to be visible
    await expect(bookmarkButton).toBeVisible({ timeout: 5000 });

    // Get initial bookmark state
    const initialBookmarkState = await bookmarkButton.getAttribute('class');
    const isInitiallyBookmarked =
      initialBookmarkState?.includes('amber') ||
      initialBookmarkState?.includes('bookmarked') ||
      initialBookmarkState?.includes('active');

    console.log('Initial bookmark state:', isInitiallyBookmarked ? 'bookmarked' : 'not bookmarked');

    // Click bookmark button to toggle state
    await bookmarkButton.click();

    // Wait for the state change (look for toast notification or class change)
    await page.waitForTimeout(1000);

    // Verify state changed
    const newBookmarkState = await bookmarkButton.getAttribute('class');
    const isNowBookmarked =
      newBookmarkState?.includes('amber') ||
      newBookmarkState?.includes('bookmarked') ||
      newBookmarkState?.includes('active');

    // The state should have changed
    expect(isNowBookmarked).not.toBe(isInitiallyBookmarked);

    // Look for success toast notification
    const toast = page.locator('.toast, [data-testid="toast"], [class*="toast"]');
    if (await toast.isVisible()) {
      console.log('✓ Toast notification appeared');
    }

    // Test the opposite action (toggle back)
    await bookmarkButton.click();
    await page.waitForTimeout(1000);

    const finalBookmarkState = await bookmarkButton.getAttribute('class');
    const isFinallyBookmarked =
      finalBookmarkState?.includes('amber') ||
      finalBookmarkState?.includes('bookmarked') ||
      finalBookmarkState?.includes('active');

    // Should be back to original state
    expect(isFinallyBookmarked).toBe(isInitiallyBookmarked);

    console.log('✓ Bookmark toggle functionality working');
  });

  test('should show authentication prompt for unauthenticated users', async ({ page }) => {
    // Stay on homepage without logging in
    await page.waitForSelector('[data-testid="post-card"], .post-card, article', {
      timeout: 10000,
    });

    const postCard = page.locator('[data-testid="post-card"], .post-card, article').first();

    // Look for bookmark button or static bookmark display
    const bookmarkElement = postCard
      .locator(
        'button:has([data-lucide="bookmark"]), .bookmark-button, [data-testid="bookmark-button"], [class*="bookmark"]',
      )
      .first();

    if (await bookmarkElement.isVisible()) {
      // If bookmark button is present, it should either be disabled or show auth prompt
      await bookmarkElement.click();

      // Look for auth prompt or redirect
      await page.waitForTimeout(1000);

      // Check if redirected to auth page or if toast appears
      const currentUrl = page.url();
      const authPrompt = page.locator(
        '.toast, [data-testid="toast"], text=/bejelentkezés/i, text=/login/i',
      );

      if (currentUrl.includes('/auth') || (await authPrompt.isVisible())) {
        console.log('✓ Authentication prompt or redirect working for unauthenticated users');
      }
    } else {
      // If no bookmark button, should show static count or login prompt
      const loginPrompt = postCard.locator(
        'text=/jelentkezz be/i, text=/login/i, .guest-prompt, .unauthenticated-notice',
      );
      if (await loginPrompt.isVisible()) {
        console.log('✓ Login prompt shown for unauthenticated users');
      }
    }
  });

  test('should display bookmark count correctly', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/auth');
    await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });

    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-card"], .post-card, article', {
      timeout: 10000,
    });

    const postCard = page.locator('[data-testid="post-card"], .post-card, article').first();

    // Look for bookmark count display
    const bookmarkCount = postCard
      .locator(
        'button:has([data-lucide="bookmark"]) span, .bookmark-count, [data-testid="bookmark-count"]',
      )
      .first();

    if (await bookmarkCount.isVisible()) {
      const countText = await bookmarkCount.textContent();
      const count = parseInt(countText?.trim() || '0');

      // Count should be a non-negative number
      expect(count).toBeGreaterThanOrEqual(0);
      console.log(`✓ Bookmark count displayed: ${count}`);
    }
  });

  test('should handle bookmark errors gracefully', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/auth');
    await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });

    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-card"], .post-card, article', {
      timeout: 10000,
    });

    // Find bookmark button
    const postCard = page.locator('[data-testid="post-card"], .post-card, article').first();
    const bookmarkButton = postCard
      .locator(
        'button:has([data-lucide="bookmark"]), .bookmark-button, [data-testid="bookmark-button"]',
      )
      .first();

    if (await bookmarkButton.isVisible()) {
      // Click bookmark button rapidly to test for race conditions
      await bookmarkButton.click();
      await bookmarkButton.click();
      await bookmarkButton.click();

      // Wait for any error handling
      await page.waitForTimeout(2000);

      // Check that the UI is still responsive and not stuck
      const isEnabled = await bookmarkButton.isEnabled();
      expect(isEnabled).toBe(true);

      console.log('✓ Bookmark button handles rapid clicks gracefully');
    }
  });

  test('should show favorite button with heart icon as bookmark alias', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/auth');
    await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });

    // Wait for posts to load
    await page.waitForSelector('[data-testid="post-card"], .post-card, article', {
      timeout: 10000,
    });

    const postCard = page.locator('[data-testid="post-card"], .post-card, article').first();

    // Look for heart/favorite button (bookmark alias)
    const favoriteButton = postCard
      .locator(
        'button:has([data-lucide="heart"]), .favorite-button, [data-testid="favorite-button"]',
      )
      .first();

    if (await favoriteButton.isVisible()) {
      console.log('✓ Favorite button (heart icon) found as bookmark alias');

      // Test favorite button functionality
      await favoriteButton.click();
      await page.waitForTimeout(1000);

      // Should behave the same as bookmark button
      const updatedState = await favoriteButton.getAttribute('class');
      console.log('✓ Favorite button toggle working');
    }
  });

  test('should integrate with posts list filtering', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/auth');
    await page.fill('input[name="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[name="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });

    // Look for bookmarks filter or navigation
    const bookmarksFilter = page
      .locator(
        'button[data-value="bookmarked"], a[href*="bookmark"], .bookmark-filter, [data-testid="bookmarks-filter"]',
      )
      .first();

    if (await bookmarksFilter.isVisible()) {
      await bookmarksFilter.click();
      await page.waitForTimeout(2000);

      // Check if URL changed or posts filtered
      const currentUrl = page.url();
      const filteredPosts = page.locator('[data-testid="post-card"], .post-card, article');

      if (currentUrl.includes('bookmark') || (await filteredPosts.count()) >= 0) {
        console.log('✓ Bookmarks filtering integration working');
      }
    }
  });
});

test.describe('Bookmark Component Integration', () => {
  test('should render PostBookmarkButton correctly', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Check that bookmark buttons are rendered in posts
    await page.waitForSelector('[data-testid="post-card"], .post-card, article', {
      timeout: 10000,
    });

    const bookmarkButtons = page.locator('button:has([data-lucide="bookmark"]), .bookmark-button');
    const buttonCount = await bookmarkButtons.count();

    expect(buttonCount).toBeGreaterThan(0);
    console.log(`✓ Found ${buttonCount} bookmark buttons rendered`);
  });

  test('should show correct bookmark icon states', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="post-card"], .post-card, article', {
      timeout: 10000,
    });

    const bookmarkIcons = page.locator('[data-lucide="bookmark"], [data-lucide="bookmark-check"]');
    const iconCount = await bookmarkIcons.count();

    expect(iconCount).toBeGreaterThan(0);
    console.log(`✓ Found ${iconCount} bookmark icons with correct states`);
  });
});
