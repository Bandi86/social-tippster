import { test } from '@playwright/test';

test('Frontend authentication flow with cookies', async ({ page, context }) => {
  console.log('=== TESTING FRONTEND AUTH FLOW ===');

  // Step 1: Navigate to home page first
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Step 2: Test login via frontend auth store
  await page.evaluate(async () => {
    try {
      console.log('Testing frontend login with credentials...');

      // Test login using fetch with credentials
      const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // This is the key fix
        body: JSON.stringify({
          email: 'testadmin@test.com',
          password: 'password123',
        }),
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('Frontend login successful:', loginData.user.username);

        // Store access token in localStorage (as the frontend does)
        localStorage.setItem('accessToken', loginData.access_token);

        // Test refresh endpoint
        console.log('Testing refresh token...');
        const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // This will send the httpOnly cookie
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          console.log('Refresh token successful, new access token received');

          // Test admin endpoint
          const adminResponse = await fetch('http://localhost:3001/api/admin/users/stats', {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${refreshData.access_token}`,
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            console.log('Admin endpoint successful:', adminData);
            return { success: true, message: 'All authentication flows working!' };
          } else {
            return {
              success: false,
              message: 'Admin endpoint failed',
              status: adminResponse.status,
            };
          }
        } else {
          return { success: false, message: 'Refresh failed', status: refreshResponse.status };
        }
      } else {
        return { success: false, message: 'Login failed', status: loginResponse.status };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Step 3: Check if we can access admin page
  await page.goto('http://localhost:3000/admin');
  await page.waitForTimeout(5000);

  const finalUrl = page.url();
  console.log('Final URL after admin access:', finalUrl);

  // Check page content
  const pageContent = await page.textContent('body');
  console.log(
    'Page contains admin content:',
    pageContent?.includes('Admin') || pageContent?.includes('admin'),
  );
});
