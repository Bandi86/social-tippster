import { test } from '@playwright/test';

test.describe('Login Debug Test', () => {
  test('should complete login flow and show welcome message', async ({ page }) => {
    // Navigate to the auth page
    await page.goto('http://localhost:3000/auth/login');

    console.log('🔍 Starting login debug test...');
    console.log('📍 Current URL:', page.url());

    // Wait for page to load completely
    await page.waitForLoadState('networkidle');

    // Take a screenshot before login
    await page.screenshot({ path: 'tests/images/debug-before-login.png', fullPage: true });

    // Look for the login form
    const emailField = page.locator('input[name="email"], input[type="email"]');
    const passwordField = page.locator('input[name="password"], input[type="password"]');
    const loginButton = page.locator('button[type="submit"]:has-text("Bejelentkezés")');

    console.log('📧 Email field found:', await emailField.count());
    console.log('🔒 Password field found:', await passwordField.count());
    console.log('🎯 Login button found:', await loginButton.count());

    // Fill in the credentials
    await emailField.fill('alice@example.com');
    await passwordField.fill('password123');

    console.log('✅ Credentials filled');

    // Take a screenshot after filling
    await page.screenshot({ path: 'tests/images/debug-after-filling.png', fullPage: true });

    // Listen for navigation events
    page.on('response', response => {
      if (response.url().includes('/auth/login')) {
        console.log(`🌐 Login API response: ${response.status()} - ${response.statusText()}`);
      }
    });

    // Click login button
    console.log('🖱️ Clicking login button...');
    await loginButton.click();

    // Wait a moment for the request to complete
    await page.waitForTimeout(2000);

    // Take a screenshot after clicking
    await page.screenshot({ path: 'tests/images/debug-after-click.png', fullPage: true });

    console.log('📍 URL after login attempt:', page.url());

    // Check for error messages
    const errorMessage = page.locator('[class*="destructive"], .text-red-400, .text-red-500');
    const errorCount = await errorMessage.count();
    console.log('❌ Error messages found:', errorCount);
    if (errorCount > 0) {
      const errorText = await errorMessage.first().textContent();
      console.log('❌ Error text:', errorText);
    }

    // Wait for potential redirect
    try {
      await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
      console.log('✅ Redirected to home page');
    } catch (error) {
      console.log('⚠️ No redirect happened, still on:', page.url());
    }

    // Take a screenshot of final state
    await page.screenshot({ path: 'tests/images/debug-final-state.png', fullPage: true });

    // Look for the welcome message
    const welcomeMessage = page.locator('text=Jó reggelt');
    const welcomeCount = await welcomeMessage.count();
    console.log('👋 Welcome message found:', welcomeCount);

    if (welcomeCount === 0) {
      // Look for alternative text that might be there
      const allText = await page.textContent('body');
      console.log('📄 Page contains "alice":', allText?.includes('alice'));
      console.log('📄 Page contains "Alice":', allText?.includes('Alice'));
      console.log('📄 Page contains "Üdvözlünk":', allText?.includes('Üdvözlünk'));

      // Look for specific elements
      const navbar = page.locator('nav, header, [class*="nav"]');
      const navbarCount = await navbar.count();
      console.log('📊 Navbar elements found:', navbarCount);

      // Look for auth state indicators
      const loginLinks = page.locator('text=Bejelentkezés, text=Belépés');
      const logoutButtons = page.locator('text=Kijelentkezés, button:has-text("Logout")');
      console.log('🔑 Login links found:', await loginLinks.count());
      console.log('🚪 Logout buttons found:', await logoutButtons.count());
    }

    console.log('🏁 Debug test completed');
  });
});
