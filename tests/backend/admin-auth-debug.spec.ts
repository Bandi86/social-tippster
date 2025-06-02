import { expect, test } from '@playwright/test';

test.describe('Admin Authentication Debug', () => {
  test('investigate login flow and cookie setting', async ({ page }) => {
    // Enable request/response interception to monitor network traffic
    const requests: any[] = [];
    const responses: any[] = [];

    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
      });
    });

    page.on('response', response => {
      responses.push({
        url: response.url(),
        status: response.status(),
        headers: response.headers(),
      });
    });

    console.log('🔍 Starting authentication flow investigation...');

    // First, try to register a test user
    console.log('👤 Creating test user...');
    const registerResponse = await page.request.post('http://localhost:3001/api/auth/register', {
      data: {
        username: 'testadmin',
        email: 'testadmin@test.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'Admin',
      },
    });

    console.log('📝 Registration response:', registerResponse.status());
    if (registerResponse.ok()) {
      const registerData = await registerResponse.json();
      console.log('✅ User created successfully:', registerData.user?.username);
    } else {
      const errorText = await registerResponse.text();
      console.log('❌ Registration failed:', errorText);
    }

    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    console.log('📍 Current URL:', page.url());

    // Check if we're on the login page
    await expect(page).toHaveURL(/\/auth\/login/);

    // Fill in login credentials (using the test user we just created)
    console.log('🔐 Filling login form...');
    await page.fill('input[name="email"], input[type="email"]', 'testadmin@test.com');
    await page.fill('input[name="password"], input[type="password"]', 'password123');

    // Submit the form
    console.log('📤 Submitting login form...');
    await page.click('button[type="submit"]');

    // Wait for potential redirect or response
    await page.waitForTimeout(2000);

    console.log('📍 After login URL:', page.url());

    // Check cookies after login attempt
    const cookies = await page.context().cookies();
    console.log('🍪 Cookies after login:');
    cookies.forEach(cookie => {
      console.log(
        `  - ${cookie.name}: ${cookie.value} (httpOnly: ${cookie.httpOnly}, secure: ${cookie.secure})`,
      );
    });

    // Look for refresh token cookie specifically
    const refreshTokenCookie = cookies.find(
      cookie => cookie.name.includes('refresh') || cookie.name.includes('token'),
    );

    if (refreshTokenCookie) {
      console.log('✅ Found potential refresh token cookie:', refreshTokenCookie);
    } else {
      console.log('❌ No refresh token cookie found!');
    }

    // Check login-related network requests
    console.log('\n📡 Login-related network requests:');
    const loginRequests = requests.filter(
      req => req.url.includes('/auth') || req.url.includes('/login'),
    );
    loginRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
      if (req.postData) {
        console.log(`    Body: ${req.postData}`);
      }
    });

    console.log('\n📡 Login-related responses:');
    const loginResponses = responses.filter(
      res => res.url.includes('/auth') || res.url.includes('/login'),
    );
    loginResponses.forEach(res => {
      console.log(`  ${res.status} ${res.url}`);
      console.log(`    Set-Cookie:`, res.headers['set-cookie'] || 'None');
    });

    // Now try to navigate to admin page
    console.log('\n🔄 Navigating to admin users page...');
    await page.goto('http://localhost:3000/admin/users');
    await page.waitForLoadState('networkidle');

    console.log('📍 Admin page URL:', page.url());

    // Check for admin API calls
    await page.waitForTimeout(3000);

    console.log('\n📡 Admin API requests:');
    const adminRequests = requests.filter(
      req => req.url.includes('/admin') || req.url.includes('3001'),
    );
    adminRequests.forEach(req => {
      console.log(`  ${req.method} ${req.url}`);
      console.log(`    Authorization:`, req.headers.authorization || 'None');
      console.log(`    Cookie:`, req.headers.cookie || 'None');
    });

    console.log('\n📡 Admin API responses:');
    const adminResponses = responses.filter(
      res => res.url.includes('/admin') || res.url.includes('3001'),
    );
    adminResponses.forEach(res => {
      console.log(`  ${res.status} ${res.url}`);
    });

    // Check for any error messages on the page
    const errorElements = await page.locator('[role="alert"], .error, .toast-error').all();
    if (errorElements.length > 0) {
      console.log('\n❌ Found error elements on page:');
      for (const element of errorElements) {
        const text = await element.textContent();
        console.log(`  - ${text}`);
      }
    }

    // Check browser console for errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 Console error:', msg.text());
      }
    });

    // Take a screenshot for visual debugging
    await page.screenshot({ path: 'admin-debug-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved as admin-debug-screenshot.png');
  });

  test('test direct API endpoint access', async ({ page }) => {
    console.log('\n🧪 Testing direct API endpoint access...');

    // Test if backend is responding
    const backendResponse = await page.request.get('http://localhost:3001/health').catch(e => null);
    if (backendResponse) {
      console.log('✅ Backend is responding:', backendResponse.status());
    } else {
      console.log('❌ Backend is not responding');
    }

    // Test admin endpoints directly
    const adminEndpoints = ['/api/admin/users', '/api/admin/users/stats'];

    for (const endpoint of adminEndpoints) {
      try {
        const response = await page.request.get(`http://localhost:3001${endpoint}`);
        console.log(`${endpoint}: ${response.status()}`);

        if (response.status() === 401) {
          console.log('  → Authentication required');
        } else if (response.status() === 200) {
          console.log('  → Success (this might indicate auth bypass is working)');
        }
      } catch (error) {
        console.log(`${endpoint}: Failed - ${error}`);
      }
    }
  });

  test('investigate localStorage and sessionStorage', async ({ page }) => {
    console.log('\n💾 Investigating browser storage...');

    await page.goto('http://localhost:3000/admin/users');
    await page.waitForLoadState('networkidle');

    // Check localStorage
    const localStorage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key) {
          items[key] = window.localStorage.getItem(key) || '';
        }
      }
      return items;
    });

    console.log('📦 localStorage contents:');
    Object.entries(localStorage).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
    });

    // Check sessionStorage
    const sessionStorage = await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) {
          items[key] = window.sessionStorage.getItem(key) || '';
        }
      }
      return items;
    });

    console.log('📦 sessionStorage contents:');
    Object.entries(sessionStorage).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.substring(0, 100)}${value.length > 100 ? '...' : ''}`);
    });

    // Check if setTestToken was called
    const testTokenSet = await page.evaluate(() => {
      return (window as any).testTokenSet || false;
    });

    console.log('🔧 Test token bypass active:', testTokenSet);
  });
});
