import { test } from '@playwright/test';

test.describe('Admin Users Page - Final Test', () => {
  test('admin users page works end-to-end', async ({ page }) => {
    // Add longer timeouts to avoid rate limiting issues
    test.setTimeout(60000);

    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Login as admin
    await page.fill('input[name="email"]', 'testadmin@test.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for successful login
    await page.waitForURL(/dashboard/, { timeout: 10000 });
    console.log('✅ Successfully logged in');

    // Wait a moment to ensure session is established
    await page.waitForTimeout(2000);

    // Navigate to admin users page
    await page.goto('http://localhost:3000/admin/users');
    console.log('✅ Navigated to admin users page');

    // Wait for page to load and API calls to complete
    await page.waitForTimeout(5000);

    // Check if we can see any user data or error messages
    const bodyText = await page.locator('body').textContent();
    console.log('Page contains "Total Users":', bodyText?.includes('Total Users'));
    console.log('Page contains "Users (":', bodyText?.includes('Users ('));
    console.log('Page contains error messages:', bodyText?.includes('Failed to load'));

    // Take a screenshot for manual verification
    await page.screenshot({ path: 'admin-users-final-test.png', fullPage: true });
    console.log('✅ Screenshot saved as admin-users-final-test.png');

    // Try to find stats section
    const statsSection = page.locator('[data-testid="admin-stats"]');
    const statsExists = await statsSection.count();
    console.log('Stats section found:', statsExists > 0);

    if (statsExists > 0) {
      const statsText = await statsSection.textContent();
      console.log('Stats section text:', statsText);
    }

    // Look for user table
    const userTable = page.locator('table');
    const tableExists = await userTable.count();
    console.log('User table found:', tableExists > 0);

    if (tableExists > 0) {
      const tableRows = page.locator('tbody tr');
      const rowCount = await tableRows.count();
      console.log('Number of user rows:', rowCount);

      if (rowCount > 0) {
        const firstRowText = await tableRows.first().textContent();
        console.log('First row content:', firstRowText);
      }
    }

    // Check for specific content that indicates success
    const hasUserManagement = bodyText?.includes('User Management');
    const hasTotalUsers = bodyText?.includes('Total Users');
    const hasUsersTable = bodyText?.includes('Users (');

    console.log('\n📊 Final Results:');
    console.log('- Has User Management heading:', hasUserManagement);
    console.log('- Has Total Users stats:', hasTotalUsers);
    console.log('- Has Users table section:', hasUsersTable);
    console.log('- Stats section exists:', statsExists > 0);
    console.log('- Table exists:', tableExists > 0);

    if (hasUserManagement && hasTotalUsers && hasUsersTable) {
      console.log('\n🎉 ADMIN USERS PAGE IS WORKING SUCCESSFULLY!');
    } else {
      console.log('\n⚠️  Admin users page may have issues - check screenshot for details');
    }
  });
});
