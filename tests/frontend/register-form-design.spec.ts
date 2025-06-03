import { expect, test } from '@playwright/test';

// This test checks the registration page for correct wide layout, grid, and visual design.
test.describe('Registration Page Design', () => {
  test('should display registration form at full width with correct grid layout', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/auth/register');

    // Use only the unique data-testid for main container
    const mainContainer = page.locator('[data-testid="register-form-main"]');
    await expect(mainContainer).toBeVisible();

    // Check that the container is at least 1100px wide (visual width)
    const boundingBox = await mainContainer.boundingBox();
    expect(boundingBox?.width).toBeGreaterThan(1090);

    // Use only the unique data-testid for grid
    const grid = page.locator('[data-testid="register-form-grid"]');
    await expect(grid).toBeVisible();
    const gridChildren = await grid.locator('>*').count();
    expect(gridChildren).toBeGreaterThanOrEqual(2);

    // Check that the form itself is visually prominent
    const form = page.locator('form');
    await expect(form).toBeVisible();
    const formBox = await form.boundingBox();
    expect(formBox?.width).toBeGreaterThan(400);

    // Optionally, take a screenshot for manual review
    await page.screenshot({ path: 'tests/images/register-form-design.png', fullPage: false });
  });
});
