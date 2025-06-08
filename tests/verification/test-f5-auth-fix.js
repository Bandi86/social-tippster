import { chromium } from 'playwright';

async function testF5AuthFix() {
  console.log('🚀 Starting F5 Authentication Fix Test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Navigate to the app
    console.log('1️⃣ Navigating to the app...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded\n');

    // Step 2: Check initial localStorage state
    console.log('2️⃣ Checking initial localStorage state...');
    const initialAuthStorage = await page.evaluate(() => {
      return localStorage.getItem('auth-storage');
    });
    const initialAuthToken = await page.evaluate(() => {
      return localStorage.getItem('authToken');
    });

    console.log('   Initial auth-storage:', initialAuthStorage ? 'Present' : 'Not found');
    console.log('   Initial authToken:', initialAuthToken ? 'Present' : 'Not found');
    console.log('');

    // Step 3: Navigate to login page
    console.log('3️⃣ Navigating to login page...');
    await page.goto('http://localhost:3000/auth/login');
    await page.waitForLoadState('networkidle');

    // Check if login form is available
    const loginForm = await page.locator('form').first();
    if ((await loginForm.count()) === 0) {
      console.log('❌ No login form found');
      return;
    }
    console.log('✅ Login form found\n');

    // Step 4: Try to login
    console.log('4️⃣ Attempting login...');
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
    await page.fill('input[name="password"], input[type="password"]', 'password123');

    // Submit the form
    await Promise.all([
      page.waitForResponse(response => response.url().includes('/api/auth/login')),
      page.click('button[type="submit"]'),
    ]);

    await page.waitForTimeout(2000); // Wait for auth state to update

    // Step 5: Check localStorage after login
    console.log('5️⃣ Checking localStorage after login...');
    const postLoginAuthStorage = await page.evaluate(() => {
      return localStorage.getItem('auth-storage');
    });
    const postLoginAuthToken = await page.evaluate(() => {
      return localStorage.getItem('authToken');
    });

    console.log('   Post-login auth-storage:', postLoginAuthStorage ? 'Present' : 'Not found');
    console.log(
      '   Post-login authToken:',
      postLoginAuthToken ? 'Present (PROBLEM!)' : 'Not found (GOOD)',
    );

    // Parse the auth-storage to check token
    let authStorageData = null;
    if (postLoginAuthStorage) {
      try {
        authStorageData = JSON.parse(postLoginAuthStorage);
        console.log(
          '   Token in auth-storage:',
          authStorageData.state?.accessToken ? 'Present' : 'Not found',
        );
      } catch (e) {
        console.log('   Error parsing auth-storage:', e.message);
      }
    }
    console.log('');

    // Step 6: Check navbar state before refresh
    console.log('6️⃣ Checking navbar state before refresh...');
    const navbarBeforeRefresh = await page.evaluate(() => {
      const messageIcon = document.querySelector('[data-testid="message-icon"], .message-icon');
      const loginButton = document.querySelector('a[href*="login"], button:has-text("Login")');
      return {
        messageIcon: messageIcon ? 'visible' : 'not found',
        loginButton: loginButton ? 'visible' : 'not found',
      };
    });
    console.log('   Message icon:', navbarBeforeRefresh.messageIcon);
    console.log('   Login button:', navbarBeforeRefresh.loginButton);
    console.log('');

    // Step 7: Perform F5 refresh
    console.log('7️⃣ Performing F5 refresh...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for auth state to initialize
    console.log('✅ Page refreshed\n');

    // Step 8: Check localStorage after refresh
    console.log('8️⃣ Checking localStorage after refresh...');
    const afterRefreshAuthStorage = await page.evaluate(() => {
      return localStorage.getItem('auth-storage');
    });
    const afterRefreshAuthToken = await page.evaluate(() => {
      return localStorage.getItem('authToken');
    });

    console.log(
      '   After-refresh auth-storage:',
      afterRefreshAuthStorage ? 'Present' : 'Not found',
    );
    console.log(
      '   After-refresh authToken:',
      afterRefreshAuthToken ? 'Present (PROBLEM!)' : 'Not found (GOOD)',
    );

    // Parse the auth-storage after refresh
    let afterRefreshAuthData = null;
    if (afterRefreshAuthStorage) {
      try {
        afterRefreshAuthData = JSON.parse(afterRefreshAuthStorage);
        console.log(
          '   Token in auth-storage after refresh:',
          afterRefreshAuthData.state?.accessToken ? 'Present' : 'Not found',
        );
      } catch (e) {
        console.log('   Error parsing auth-storage after refresh:', e.message);
      }
    }
    console.log('');

    // Step 9: Check navbar state after refresh
    console.log('9️⃣ Checking navbar state after refresh...');
    const navbarAfterRefresh = await page.evaluate(() => {
      const messageIcon = document.querySelector('[data-testid="message-icon"], .message-icon');
      const loginButton = document.querySelector('a[href*="login"], button:has-text("Login")');
      return {
        messageIcon: messageIcon ? 'visible' : 'not found',
        loginButton: loginButton ? 'visible' : 'not found',
      };
    });
    console.log('   Message icon after refresh:', navbarAfterRefresh.messageIcon);
    console.log('   Login button after refresh:', navbarAfterRefresh.loginButton);
    console.log('');

    // Step 10: Test centralized auth access
    console.log('🔟 Testing centralized auth access...');
    const centralizedAuthTest = await page.evaluate(() => {
      // Check if our centralized auth functions are working
      const authStorageRaw = localStorage.getItem('auth-storage');
      if (authStorageRaw) {
        try {
          const authData = JSON.parse(authStorageRaw);
          const token = authData.state?.accessToken;
          const isAuth = !!token;
          return {
            hasAuthStorage: true,
            hasToken: !!token,
            isAuthenticated: isAuth,
            tokenLength: token ? token.length : 0,
          };
        } catch (e) {
          return { error: e.message };
        }
      }
      return { hasAuthStorage: false };
    });

    console.log('   Centralized auth test result:', JSON.stringify(centralizedAuthTest, null, 2));
    console.log('');

    // Step 11: Final assessment
    console.log('📊 FINAL ASSESSMENT:');
    console.log('='.repeat(50));

    const hasDualStorage = !!afterRefreshAuthToken;
    const hasConsistentState =
      navbarBeforeRefresh.messageIcon === navbarAfterRefresh.messageIcon &&
      navbarBeforeRefresh.loginButton === navbarAfterRefresh.loginButton;

    if (hasDualStorage) {
      console.log('❌ ISSUE: Dual storage detected - authToken still in localStorage');
    } else {
      console.log('✅ GOOD: No dual storage - only auth-storage present');
    }

    if (hasConsistentState) {
      console.log('✅ GOOD: Navbar state consistent before/after refresh');
    } else {
      console.log('❌ ISSUE: Navbar state inconsistent after refresh');
    }

    if (centralizedAuthTest.hasAuthStorage && centralizedAuthTest.hasToken) {
      console.log('✅ GOOD: Centralized auth access working');
    } else {
      console.log('❌ ISSUE: Centralized auth access problem');
    }

    console.log('\n🎯 F5 Authentication Fix Test Complete!\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testF5AuthFix().catch(console.error);
