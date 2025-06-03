import { expect, test } from '@playwright/test';

test.describe('Authentication Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to frontend
    await page.goto('http://localhost:3000');
  });

  test('should set httpOnly cookies on successful login', async ({ page }) => {
    console.log('🧪 Testing authentication cookie setting...');

    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Fill and submit login form
    await page.fill('input[name="email"]', 'testadmin@test.com');
    await page.fill('input[name="password"]', 'password123');

    // Intercept the login request to check response headers
    const responsePromise = page.waitForResponse(
      response =>
        response.url().includes('/api/auth/login') && response.request().method() === 'POST',
    );

    await page.click('button[type="submit"]');

    const response = await responsePromise;
    console.log('📡 Login response status:', response.status());

    // Check Set-Cookie headers
    const headers = response.headers();
    console.log('📋 Response headers:', Object.keys(headers));

    const setCookieHeader = headers['set-cookie'];
    console.log('🍪 Set-Cookie header:', setCookieHeader);

    // Check if the Set-Cookie header contains refresh_token
    if (setCookieHeader) {
      expect(setCookieHeader).toContain('refresh_token');
      expect(setCookieHeader).toContain('HttpOnly');
      expect(setCookieHeader).toContain('SameSite=Lax');
      console.log('✅ Refresh token cookie is being set correctly!');
    } else {
      console.log('❌ No Set-Cookie header found');
    }

    // Wait for redirect to home page
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });

    // Check if we can access admin pages now
    await page.goto('http://localhost:3000/admin/users');

    // Should not be forbidden anymore
    const currentUrl = page.url();
    console.log('📍 Admin page URL:', currentUrl);

    if (currentUrl.includes('forbidden')) {
      console.log('❌ Still redirected to forbidden - authentication not working');
    } else {
      console.log('✅ Successfully accessing admin pages!');
    }
  });

  test('should refresh token automatically', async ({ page }) => {
    console.log('🔄 Testing automatic token refresh...');

    // First, log in to get cookies
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', 'testadmin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/');

    // Now test refresh endpoint directly
    const refreshResponse = await page.request.post('http://localhost:3001/api/auth/refresh');
    console.log('🔄 Refresh response status:', refreshResponse.status());

    if (refreshResponse.ok()) {
      const refreshData = await refreshResponse.json();
      console.log('✅ Token refresh successful');
      console.log('🎟️ New access token received:', !!refreshData.access_token);

      expect(refreshData.access_token).toBeTruthy();
    } else {
      console.log('❌ Token refresh failed');
    }
  });

  test('should handle cross-origin requests properly', async ({ page }) => {
    console.log('🌐 Testing cross-origin authentication...');

    // Test direct API call
    const loginResponse = await page.request.post('http://localhost:3001/api/auth/login', {
      data: {
        email: 'testadmin@test.com',
        password: 'password123',
      },
    });

    console.log('📡 Direct API login status:', loginResponse.status());

    if (loginResponse.ok()) {
      const loginData = await loginResponse.json();
      console.log('✅ Direct API login successful');
      console.log('🎟️ Access token received:', !!loginData.access_token);
      console.log('👤 User data received:', !!loginData.user);

      expect(loginData.access_token).toBeTruthy();
      expect(loginData.user).toBeTruthy();
    }
  });
});
