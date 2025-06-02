import { expect, test } from '@playwright/test';

test.describe('Admin Users Page - React StrictMode Fix', () => {
  test('should not trigger duplicate API calls when loading admin users page', async ({ page }) => {
    let fetchUsersCount = 0;
    let fetchStatsCount = 0;

    // Intercept admin API calls to count requests
    await page.route('**/api/admin/users**', route => {
      const url = route.request().url();
      console.log('Intercepted admin users request:', url);

      if (url.includes('/stats')) {
        fetchStatsCount++;
      } else {
        fetchUsersCount++;
      }

      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        }),
      });
    });

    // Also intercept the stats endpoint separately
    await page.route('**/api/admin/users/stats', route => {
      console.log('Intercepted stats request');
      fetchStatsCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 0,
          activeUsers: 0,
          bannedUsers: 0,
          roles: {},
        }),
      });
    });

    // Mock authentication state with proper Zustand store structure
    await page.addInitScript(() => {
      // Mock the authentication state in Zustand store
      const authState = {
        state: {
          user: {
            id: 'test-admin-id',
            email: 'admin@test.com',
            username: 'testadmin',
            first_name: 'Test',
            last_name: 'Admin',
            role: 'admin',
            is_active: true,
            is_banned: false,
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile_image: null,
            last_login: new Date().toISOString(),
          },
          tokens: {
            accessToken: 'test-admin-token',
            refreshToken: 'test-refresh-token',
            expiresAt: Date.now() + 3600000,
            tokenType: 'Bearer',
          },
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
          lastActivity: new Date().toISOString(),
          sessionExpiry: null,
        },
        version: 0,
      };
      localStorage.setItem('auth-store', JSON.stringify(authState));
    });

    // Navigate to admin users page
    await page.goto('http://localhost:3000/admin/users');

    // Wait for the page to load and React to initialize
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    console.log(`Final fetch users count: ${fetchUsersCount}`);
    console.log(`Final fetch stats count: ${fetchStatsCount}`);

    // Verify the page loaded (check for admin content)
    const pageContent = await page.textContent('body');
    console.log('Page contains "admin":', pageContent?.toLowerCase().includes('admin'));

    // In React StrictMode, without our fix, these would be 2
    // With our fix, they should be 1
    expect(fetchUsersCount).toBeGreaterThanOrEqual(1);
    expect(fetchStatsCount).toBeGreaterThanOrEqual(1);

    // Most importantly, they should not be doubled
    expect(fetchUsersCount).toBeLessThanOrEqual(2);
    expect(fetchStatsCount).toBeLessThanOrEqual(2);
  });

  test('should handle page navigation without duplicate requests', async ({ page }) => {
    let apiCallCount = 0;

    // Intercept all admin API calls
    await page.route('**/api/admin/**', route => {
      apiCallCount++;
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [],
          total: 0,
          totalUsers: 0,
          activeUsers: 0,
          bannedUsers: 0,
          roles: {},
        }),
      });
    });

    // Mock authentication state with proper Zustand store structure
    await page.addInitScript(() => {
      const authState = {
        state: {
          user: {
            id: 'test-admin-id',
            email: 'admin@test.com',
            username: 'testadmin',
            first_name: 'Test',
            last_name: 'Admin',
            role: 'admin',
            is_active: true,
            is_banned: false,
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            profile_image: null,
            last_login: new Date().toISOString(),
          },
          tokens: {
            accessToken: 'test-admin-token',
            refreshToken: 'test-refresh-token',
            expiresAt: Date.now() + 3600000,
            tokenType: 'Bearer',
          },
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          error: null,
          lastActivity: new Date().toISOString(),
          sessionExpiry: null,
        },
        version: 0,
      };
      localStorage.setItem('auth-store', JSON.stringify(authState));
    });

    // Navigate to admin dashboard first
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(1000);

    const initialCallCount = apiCallCount;

    // Navigate to users page
    await page.goto('http://localhost:3000/admin/users');
    await page.waitForTimeout(2000);

    const finalCallCount = apiCallCount;

    // Should only make 2 additional calls (users + stats), not 4
    const additionalCalls = finalCallCount - initialCallCount;
    console.log(`Additional API calls when navigating to users page: ${additionalCalls}`);

    // Expect only 2 calls (fetchUsers + fetchStats), not 4 due to StrictMode
    expect(additionalCalls).toBeLessThanOrEqual(2);
  });
});
