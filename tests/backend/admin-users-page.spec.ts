import { expect, test } from '@playwright/test';

test.describe('Admin Users Page', () => {
  test('should load and display user data for admin user', async ({ page }) => {
    // Navigate to login page
    await page.goto('http://localhost:3000/auth/login');

    // Fill in admin credentials
    await page.fill('input[name="email"]', 'testadmin@test.com');
    await page.fill('input[name="password"]', 'password123');

    // Submit login form
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard or admin area
    await page.waitForURL(/dashboard|admin/);

    // Navigate to admin users page
    await page.goto('http://localhost:3000/admin/users');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if we're on the admin users page
    await expect(page).toHaveURL('http://localhost:3000/admin/users');

    // Wait for stats to load and check if stats are displayed
    await page.waitForSelector('[data-testid="admin-stats"]', { timeout: 10000 });

    // Check that stats cards are visible and contain data
    const totalUsersCard = page.locator('.text-amber-500').filter({ hasText: 'Total Users' });
    await expect(totalUsersCard).toBeVisible();

    const activeUsersCard = page.locator('.text-green-500').filter({ hasText: 'Active Users' });
    await expect(activeUsersCard).toBeVisible();

    const bannedUsersCard = page.locator('.text-red-500').filter({ hasText: 'Banned Users' });
    await expect(bannedUsersCard).toBeVisible();

    const adminsCard = page.locator('.text-blue-500').filter({ hasText: 'Admins' });
    await expect(adminsCard).toBeVisible();

    // Wait for users table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Check if users table is visible and contains data
    const usersTable = page.locator('table');
    await expect(usersTable).toBeVisible();

    // Check if table has headers
    await expect(page.locator('th', { hasText: 'User' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Email' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Role' })).toBeVisible();
    await expect(page.locator('th', { hasText: 'Status' })).toBeVisible();

    // Check if table has user rows
    const userRows = page.locator('tbody tr');
    const rowCount = await userRows.count();
    expect(rowCount).toBeGreaterThan(0);

    // Check if pagination is working
    const paginationInfo = page.locator('text=/\\d+ to \\d+ of \\d+ users/');
    await expect(paginationInfo).toBeVisible();

    // Test search functionality
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Search for a specific user
    await searchInput.fill('testadmin');
    await page.waitForTimeout(1000); // Wait for search to trigger

    // Verify search results
    const searchResults = page.locator('tbody tr');
    const searchResultsCount = await searchResults.count();
    expect(searchResultsCount).toBeGreaterThan(0);

    // Check if the searched user appears in results
    await expect(page.locator('text=testadmin')).toBeVisible();

    console.log('✅ Admin users page is working correctly!');
    console.log('- Stats are loading and displaying');
    console.log('- Users table is loading and displaying data');
    console.log('- Search functionality is working');
    console.log('- Pagination information is visible');
  });

  test('should show error for non-admin users', async ({ page }) => {
    // Test that regular users cannot access admin page
    await page.goto('http://localhost:3000/auth/login');

    // Login as regular user
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Try to access admin users page
    await page.goto('http://localhost:3000/admin/users');

    // Should be redirected to forbidden page or login
    await expect(page).toHaveURL(/forbidden|login/);
  });
});
