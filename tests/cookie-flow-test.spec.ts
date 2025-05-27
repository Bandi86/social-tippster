import { expect, test } from '@playwright/test';

// Add this before your test or at the top of the file
declare global {
  interface Window {
    testLogs: string[];
  }
}

test('Complete authentication flow with cookie sharing', async ({ page, context }) => {
  console.log('=== TESTING COMPLETE AUTH FLOW WITH COOKIES ===');

  // Enable cookie debugging
  await context.addInitScript(() => {
    // Override console.log to capture logs
    const originalLog = console.log;
    window.testLogs = [];
    console.log = (...args) => {
      window.testLogs.push(args.join(' '));
      originalLog(...args);
    };
  });

  // Step 1: Navigate to admin page (should redirect to login)
  await page.goto('http://localhost:3000/admin');

  // Should redirect to login or show login form
  await page.waitForTimeout(2000);

  // Step 2: Go to login page
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  // Step 3: Login
  await page.fill('input[type="email"]', 'testadmin@test.com');
  await page.fill('input[type="password"]', 'password123');

  // Monitor network requests during login
  const requests: { url: string; method: string; headers: Record<string, string> }[] = [];
  page.on('request', request => {
    requests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
    });
  });

  const responses: { url: string; status: number; headers: Record<string, string> }[] = [];
  page.on('response', response => {
    responses.push({
      url: response.url(),
      status: response.status(),
      headers: response.headers(),
    });
  });

  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  // Step 4: Check if login was successful
  const loginRequests = requests.filter(r => r.url.includes('/auth/login'));
  const loginResponses = responses.filter(r => r.url.includes('/auth/login'));

  console.log('Login requests:', loginRequests);
  console.log('Login responses:', loginResponses);

  // Step 5: Check cookies in browser
  const cookies = await context.cookies();
  console.log('All cookies after login:', cookies);

  const refreshTokenCookie = cookies.find(c => c.name === 'refresh_token');
  console.log('Refresh token cookie:', refreshTokenCookie);

  // Step 6: Try to access admin page directly
  await page.goto('http://localhost:3000/admin');
  await page.waitForTimeout(3000);

  // Step 7: Check if we're on admin page or got redirected
  const finalUrl = page.url();
  console.log('Final URL after admin access:', finalUrl);

  // Step 8: Make a direct API call to admin endpoint
  const adminApiResponse = await page.evaluate(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/users/stats', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : await response.text(),
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  });

  console.log('Direct admin API call result:', adminApiResponse);

  // Step 9: Test refresh token endpoint directly
  const refreshTestResponse = await page.evaluate(async () => {
    try {
      console.log('Testing refresh endpoint with cookies...');
      console.log('Current document.cookie:', document.cookie);

      const response = await fetch('http://localhost:3001/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : await response.text(),
        headers: Object.fromEntries(response.headers.entries()),
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  });

  console.log('Refresh token test result:', refreshTestResponse);

  // Get console logs from page
  const pageLogs = await page.evaluate(() => window.testLogs || []);
  console.log('Page console logs:', pageLogs);

  // Assertions
  expect(refreshTokenCookie).toBeTruthy();
  expect(refreshTokenCookie?.httpOnly).toBe(true);
  expect(refreshTestResponse.ok).toBe(true);
});
