import { test } from '@playwright/test';

test.describe('Authentication State Debug', () => {
  test('should debug authentication state after login', async ({ page }) => {
    console.log('🔍 Debugging authentication state...');

    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Fill and submit login form
    await page.fill('input[name="email"]', 'testadmin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for any redirects
    await page.waitForTimeout(2000);

    // Check localStorage and sessionStorage
    const localStorage = await page.evaluate(() => {
      const auth = localStorage.getItem('auth-storage');
      return auth ? JSON.parse(auth) : null;
    });

    console.log('💾 LocalStorage auth:', JSON.stringify(localStorage, null, 2));

    // Check cookies from browser perspective
    const cookies = await page.context().cookies();
    console.log(
      '🍪 Browser cookies:',
      cookies.map(c => ({ name: c.name, domain: c.domain, path: c.path })),
    );

    // Check if there's an access token
    const hasAccessToken = localStorage?.state?.tokens?.accessToken;
    console.log('🎟️ Has access token:', !!hasAccessToken);

    if (hasAccessToken) {
      console.log('✅ Authentication appears to be working via localStorage');

      // Test API call with token
      const result = await page.evaluate(async token => {
        try {
          const response = await fetch('http://localhost:3001/api/admin/users', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          return {
            status: response.status,
            ok: response.ok,
          };
        } catch (error) {
          return { error: error.message };
        }
      }, hasAccessToken);

      console.log('🧪 API test with token:', result);
    }

    // Navigate to admin page
    await page.goto('http://localhost:3000/admin/users');
    console.log('📍 Current URL after admin navigation:', page.url());

    // Check for any error messages
    const errorElements = await page.$$('[data-testid="error"], .error, [class*="error"]');
    console.log('❌ Error elements found:', errorElements.length);

    // Check for success indicators
    const pageContent = await page.textContent('body');
    const hasUserList = pageContent?.includes('Users') || pageContent?.includes('Admin');
    console.log('📋 Page appears to have admin content:', hasUserList);
  });
});
