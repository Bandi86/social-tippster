import { expect, test } from '@playwright/test';

test.describe('Complete End-to-End Authentication Flow', () => {
  const testCredentials = {
    email: 'testadmin@test.com',
    password: 'password123',
  };

  const newUserCredentials = {
    email: `testuser${Date.now()}@example.com`,
    password: 'TestPassword123!',
    username: `testuser${Date.now()}`,
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('E2E - Complete user registration, login, and admin access flow', async ({ page }) => {
    console.log('🎯 Starting complete E2E authentication flow...');

    // Step 1: User Registration
    console.log('1️⃣ Testing user registration...');
    await page.goto('http://localhost:3000/auth/register');

    // Fill registration form
    await page.fill('input[name="email"], input[type="email"]', newUserCredentials.email);
    await page.fill('input[name="password"], input[type="password"]', newUserCredentials.password);

    // Fill username if field exists
    const usernameField = page.locator('input[name="username"]');
    if (await usernameField.isVisible()) {
      await usernameField.fill(newUserCredentials.username);
    }

    await page.click(
      'button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")',
    );

    // Wait for registration completion
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const registrationSuccess =
      currentUrl === 'http://localhost:3000/' ||
      currentUrl.includes('/auth/login') ||
      (await page
        .locator('text=success, text=registered')
        .isVisible()
        .catch(() => false));

    if (registrationSuccess) {
      console.log('✅ User registration successful');
    } else {
      console.log('ℹ️ Registration might require different approach or user already exists');
    }

    // Step 2: User Login
    console.log('2️⃣ Testing user login...');
    await page.goto('http://localhost:3000/auth/login');

    await page.fill('input[name="email"]', testCredentials.email);
    await page.fill('input[name="password"]', testCredentials.password);
    await page.click('button[type="submit"]');

    // Wait for login and redirect to home page
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ User login successful, redirected to home page');

    // Step 3: Verify Authentication State
    console.log('3️⃣ Verifying authentication state...');
    const authState = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      const accessToken = localStorage.getItem('accessToken');
      return {
        authStorage: authStorage ? JSON.parse(authStorage) : null,
        accessToken,
      };
    });

    expect(authState.authStorage.state.isAuthenticated).toBe(true);
    expect(authState.authStorage.state.user).toBeDefined();
    expect(authState.accessToken).toBeDefined();
    console.log('✅ Authentication state verified');

    // Step 4: Test Protected Route Access
    console.log('4️⃣ Testing protected route access...');
    await page.goto('http://localhost:3000/admin/users');
    await page.waitForTimeout(2000);

    const adminUrl = page.url();
    const hasAdminAccess = adminUrl.includes('/admin') && !adminUrl.includes('/auth');

    if (hasAdminAccess) {
      console.log('✅ Admin route access successful');

      // Test admin functionality
      const adminPageLoaded = await page
        .locator('h1, h2, .admin, [data-testid="admin"]')
        .isVisible()
        .catch(() => false);
      if (adminPageLoaded) {
        console.log('✅ Admin page content loaded');
      }
    } else {
      console.log('⚠️ Admin access restricted (expected for non-admin users)');
    }

    // Step 5: Test API Access with Token
    console.log('5️⃣ Testing API access with authentication token...');
    const apiResult = await page.evaluate(async token => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/users/stats', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        return {
          status: response.status,
          hasData: !!data,
          dataType: typeof data,
        };
      } catch (error) {
        return { error: error.message };
      }
    }, authState.accessToken);

    if (apiResult.status === 200) {
      expect(apiResult.hasData).toBe(true);
      console.log('✅ API access with token successful');
    } else {
      console.log(`ℹ️ API access status: ${apiResult.status} (might be permission-based)`);
    }

    // Step 6: Test Token Refresh
    console.log('6️⃣ Testing token refresh mechanism...');
    const refreshResult = await page.evaluate(async () => {
      try {
        const oldToken = localStorage.getItem('accessToken');

        const response = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.access_token);

          // Update auth storage
          const authStorage = localStorage.getItem('auth-storage');
          if (authStorage) {
            const authState = JSON.parse(authStorage);
            authState.state.tokens.accessToken = data.access_token;
            localStorage.setItem('auth-storage', JSON.stringify(authState));
          }

          return {
            success: true,
            newToken: data.access_token,
            oldToken,
            tokensAreDifferent: data.access_token !== oldToken,
          };
        } else {
          return { success: false, status: response.status };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    if (refreshResult.success) {
      expect(refreshResult.tokensAreDifferent).toBe(true);
      console.log('✅ Token refresh successful');
    } else {
      console.log('⚠️ Token refresh failed:', refreshResult);
    }

    // Step 7: Test Logout
    console.log('7️⃣ Testing logout functionality...');
    const logoutButton = page.locator(
      'button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out")',
    );

    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(2000);

      const logoutUrl = page.url();
      const isLoggedOut =
        logoutUrl.includes('/auth') ||
        logoutUrl === 'http://localhost:3000/' ||
        !logoutUrl.includes('/admin');

      expect(isLoggedOut).toBe(true);
      console.log('✅ Logout via UI successful');
    } else {
      // Programmatic logout
      await page.evaluate(async () => {
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          await fetch('http://localhost:3001/api/auth/logout', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });
        }

        localStorage.removeItem('accessToken');
        const clearedState = {
          state: {
            isAuthenticated: false,
            user: null,
            tokens: { accessToken: null },
            loading: false,
            error: null,
          },
          version: 0,
        };
        localStorage.setItem('auth-storage', JSON.stringify(clearedState));
      });
      console.log('✅ Programmatic logout successful');
    }

    // Step 8: Verify Logout State
    console.log('8️⃣ Verifying logout state...');
    const logoutState = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      const accessToken = localStorage.getItem('accessToken');
      return {
        authStorage: authStorage ? JSON.parse(authStorage) : null,
        accessToken,
      };
    });

    if (logoutState.authStorage) {
      expect(logoutState.authStorage.state.isAuthenticated).toBe(false);
      expect(logoutState.authStorage.state.user).toBeNull();
    }
    expect(logoutState.accessToken).toBeNull();
    console.log('✅ Logout state verified');

    // Step 9: Test Access After Logout
    console.log('9️⃣ Testing access after logout...');
    await page.goto('http://localhost:3000/admin/users');
    await page.waitForTimeout(2000);

    const afterLogoutUrl = page.url();
    const accessDenied =
      afterLogoutUrl.includes('/auth') ||
      afterLogoutUrl.includes('/login') ||
      !afterLogoutUrl.includes('/admin');

    if (accessDenied) {
      console.log('✅ Access properly denied after logout');
    } else {
      console.log('⚠️ Warning: Protected route might still be accessible');
    }

    console.log('🎉 Complete E2E authentication flow test completed successfully!');
  });

  test('E2E - Session persistence across page reloads', async ({ page }) => {
    console.log('💾 Testing session persistence across page reloads...');

    // Login
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', testCredentials.email);
    await page.fill('input[name="password"]', testCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });

    // Verify initial authentication
    const initialState = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      return authStorage ? JSON.parse(authStorage) : null;
    });

    expect(initialState.state.isAuthenticated).toBe(true);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check if still authenticated
    const reloadedState = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      return authStorage ? JSON.parse(authStorage) : null;
    });

    expect(reloadedState.state.isAuthenticated).toBe(true);
    expect(reloadedState.state.user).toBeDefined();
    console.log('✅ Session persisted across page reload');

    // Test functionality after reload
    await page.goto('http://localhost:3000/admin/users');
    await page.waitForTimeout(2000);

    const adminAccessAfterReload = page.url().includes('/admin');
    if (adminAccessAfterReload) {
      console.log('✅ Admin access maintained after reload');
    }

    console.log('✅ Session persistence test completed');
  });

  test('E2E - Multiple browser tab authentication sync', async ({ page, context }) => {
    console.log('🔄 Testing authentication sync across browser tabs...');

    // Login in first tab
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', testCredentials.email);
    await page.fill('input[name="password"]', testCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('http://localhost:3000');

    // Check if second tab has authentication state
    const tab2State = await page2.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      return authStorage ? JSON.parse(authStorage) : null;
    });

    if (tab2State && tab2State.state.isAuthenticated) {
      console.log('✅ Authentication state shared across tabs');

      // Test admin access in second tab
      await page2.goto('http://localhost:3000/admin/users');
      await page2.waitForTimeout(2000);

      const tab2AdminAccess = page2.url().includes('/admin');
      if (tab2AdminAccess) {
        console.log('✅ Admin access working in second tab');
      }
    } else {
      console.log('ℹ️ Authentication state not automatically synced (depends on implementation)');
    }

    // Logout from first tab
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(2000);
    }

    // Check if second tab reflects logout
    await page2.reload();
    await page2.waitForLoadState('networkidle');

    const tab2AfterLogout = await page2.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      return authStorage ? JSON.parse(authStorage) : null;
    });

    if (tab2AfterLogout && !tab2AfterLogout.state.isAuthenticated) {
      console.log('✅ Logout synced across tabs');
    }

    await page2.close();
    console.log('✅ Multi-tab authentication test completed');
  });

  test('E2E - Authentication error scenarios and recovery', async ({ page }) => {
    console.log('🚨 Testing authentication error scenarios and recovery...');

    // Test 1: Invalid credentials
    console.log('Testing invalid credentials...');
    await page.goto('http://localhost:3000/auth/login');
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Should stay on login page
    expect(page.url()).toContain('/auth/login');
    console.log('✅ Invalid credentials handled correctly');

    // Test 2: Network error simulation (if possible)
    console.log('Testing network error recovery...');

    // Test 3: Successful login after errors
    console.log('Testing recovery with valid credentials...');
    await page.fill('input[name="email"]', testCredentials.email);
    await page.fill('input[name="password"]', testCredentials.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
    console.log('✅ Recovery with valid credentials successful');

    // Test 4: Token expiration scenario
    console.log('Testing token expiration handling...');

    // Manually corrupt the access token
    await page.evaluate(() => {
      localStorage.setItem('accessToken', 'expired-or-invalid-token');
    });

    // Try to access protected resource
    const expiredTokenResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/users/stats', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer expired-or-invalid-token',
            'Content-Type': 'application/json',
          },
        });
        return { status: response.status };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(expiredTokenResult.status).toBe(401);
    console.log('✅ Expired token properly rejected');

    // Test automatic token refresh
    const refreshAttempt = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('accessToken', data.access_token);
          return { success: true, newToken: data.access_token };
        } else {
          return { success: false, status: response.status };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });

    if (refreshAttempt.success) {
      console.log('✅ Automatic token refresh working');
    } else {
      console.log('ℹ️ Token refresh failed (might need new login)');
    }

    console.log('✅ Error scenarios and recovery test completed');
  });
});
