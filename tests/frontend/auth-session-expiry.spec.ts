// Playwright test: auth-session-expiry.spec.ts
// This test simulates session expiry and verifies that the UI is fully reset (no user info, guest UI shown) after refresh.

import { expect, test } from '@playwright/test';

// Helper: login as a test user (seeded: alice@example.com / password123)
async function login(page, email = 'alice@example.com', password = 'password123') {
  console.log('🔑 Starting login process...');
  await page.goto('http://localhost:3000/auth');

  // Wait for the page to load and check if we can see the login form
  await page.waitForLoadState('networkidle');

  console.log('🌐 Page loaded, looking for login form...');

  // Check if we're already on the auth page
  await expect(page).toHaveURL(/.*\/auth.*/);

  // Wait for and fill email field
  console.log('📧 Looking for email field...');
  const emailField = page.getByLabel('E-mail cím');
  await expect(emailField).toBeVisible({ timeout: 10000 });
  await emailField.fill(email);

  // Wait for and fill password field
  console.log('🔒 Looking for password field...');
  const passwordField = page.getByLabel('Jelszó');
  await expect(passwordField).toBeVisible({ timeout: 10000 });
  await passwordField.fill(password);

  // Click the submit button inside the login form only
  console.log('🎯 Looking for login button...');
  const loginButton = page.locator('form').getByRole('button', { name: /bejelentkezés/i });
  await expect(loginButton).toBeVisible({ timeout: 10000 });
  await loginButton.click();

  console.log('⏳ Waiting for redirect to home page...');
  await expect(page).toHaveURL('http://localhost:3000/', { timeout: 15000 });

  console.log('🏠 Checking for welcome message...');
  // Be more specific about the welcome message
  const welcomeMessage = page.locator('text=Jó reggelt');
  await expect(welcomeMessage).toBeVisible({ timeout: 10000 });

  console.log('✅ Login successful!');
}

test.describe('Session expiry and UI reset', () => {
  test('should clear all user info and show guest UI after session expiry and reload', async ({
    page,
    context,
  }) => {
    // 1. Login as test user
    await login(page);

    // 2. Simulate session expiry: clear all auth storage and reload
    await page.evaluate(() => {
      localStorage.clear();
      if (window?.sessionStorage) sessionStorage.clear();
      // Remove Zustand's persisted storage
      localStorage.removeItem('auth-storage');
    });
    await page.reload();

    // 3. UI should show guest state (no user info, no "Jó reggelt alice", no user menu)
    await expect(page.locator('text=Jó reggelt')).not.toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Üdvözlünk a Social Tippster-ben!/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: /Belépés/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Regisztráció/i }).first()).toBeVisible();

    // 4. Navbar should not show user menu or notifications
    await expect(page.getByRole('button', { name: /alice/i })).not.toBeVisible();
    await expect(page.getByRole('link', { name: /Üzenetek/i })).not.toBeVisible();
  });
});
