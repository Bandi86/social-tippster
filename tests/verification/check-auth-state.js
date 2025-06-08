import { chromium } from 'playwright';

async function checkCurrentAuthState() {
  console.log('🔍 Checking Current Authentication State...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the app
    console.log('1️⃣ Navigating to the app...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded\n');

    // Check localStorage state
    console.log('2️⃣ Checking localStorage state...');
    const authStorage = await page.evaluate(() => {
      return localStorage.getItem('auth-storage');
    });
    const authToken = await page.evaluate(() => {
      return localStorage.getItem('authToken');
    });

    console.log('   auth-storage:', authStorage ? 'Present' : 'Not found');
    console.log('   authToken:', authToken ? 'Present (PROBLEM!)' : 'Not found (GOOD)');

    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        console.log(
          '   Token in auth-storage:',
          authData.state?.accessToken ? 'Present' : 'Not found',
        );
        console.log('   User in auth-storage:', authData.state?.user ? 'Present' : 'Not found');
        if (authData.state?.user) {
          console.log('   User email:', authData.state.user.email || 'Not found');
        }
      } catch (e) {
        console.log('   Error parsing auth-storage:', e.message);
      }
    }
    console.log('');

    // Check current page and navbar
    console.log('3️⃣ Checking current page state...');
    const currentUrl = page.url();
    console.log('   Current URL:', currentUrl);

    const navbarState = await page.evaluate(() => {
      const messageIcon = document.querySelector(
        '[data-testid="message-icon"], .message-icon, [aria-label*="message"], [title*="message"]',
      );
      const loginButton = document.querySelector(
        'a[href*="login"], button:has-text("Login"), button:has-text("Sign In")',
      );
      const logoutButton = document.querySelector(
        'button:has-text("Logout"), button:has-text("Sign Out"), [aria-label*="logout"]',
      );
      const userMenu = document.querySelector('[data-testid="user-menu"], .user-menu');

      return {
        messageIcon: messageIcon ? 'visible' : 'not found',
        loginButton: loginButton ? 'visible' : 'not found',
        logoutButton: logoutButton ? 'visible' : 'not found',
        userMenu: userMenu ? 'visible' : 'not found',
      };
    });

    console.log('   Message icon:', navbarState.messageIcon);
    console.log('   Login button:', navbarState.loginButton);
    console.log('   Logout button:', navbarState.logoutButton);
    console.log('   User menu:', navbarState.userMenu);
    console.log('');

    // Test F5 refresh
    console.log('4️⃣ Testing F5 refresh...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✅ Page refreshed\n');

    // Check state after refresh
    console.log('5️⃣ Checking state after refresh...');
    const afterRefreshAuthStorage = await page.evaluate(() => {
      return localStorage.getItem('auth-storage');
    });
    const afterRefreshAuthToken = await page.evaluate(() => {
      return localStorage.getItem('authToken');
    });

    console.log(
      '   auth-storage after refresh:',
      afterRefreshAuthStorage ? 'Present' : 'Not found',
    );
    console.log(
      '   authToken after refresh:',
      afterRefreshAuthToken ? 'Present (PROBLEM!)' : 'Not found (GOOD)',
    );

    const navbarStateAfterRefresh = await page.evaluate(() => {
      const messageIcon = document.querySelector(
        '[data-testid="message-icon"], .message-icon, [aria-label*="message"], [title*="message"]',
      );
      const loginButton = document.querySelector(
        'a[href*="login"], button:has-text("Login"), button:has-text("Sign In")',
      );
      const logoutButton = document.querySelector(
        'button:has-text("Logout"), button:has-text("Sign Out"), [aria-label*="logout"]',
      );
      const userMenu = document.querySelector('[data-testid="user-menu"], .user-menu');

      return {
        messageIcon: messageIcon ? 'visible' : 'not found',
        loginButton: loginButton ? 'visible' : 'not found',
        logoutButton: logoutButton ? 'visible' : 'not found',
        userMenu: userMenu ? 'visible' : 'not found',
      };
    });

    console.log('   Message icon after refresh:', navbarStateAfterRefresh.messageIcon);
    console.log('   Login button after refresh:', navbarStateAfterRefresh.loginButton);
    console.log('   Logout button after refresh:', navbarStateAfterRefresh.logoutButton);
    console.log('   User menu after refresh:', navbarStateAfterRefresh.userMenu);
    console.log('');

    // Assessment
    console.log('📊 ASSESSMENT:');
    console.log('='.repeat(40));

    const noDualStorage = !afterRefreshAuthToken;
    const consistentNavbar =
      navbarState.messageIcon === navbarStateAfterRefresh.messageIcon &&
      navbarState.loginButton === navbarStateAfterRefresh.loginButton;

    if (noDualStorage) {
      console.log('✅ GOOD: No dual storage detected');
    } else {
      console.log('❌ ISSUE: Dual storage still present');
    }

    if (consistentNavbar) {
      console.log('✅ GOOD: Navbar state consistent after refresh');
    } else {
      console.log('❌ ISSUE: Navbar state changed after refresh');
    }

    console.log('\n🎯 Auth State Check Complete!\n');

    // Wait for manual inspection
    console.log('Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

checkCurrentAuthState().catch(console.error);
