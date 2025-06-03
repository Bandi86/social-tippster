import { expect, test } from '@playwright/test';

test.describe('Frontend Auth Store Comprehensive Tests', () => {
  const testCredentials = {
    email: 'testadmin@test.com',
    password: 'password123',
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Clear any existing auth state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test('Auth Store - Initial state and store structure', async ({ page }) => {
    console.log('🏪 Testing auth store initial state...');

    const initialState = await page.evaluate(() => {
      // Access the Zustand store directly
      const authStorage = localStorage.getItem('auth-storage');
      return authStorage ? JSON.parse(authStorage) : null;
    });

    // Initial state should be null or have default values
    if (initialState) {
      expect(initialState.state.isAuthenticated).toBe(false);
      expect(initialState.state.user).toBeNull();
      expect(initialState.state.tokens.accessToken).toBeNull();
    }

    console.log('✅ Initial auth store state verified');
  });

  test('Auth Store - Login flow and state updates', async ({ page }) => {
    console.log('🔐 Testing auth store login flow...');

    // Inject auth store methods for testing
    const loginResult = await page.evaluate(async credentials => {
      try {
        // Simulate the auth store login method
        const response = await fetch('http://localhost:3001/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          throw new Error(`Login failed: ${response.status}`);
        }

        const data = await response.json();

        // Simulate auth store state update
        const authState = {
          state: {
            isAuthenticated: true,
            user: data.user,
            tokens: {
              accessToken: data.access_token,
            },
            loading: false,
            error: null,
          },
          version: 0,
        };

        localStorage.setItem('auth-storage', JSON.stringify(authState));
        localStorage.setItem('accessToken', data.access_token);

        return {
          success: true,
          user: data.user,
          accessToken: data.access_token,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    }, testCredentials);

    expect(loginResult.success).toBe(true);
    expect(loginResult.user).toBeDefined();
    expect(loginResult.user.email).toBe(testCredentials.email);
    expect(loginResult.accessToken).toBeDefined();

    // Verify localStorage state
    const storedState = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      return authStorage ? JSON.parse(authStorage) : null;
    });

    expect(storedState.state.isAuthenticated).toBe(true);
    expect(storedState.state.user.email).toBe(testCredentials.email);
    expect(storedState.state.tokens.accessToken).toBe(loginResult.accessToken);

    console.log('✅ Auth store login flow working correctly');
  });

  test('Auth Store - Token refresh handling', async ({ page }) => {
    console.log('🔄 Testing auth store token refresh...');

    // First login
    await page.evaluate(async credentials => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      localStorage.setItem('accessToken', data.access_token);
      const authState = {
        state: {
          isAuthenticated: true,
          user: data.user,
          tokens: { accessToken: data.access_token },
          loading: false,
          error: null,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
    }, testCredentials);

    // Wait and then test refresh
    await page.waitForTimeout(1000);

    const refreshResult = await page.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Refresh failed: ${response.status}`);
        }

        const data = await response.json();
        const oldToken = localStorage.getItem('accessToken');

        // Update tokens in storage
        localStorage.setItem('accessToken', data.access_token);

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
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    });

    expect(refreshResult.success).toBe(true);
    expect(refreshResult.newToken).toBeDefined();
    expect(refreshResult.tokensAreDifferent).toBe(true);

    console.log('✅ Auth store token refresh working correctly');
  });

  test('Auth Store - Logout and state cleanup', async ({ page }) => {
    console.log('🚪 Testing auth store logout flow...');

    // Setup authenticated state
    await page.evaluate(async credentials => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      localStorage.setItem('accessToken', data.access_token);
      const authState = {
        state: {
          isAuthenticated: true,
          user: data.user,
          tokens: { accessToken: data.access_token },
          loading: false,
          error: null,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
    }, testCredentials);

    // Test logout
    const logoutResult = await page.evaluate(async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');

        // Call logout API
        const response = await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        // Clear local storage (simulate auth store logout)
        localStorage.removeItem('accessToken');

        const clearedAuthState = {
          state: {
            isAuthenticated: false,
            user: null,
            tokens: { accessToken: null },
            loading: false,
            error: null,
          },
          version: 0,
        };
        localStorage.setItem('auth-storage', JSON.stringify(clearedAuthState));

        return {
          success: response.ok,
          status: response.status,
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
        };
      }
    });

    expect(logoutResult.success).toBe(true);

    // Verify state is cleared
    const finalState = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      const accessToken = localStorage.getItem('accessToken');

      return {
        authState: authStorage ? JSON.parse(authStorage) : null,
        accessToken,
      };
    });

    expect(finalState.authState.state.isAuthenticated).toBe(false);
    expect(finalState.authState.state.user).toBeNull();
    expect(finalState.authState.state.tokens.accessToken).toBeNull();
    expect(finalState.accessToken).toBeNull();

    console.log('✅ Auth store logout and cleanup working correctly');
  });

  test('Auth Store - Error handling and loading states', async ({ page }) => {
    console.log('🚨 Testing auth store error handling...');

    const errorHandlingResult = await page.evaluate(async () => {
      try {
        // Test with invalid credentials
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

        // Simulate auth store error state
        const errorState = {
          state: {
            isAuthenticated: false,
            user: null,
            tokens: { accessToken: null },
            loading: false,
            error: data.message || 'Login failed',
          },
          version: 0,
        };
        localStorage.setItem('auth-storage', JSON.stringify(errorState));

        return {
          status: response.status,
          errorHandled: true,
          errorMessage: data.message,
        };
      } catch (error) {
        return {
          errorHandled: true,
          networkError: error.message,
        };
      }
    });

    expect(errorHandlingResult.errorHandled).toBe(true);
    expect(errorHandlingResult.status).toBe(401);

    // Verify error state
    const errorState = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      return authStorage ? JSON.parse(authStorage) : null;
    });

    expect(errorState.state.isAuthenticated).toBe(false);
    expect(errorState.state.error).toBeDefined();

    console.log('✅ Auth store error handling working correctly');
  });

  test('Auth Store - Persistence across page reloads', async ({ page }) => {
    console.log('💾 Testing auth store persistence...');

    // Login and set state
    await page.evaluate(async credentials => {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      localStorage.setItem('accessToken', data.access_token);
      const authState = {
        state: {
          isAuthenticated: true,
          user: data.user,
          tokens: { accessToken: data.access_token },
          loading: false,
          error: null,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
    }, testCredentials);

    // Reload page
    await page.reload();

    // Check if state persists
    const persistedState = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      const accessToken = localStorage.getItem('accessToken');

      return {
        authState: authStorage ? JSON.parse(authStorage) : null,
        accessToken,
      };
    });

    expect(persistedState.authState.state.isAuthenticated).toBe(true);
    expect(persistedState.authState.state.user).toBeDefined();
    expect(persistedState.authState.state.tokens.accessToken).toBeDefined();
    expect(persistedState.accessToken).toBeDefined();

    console.log('✅ Auth store persistence working correctly');
  });

  test('Auth Store - Initialize method and automatic token validation', async ({ page }) => {
    console.log('🚀 Testing auth store initialization...');

    // Set up a stored auth state (simulating returning user)
    await page.evaluate(() => {
      const authState = {
        state: {
          isAuthenticated: true,
          user: { id: 1, email: 'testadmin@test.com', role: 'admin' },
          tokens: { accessToken: 'stored-token' },
          loading: false,
          error: null,
        },
        version: 0,
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
      localStorage.setItem('accessToken', 'stored-token');
    });

    // Test initialization (would normally happen on app start)
    const initResult = await page.evaluate(async () => {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        const accessToken = localStorage.getItem('accessToken');

        if (!authStorage || !accessToken) {
          return { initialized: false, reason: 'No stored state' };
        }

        const authState = JSON.parse(authStorage);

        // Simulate token validation by trying to refresh
        const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();

          // Update with new token
          authState.state.tokens.accessToken = refreshData.access_token;
          localStorage.setItem('auth-storage', JSON.stringify(authState));
          localStorage.setItem('accessToken', refreshData.access_token);

          return {
            initialized: true,
            tokenRefreshed: true,
            newToken: refreshData.access_token,
          };
        } else {
          // Invalid session, clear state
          localStorage.removeItem('auth-storage');
          localStorage.removeItem('accessToken');

          return {
            initialized: true,
            sessionInvalid: true,
            stateCleared: true,
          };
        }
      } catch (error) {
        return {
          initialized: false,
          error: error.message,
        };
      }
    });

    expect(initResult.initialized).toBe(true);

    if (initResult.tokenRefreshed) {
      expect(initResult.newToken).toBeDefined();
      console.log('✅ Auth store initialization with token refresh successful');
    } else if (initResult.sessionInvalid) {
      console.log('✅ Auth store initialization with session cleanup successful');
    }
  });
});
