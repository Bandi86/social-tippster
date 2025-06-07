/**
 * Frontend Auth Flow Test - Simulate actual auth store and API client behavior
 */

import { chromium } from 'playwright';

async function testFrontendAuthFlow() {
  console.log('🎭 Starting Playwright frontend auth test...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 1000 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Set up network request monitoring
  const networkRequests = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('api')) {
      networkRequests.push({
        method: request.method(),
        url: url,
        headers: request.headers(),
        timestamp: new Date().toISOString()
      });
      console.log(`🌐 REQUEST: ${request.method()} ${url}`);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (url.includes('api')) {
      console.log(`📡 RESPONSE: ${response.status()} ${url}`);
      if (response.status() >= 400) {
        console.log(`   ❌ Error response for: ${url}`);
      }
    }
  });

  try {
    // Step 1: Navigate to the app
    console.log('1️⃣ Navigating to frontend app...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Wait a bit for any initial auth checks
    await page.waitForTimeout(2000);
    console.log('✅ App loaded');

    // Step 2: Check if login page is visible
    console.log('\n2️⃣ Checking current page state...');
    const currentUrl = page.url();
    console.log('   Current URL:', currentUrl);

    // Check if we need to log in
    const loginForm = await page.$('form[action*="login"]');
    const emailInput = await page.$('input[name="email"]');

    if (loginForm || emailInput) {
      console.log('   📝 Login form detected, proceeding with login...');

      // Step 3: Perform login
      console.log('\n3️⃣ Performing login...');

      if (emailInput) {
        await page.fill('input[name="email"]', 'testadmin@test.com');
        await page.fill('input[name="password"]', 'password123');

        console.log('   📝 Credentials filled, submitting...');

        // Click submit and wait for response
        await Promise.all([
          page.waitForResponse(response =>
            response.url().includes('/api/auth/login') && response.status() === 201
          ),
          page.click('button[type="submit"]')
        ]);

        console.log('   ✅ Login submitted, waiting for completion...');

        // Wait for redirect or auth state change
        await page.waitForTimeout(3000);

        const newUrl = page.url();
        console.log('   📍 Post-login URL:', newUrl);
      }
    } else {
      console.log('   ✅ Already logged in or no login form found');
    }

    // Step 4: Check for any authentication errors
    console.log('\n4️⃣ Analyzing network requests...');

    const apiRequests = networkRequests.filter(req => req.url.includes('/api/'));
    const doubleApiRequests = networkRequests.filter(req => req.url.includes('/api/api/'));
    const authRequests = networkRequests.filter(req => req.url.includes('/auth/'));

    console.log(`   📊 Total API requests: ${apiRequests.length}`);
    console.log(`   🔍 Double /api requests: ${doubleApiRequests.length}`);
    console.log(`   🔐 Auth requests: ${authRequests.length}`);

    if (doubleApiRequests.length > 0) {
      console.log('\n   ❌ FOUND DOUBLE /API REQUESTS:');
      doubleApiRequests.forEach(req => {
        console.log(`      ${req.method} ${req.url}`);
      });
    }

    // Step 5: Try triggering auth store initialization manually
    console.log('\n5️⃣ Testing auth store operations...');

    const authStoreTest = await page.evaluate(async () => {
      try {
        // Check if auth store is available
        if (window.useAuthStore) {
          const store = window.useAuthStore.getState();
          return {
            isAuthenticated: store.isAuthenticated,
            hasUser: !!store.user,
            hasTokens: !!store.tokens
          };
        }
        return { error: 'Auth store not available' };
      } catch (error) {
        return { error: error.message };
      }
    });

    console.log('   Auth store state:', authStoreTest);

    // Step 6: Wait for any additional network activity
    console.log('\n6️⃣ Waiting for additional network activity...');
    await page.waitForTimeout(5000);

    // Final analysis
    console.log('\n📋 FINAL ANALYSIS:');
    console.log('   Total network requests captured:', networkRequests.length);

    const errorRequests = networkRequests.filter(req =>
      req.url.includes('/api/api/') || req.url.includes('404')
    );

    if (errorRequests.length > 0) {
      console.log('   ❌ PROBLEMATIC REQUESTS FOUND:');
      errorRequests.forEach(req => {
        console.log(`      ${req.method} ${req.url}`);
      });
    } else {
      console.log('   ✅ No double /api prefix requests detected');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testFrontendAuthFlow().then(() => {
  console.log('\n🏁 Frontend auth test completed!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Test crashed:', error);
  process.exit(1);
});
