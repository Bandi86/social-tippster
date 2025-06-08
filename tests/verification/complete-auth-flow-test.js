import { chromium } from 'playwright';

async function testCompleteAuthFlow() {
  console.log('🚀 Testing Complete Authentication Flow with F5 Fix...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Start fresh
    console.log('1️⃣ Starting fresh - clearing storage...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    // Clear all storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('✅ Storage cleared and page refreshed\n');

    // Step 2: Verify clean state
    console.log('2️⃣ Verifying clean state...');
    const cleanState = await page.evaluate(() => {
      return {
        authStorage: localStorage.getItem('auth-storage'),
        authToken: localStorage.getItem('authToken'),
        allKeys: Object.keys(localStorage),
      };
    });

    console.log('   auth-storage:', cleanState.authStorage ? 'Present' : 'Not found');
    console.log('   authToken:', cleanState.authToken ? 'Present' : 'Not found');
    console.log('   localStorage keys:', cleanState.allKeys.join(', ') || 'none');
    console.log('');

    // Step 3: Navigate to login
    console.log('3️⃣ Navigating to auth page...');
    await page.goto('http://localhost:3000/auth');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if we can find login elements (more flexible selectors)
    const emailInput = page
      .locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
      .first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")')
      .first();

    const emailCount = await emailInput.count();
    const passwordCount = await passwordInput.count();
    const submitCount = await submitButton.count();

    console.log('   Email input found:', emailCount > 0, `(${emailCount} elements)`);
    console.log('   Password input found:', passwordCount > 0, `(${passwordCount} elements)`);
    console.log('   Submit button found:', submitCount > 0, `(${submitCount} elements)`);

    // Debug info if elements not found
    if (emailCount === 0 || passwordCount === 0 || submitCount === 0) {
      console.log('   🔍 Debugging - Current page info:');
      const pageUrl = page.url();
      const pageTitle = await page.title();
      console.log('   URL:', pageUrl);
      console.log('   Title:', pageTitle);

      // Show available inputs
      const allInputs = await page.locator('input').count();
      const allButtons = await page.locator('button').count();
      console.log('   Total inputs found:', allInputs);
      console.log('   Total buttons found:', allButtons);
    }

    if (emailCount === 0 || passwordCount === 0 || submitCount === 0) {
      console.log('❌ Login form not complete, ending test');
      console.log('Browser will stay open for inspection...');
      await page.waitForTimeout(20000);
      return;
    }
    console.log('✅ Login form complete\n');

    // Step 4: Attempt login with seeded user credentials
    console.log('4️⃣ Attempting login with seeded user...');
    await emailInput.fill('alice@example.com');
    await passwordInput.fill('password123');

    // Monitor network for login request
    const responsePromise = page
      .waitForResponse(response => response.url().includes('/api/auth/login'), { timeout: 10000 })
      .catch(() => null);

    await submitButton.click();

    const loginResponse = await responsePromise;

    if (loginResponse) {
      console.log('   Login request sent:', loginResponse.status());
      await page.waitForTimeout(3000); // Wait for auth state to update
    } else {
      console.log('   No login request detected - checking if already redirected');
    }

    // Step 5: Check post-login state
    console.log('\n5️⃣ Checking post-login state...');
    const currentUrl = page.url();
    console.log('   Current URL:', currentUrl);

    const postLoginState = await page.evaluate(() => {
      const authStorage = localStorage.getItem('auth-storage');
      const authToken = localStorage.getItem('authToken');

      let parsedAuth = null;
      if (authStorage) {
        try {
          parsedAuth = JSON.parse(authStorage);
        } catch (e) {
          parsedAuth = { error: e.message };
        }
      }

      return {
        hasAuthStorage: !!authStorage,
        hasAuthToken: !!authToken,
        tokenInStorage: parsedAuth?.state?.tokens?.accessToken ? 'Present' : 'Not found',
        userInStorage: parsedAuth?.state?.user ? 'Present' : 'Not found',
        isAuthenticated: parsedAuth?.state?.isAuthenticated || false,
      };
    });

    console.log('   auth-storage:', postLoginState.hasAuthStorage ? 'Present' : 'Not found');
    console.log(
      '   authToken (should be false):',
      postLoginState.hasAuthToken ? 'Present (ISSUE!)' : 'Not found (GOOD)',
    );
    console.log('   Token in auth-storage:', postLoginState.tokenInStorage);
    console.log('   User in auth-storage:', postLoginState.userInStorage);
    console.log('   Is authenticated:', postLoginState.isAuthenticated);
    console.log('');

    // Step 6: Test F5 refresh after login
    if (postLoginState.tokenInStorage === 'Present') {
      console.log('6️⃣ Testing F5 refresh after successful login...');
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000); // Wait for auth initialization

      const afterRefreshState = await page.evaluate(() => {
        const authStorage = localStorage.getItem('auth-storage');
        const authToken = localStorage.getItem('authToken');

        let parsedAuth = null;
        if (authStorage) {
          try {
            parsedAuth = JSON.parse(authStorage);
          } catch (e) {
            parsedAuth = { error: e.message };
          }
        }

        return {
          hasAuthStorage: !!authStorage,
          hasAuthToken: !!authToken,
          tokenInStorage: parsedAuth?.state?.tokens?.accessToken ? 'Present' : 'Not found',
          userInStorage: parsedAuth?.state?.user ? 'Present' : 'Not found',
          isAuthenticated: parsedAuth?.state?.isAuthenticated || false,
        };
      });

      console.log(
        '   After refresh - auth-storage:',
        afterRefreshState.hasAuthStorage ? 'Present' : 'Not found',
      );
      console.log(
        '   After refresh - authToken:',
        afterRefreshState.hasAuthToken ? 'Present (ISSUE!)' : 'Not found (GOOD)',
      );
      console.log('   After refresh - Token in storage:', afterRefreshState.tokenInStorage);
      console.log('   After refresh - User in storage:', afterRefreshState.userInStorage);
      console.log('   After refresh - Is authenticated:', afterRefreshState.isAuthenticated);
      console.log('');

      // Test protected route access
      console.log('7️⃣ Testing protected route access after F5...');
      await page.goto('http://localhost:3000/posts');
      await page.waitForLoadState('networkidle');
      const protectedUrl = page.url();

      if (protectedUrl.includes('posts')) {
        console.log('✅ SUCCESS: Can access protected route after F5 refresh');
      } else {
        console.log('❌ ISSUE: Redirected from protected route to:', protectedUrl);
      }
    } else {
      console.log('6️⃣ No successful login detected, skipping F5 test');
    }

    // Final assessment
    console.log('\n📊 FINAL ASSESSMENT:');
    console.log('='.repeat(50));

    if (!postLoginState.hasAuthToken) {
      console.log('✅ EXCELLENT: No dual storage - authToken not created');
    } else {
      console.log('❌ ISSUE: Dual storage still being created');
    }

    if (postLoginState.tokenInStorage === 'Present') {
      console.log('✅ GOOD: Token properly stored in centralized auth-storage');
    } else {
      console.log('❌ ISSUE: No token in centralized storage (login might have failed)');
    }

    console.log('\n🎯 Complete Auth Flow Test Complete!');
    console.log('Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.log('Browser will stay open for inspection...');
    await page.waitForTimeout(20000);
  } finally {
    await browser.close();
  }
}

testCompleteAuthFlow().catch(console.error);
