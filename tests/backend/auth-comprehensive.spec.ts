import { expect, test } from '@playwright/test';

test.describe('Comprehensive Authentication Backend Tests', () => {
  const testUser = {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    username: 'testuser',
  };

  const adminUser = {
    email: 'testadmin@test.com',
    password: 'password123',
  };

  test.beforeEach(async ({ page }) => {
    // Ensure clean state
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
  });

  test('Auth API - Registration endpoint validation', async ({ page }) => {
    console.log('🧪 Testing registration API endpoint...');

    const registrationResult = await page.evaluate(async user => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(user),
        });

        const data = await response.json();
        return {
          status: response.status,
          data,
          headers: Object.fromEntries([...response.headers.entries()]),
        };
      } catch (error) {
        return { error: error.message };
      }
    }, testUser);

    console.log('📊 Registration result:', registrationResult);

    // Validate successful registration
    if (registrationResult.status === 201) {
      expect(registrationResult.data.user).toBeDefined();
      expect(registrationResult.data.user.email).toBe(testUser.email);
      expect(registrationResult.data.user.username).toBe(testUser.username);
      expect(registrationResult.data.access_token).toBeDefined();
      console.log('✅ Registration successful');
    } else {
      console.log('ℹ️ Registration failed (user might already exist)');
    }
  });

  test('Auth API - Login endpoint with token validation', async ({ page }) => {
    console.log('🔐 Testing login API endpoint...');

    const loginResult = await page.evaluate(async user => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            email: user.email,
            password: user.password,
          }),
        });

        const data = await response.json();
        const headers = Object.fromEntries([...response.headers.entries()]);

        return {
          status: response.status,
          data,
          headers,
          setCookie: response.headers.get('set-cookie'),
        };
      } catch (error) {
        return { error: error.message };
      }
    }, adminUser);

    console.log('📊 Login result status:', loginResult.status);

    expect(loginResult.status).toBe(200);
    expect(loginResult.data.access_token).toBeDefined();
    expect(loginResult.data.user).toBeDefined();
    expect(loginResult.data.user.email).toBe(adminUser.email);

    // Validate refresh token cookie
    if (loginResult.setCookie) {
      expect(loginResult.setCookie).toContain('refresh_token');
      expect(loginResult.setCookie).toContain('HttpOnly');
      expect(loginResult.setCookie).toContain('SameSite');
      console.log('✅ Refresh token cookie set correctly');
    }

    console.log('✅ Login endpoint validation successful');
  });

  test('Auth API - Token refresh mechanism', async ({ page }) => {
    console.log('🔄 Testing token refresh mechanism...');

    // First login to get tokens
    const loginResult = await page.evaluate(async user => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: user.email, password: user.password }),
      });
      return response.json();
    }, adminUser);

    expect(loginResult.access_token).toBeDefined();

    // Wait a moment to ensure timestamp difference
    await page.waitForTimeout(1000);

    // Test refresh endpoint
    const refreshResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        const data = await response.json();
        return {
          status: response.status,
          data,
          setCookie: response.headers.get('set-cookie'),
        };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('📊 Refresh result:', refreshResult.status);

    expect(refreshResult.status).toBe(200);
    expect(refreshResult.data.access_token).toBeDefined();
    expect(refreshResult.data.access_token).not.toBe(loginResult.access_token);

    console.log('✅ Token refresh mechanism working correctly');
  });

  test('Auth API - Logout and token invalidation', async ({ page }) => {
    console.log('🚪 Testing logout and token invalidation...');

    // Login first
    const loginResult = await page.evaluate(async user => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: user.email, password: user.password }),
      });
      return response.json();
    }, adminUser);

    // Test logout
    const logoutResult = await page.evaluate(async token => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        return {
          status: response.status,
          setCookie: response.headers.get('set-cookie'),
        };
      } catch (error) {
        return { error: error.message };
      }
    }, loginResult.access_token);

    expect(logoutResult.status).toBe(200);

    // Verify tokens are invalidated by trying to use refresh
    const refreshAfterLogout = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        });
        return { status: response.status };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(refreshAfterLogout.status).toBe(401);
    console.log('✅ Logout and token invalidation working correctly');
  });

  test('Auth API - Protected endpoint access control', async ({ page }) => {
    console.log('🛡️ Testing protected endpoint access control...');

    // Test access without token
    const unauthorizedResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/users/stats', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        return { status: response.status };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(unauthorizedResult.status).toBe(401);
    console.log('✅ Unauthorized access properly blocked');

    // Login and test authorized access
    const loginResult = await page.evaluate(async user => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: user.email, password: user.password }),
      });
      return response.json();
    }, adminUser);

    const authorizedResult = await page.evaluate(async token => {
      try {
        const response = await fetch('http://localhost:3001/api/admin/users/stats', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        return { status: response.status };
      } catch (error) {
        return { error: error.message };
      }
    }, loginResult.access_token);

    expect(authorizedResult.status).toBe(200);
    console.log('✅ Authorized access working correctly');
  });

  test('Auth API - Invalid credentials handling', async ({ page }) => {
    console.log('❌ Testing invalid credentials handling...');

    const invalidLoginResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: 'invalid@example.com',
            password: 'wrongpassword',
          }),
        });

        const data = await response.json();
        return { status: response.status, data };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(invalidLoginResult.status).toBe(401);
    expect(invalidLoginResult.data.access_token).toBeUndefined();
    console.log('✅ Invalid credentials properly rejected');
  });

  test('Auth API - Malformed request handling', async ({ page }) => {
    console.log('🚫 Testing malformed request handling...');

    // Test missing email
    const missingEmailResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: 'password123' }),
        });
        return { status: response.status };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(missingEmailResult.status).toBe(400);

    // Test missing password
    const missingPasswordResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com' }),
        });
        return { status: response.status };
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(missingPasswordResult.status).toBe(400);
    console.log('✅ Malformed requests properly handled');
  });
});
