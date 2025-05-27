import { test } from '@playwright/test';

test.describe('Admin Users Page Debug', () => {
  test('should debug admin users page loading', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', error => console.log('Page error:', error.message));

    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Take screenshot of login page
    await page.screenshot({ path: 'debug-login.png' });

    // Fill in admin credentials
    await page.fill('input[name="email"]', 'testadmin@test.com');
    await page.fill('input[name="password"]', 'password123');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForTimeout(3000);

    // Take screenshot after login
    await page.screenshot({ path: 'debug-after-login.png' });

    console.log('Current URL after login:', page.url());

    // Navigate to admin users page
    await page.goto('http://localhost:3000/admin/users');
    await page.waitForTimeout(5000);

    // Take screenshot of admin page
    await page.screenshot({ path: 'debug-admin-users.png' });

    console.log('Current URL:', page.url());
    console.log('Page title:', await page.title());

    // Check if there are any error messages
    const errorMessages = await page.locator('text=/error|Error|failed|Failed/i').all();
    console.log('Error messages found:', errorMessages.length);

    // Check what elements are actually on the page
    const adminStats = page.locator('[data-testid="admin-stats"]');
    const adminStatsExists = await adminStats.count();
    console.log('Admin stats element exists:', adminStatsExists > 0);

    if (adminStatsExists === 0) {
      // Look for loading states
      const loadingElements = await page.locator('text=/loading|Loading|spinner/i').all();
      console.log('Loading elements found:', loadingElements.length);

      // Check for any visible text content
      const bodyText = await page.locator('body').textContent();
      console.log('Page body text (first 500 chars):', bodyText?.substring(0, 500));
    }

    // Check network responses
    const responses: { url: string; status: number; statusText: string }[] = [];
    page.on('response', response => {
      if (response.url().includes('/admin/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
      }
    });

    // Wait a bit more and check responses
    await page.waitForTimeout(2000);
    console.log('Admin API responses:', responses);
  });
});
