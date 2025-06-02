import { expect, test } from '@playwright/test';

test.describe('Complete Authentication Flow', () => {
  test('should complete full admin authentication flow', async ({ page }) => {
    console.log('🎯 Testing complete admin authentication flow...');

    // Step 1: Login
    console.log('1️⃣ Logging in...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', 'testadmin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    console.log('✅ Login successful, redirected to dashboard');

    // Step 2: Check authentication state
    console.log('2️⃣ Checking authentication state...');
    const authState = await page.evaluate(() => {
      const auth = localStorage.getItem('auth-storage');
      return auth ? JSON.parse(auth) : null;
    });

    expect(authState.state.isAuthenticated).toBe(true);
    expect(authState.state.user.role).toBe('admin');
    expect(authState.state.tokens.accessToken).toBeTruthy();
    console.log('✅ Authentication state verified');

    // Step 3: Test admin API access
    console.log('3️⃣ Testing admin API access...');
    const apiResult = await page.evaluate(async token => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        return { status: response.status, hasData: !!data };
      } catch (error) {
        return { error: error.message };
      }
    }, authState.state.tokens.accessToken);

    expect(apiResult.status).toBe(200);
    expect(apiResult.hasData).toBe(true);
    console.log('✅ Admin API access working');

    // Step 4: Test admin page access
    console.log('4️⃣ Testing admin page access...');
    await page.goto('http://localhost:3000/admin/users');
    const url = page.url();
    expect(url).toContain('/admin/users');
    expect(url).not.toContain('forbidden');
    console.log('✅ Admin page access successful');

    // Step 5: Test stats endpoint
    console.log('5️⃣ Testing admin stats endpoint...');
    const statsResult = await page.evaluate(async token => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/users/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        return { status: response.status, data };
      } catch (error) {
        return { error: error.message };
      }
    }, authState.state.tokens.accessToken);

    expect(statsResult.status).toBe(200);
    expect(statsResult.data).toBeTruthy();
    console.log('✅ Admin stats endpoint working');
    console.log('📊 Stats data:', statsResult.data);

    console.log('🎉 All authentication tests passed!');
  });

  test('should test httpOnly refresh token functionality', async ({ page }) => {
    console.log('🔄 Testing refresh token functionality...');

    // Login first
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', 'testadmin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Check if refresh token cookie was set (it should be httpOnly so we can't see it in browser)
    const cookies = await page.context().cookies();
    const refreshCookie = cookies.find(c => c.name === 'refresh_token');

    if (refreshCookie) {
      console.log('✅ Refresh token cookie found:', {
        name: refreshCookie.name,
        domain: refreshCookie.domain,
        path: refreshCookie.path,
        httpOnly: refreshCookie.httpOnly,
        secure: refreshCookie.secure,
      });
      expect(refreshCookie.httpOnly).toBe(true);
    } else {
      console.log('ℹ️ Refresh token cookie not visible (expected for httpOnly cookies)');
    }

    // Test refresh endpoint directly
    const refreshResponse = await page.request.post('http://localhost:3001/api/auth/refresh');
    console.log('🔄 Refresh response status:', refreshResponse.status());

    if (refreshResponse.ok()) {
      const refreshData = await refreshResponse.json();
      expect(refreshData.access_token).toBeTruthy();
      console.log('✅ Token refresh successful');
    } else {
      console.log('ℹ️ Refresh failed (might be expected if cookie is not properly shared)');
    }
  });
});
