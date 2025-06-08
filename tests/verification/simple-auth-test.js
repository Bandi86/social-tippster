import { chromium } from 'playwright';

async function simpleAuthTest() {
  console.log('🔍 Simple Authentication F5 Test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('1️⃣ Navigating to the app...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded\n');

    // Check localStorage before refresh
    console.log('2️⃣ Checking localStorage BEFORE refresh...');
    const beforeRefresh = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      const authToken = localStorage.getItem('authToken');

      let parsedAuthStorage = null;
      if (authStorage) {
        try {
          parsedAuthStorage = JSON.parse(authStorage);
        } catch (e) {
          parsedAuthStorage = { error: e.message };
        }
      }

      return {
        hasAuthStorage: !!authStorage,
        hasAuthToken: !!authToken,
        authStorageData: parsedAuthStorage,
        authTokenValue: authToken,
      };
    });

    console.log('   auth-storage present:', beforeRefresh.hasAuthStorage);
    console.log('   authToken present:', beforeRefresh.hasAuthToken);
    if (beforeRefresh.authStorageData) {
      const token = beforeRefresh.authStorageData.state?.tokens?.accessToken;
      const user = beforeRefresh.authStorageData.state?.user;
      console.log('   Token in auth-storage:', token ? 'Present' : 'Not found');
      console.log('   User in auth-storage:', user ? 'Present' : 'Not found');
    }
    console.log('');

    // Perform F5 refresh
    console.log('3️⃣ Performing F5 refresh...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for auth initialization
    console.log('✅ Page refreshed\n');

    // Check localStorage after refresh
    console.log('4️⃣ Checking localStorage AFTER refresh...');
    const afterRefresh = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      const authToken = localStorage.getItem('authToken');

      let parsedAuthStorage = null;
      if (authStorage) {
        try {
          parsedAuthStorage = JSON.parse(authStorage);
        } catch (e) {
          parsedAuthStorage = { error: e.message };
        }
      }

      return {
        hasAuthStorage: !!authStorage,
        hasAuthToken: !!authToken,
        authStorageData: parsedAuthStorage,
        authTokenValue: authToken,
      };
    });

    console.log('   auth-storage present:', afterRefresh.hasAuthStorage);
    console.log('   authToken present:', afterRefresh.hasAuthToken);
    if (afterRefresh.authStorageData) {
      const token = afterRefresh.authStorageData.state?.tokens?.accessToken;
      const user = afterRefresh.authStorageData.state?.user;
      console.log('   Token in auth-storage:', token ? 'Present' : 'Not found');
      console.log('   User in auth-storage:', user ? 'Present' : 'Not found');
    }
    console.log('');

    // Assessment
    console.log('📊 ASSESSMENT:');
    console.log('='.repeat(40));

    const noDualStorageBefore = !beforeRefresh.hasAuthToken;
    const noDualStorageAfter = !afterRefresh.hasAuthToken;
    const stateConsistent = beforeRefresh.hasAuthStorage === afterRefresh.hasAuthStorage;

    if (noDualStorageBefore && noDualStorageAfter) {
      console.log('✅ EXCELLENT: No dual storage detected before or after refresh');
    } else if (noDualStorageAfter) {
      console.log('✅ GOOD: No dual storage after refresh (fix working)');
    } else {
      console.log('❌ ISSUE: Dual storage still detected');
    }

    if (stateConsistent) {
      console.log('✅ GOOD: Storage state consistent after refresh');
    } else {
      console.log('❌ ISSUE: Storage state changed after refresh');
    }

    // Test a protected route
    console.log('\n5️⃣ Testing protected route access...');
    try {
      await page.goto('http://localhost:3000/live-matches');
      await page.waitForLoadState('networkidle');
      const currentUrl = page.url();

      if (currentUrl.includes('live-matches')) {
        console.log('✅ GOOD: Can access protected route');
      } else {
        console.log('❌ ISSUE: Redirected from protected route to:', currentUrl);
      }
    } catch (error) {
      console.log('❌ ISSUE: Error accessing protected route:', error.message);
    }

    console.log('\n🎯 Simple Auth Test Complete!');
    console.log('Browser will stay open for 15 seconds for manual inspection...');
    await page.waitForTimeout(15000);
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

simpleAuthTest().catch(console.error);
