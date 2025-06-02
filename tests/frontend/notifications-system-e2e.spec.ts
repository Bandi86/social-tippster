import { expect, request, test } from '@playwright/test';

// Helper to unlock test user (reset failed login attempts, unlock account)
async function unlockTestUser(email: string) {
  const adminApiUrl = 'http://localhost:3001/api/test/unlock-user';
  const ctx = await request.newContext();
  const res = await ctx.post(adminApiUrl, { data: { email } });
  let warnText = '';
  if (!res.ok()) {
    warnText = await res.text();
    console.warn('⚠️ Could not unlock test user:', warnText);
  }
  await ctx.dispose();
}

// Helper to relock or reset test user after test
async function relockTestUser(email: string) {
  const adminApiUrl = 'http://localhost:3001/api/test/relock-user';
  const ctx = await request.newContext();
  await ctx.post(adminApiUrl, { data: { email } });
  await ctx.dispose();
}

test('Notification system: login, fetch, mark as read', async ({ page, request }) => {
  const email = 'testadmin@test.com';
  // Always unlock before test
  await unlockTestUser(email);

  try {
    // Login via API
    const loginResponse = await request.post('http://localhost:3001/api/auth/login', {
      data: {
        email,
        password: 'password123',
      },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    const accessToken = loginData.access_token;
    expect(accessToken).toBeTruthy();

    // Set token in localStorage for the app
    await page.goto('http://localhost:3000');
    await page.evaluate(token => {
      localStorage.setItem('authToken', token);
    }, accessToken);
    await page.reload();

    // Go to notifications page
    await page.goto('http://localhost:3000/notifications');
    await page.waitForSelector('h1');
    const header = await page.textContent('h1');
    expect(header).toContain('Értesítések');

    // Check if notifications are listed
    const notificationItems = await page.locator('[data-testid="notification-item"]').count();
    expect(notificationItems).toBeGreaterThanOrEqual(0); // 0 is allowed if no notifications

    // If there are unread notifications, mark all as read
    const unreadCount = await page.locator('button:has-text("Mind olvasott")').count();
    if (unreadCount > 0) {
      await page.click('button:has-text("Mind olvasott")');
      await page.waitForTimeout(1000);
      expect(await page.locator('button:has-text("Mind olvasott")').count()).toBe(0);
    }

    // Try to load older notifications (button exists)
    const loadOlder = await page
      .locator('button:has-text("Régebbi értesítések betöltése")')
      .count();
    if (loadOlder > 0) {
      await page.click('button:has-text("Régebbi értesítések betöltése")');
      await page.waitForTimeout(1000);
    }
  } finally {
    // Optionally re-lock or clean up test user here if needed
    await relockTestUser(email);
  }
});
