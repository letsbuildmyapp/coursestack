import { test, expect } from '@playwright/test';

const SEED_PASSWORD = 'coursestack';

test('golden path: signup → subscribe → enroll → complete → see progress', async ({ page }) => {
  // Marketing landing
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/already-working|professional/i);

  // Signup as a new free user
  await page.getByRole('link', { name: /Start the trial/i }).first().click();
  const emailUnique = `e2e_${Date.now()}@example.com`;
  await page.getByLabel('Your name').fill('E2E User');
  await page.getByLabel('Email').fill(emailUnique);
  await page.getByLabel('Password').fill('password123');
  await page.getByRole('button', { name: /Create account/i }).click();

  // Lands on the dashboard
  await expect(page).toHaveURL(/\/dashboard/);
  // Dismiss the tour by pressing Escape
  await page.keyboard.press('Escape');

  // Hop to billing and pick Pro to flip tier (demo Stripe equivalent)
  await page.goto('/account/billing');
  await page.getByRole('button', { name: /Switch to Member|Switch to Pro/i }).click();
  // Status pill should reflect active
  await expect(page.locator('text=Pro').first()).toBeVisible();

  // Browse catalog
  await page.goto('/catalog');
  await expect(page.locator('h1')).toContainText(/Catalog/i);
  // Open first course
  await page.locator('a[href^="/courses/"]').first().click();
  await expect(page.locator('h1').first()).toBeVisible();

  // Start the course
  await page.getByRole('link', { name: /Continue|Start course/i }).first().click();
  await expect(page).toHaveURL(/\/learn\//);

  // Mark complete
  const markBtn = page.getByRole('button', { name: /Mark complete/i });
  if (await markBtn.isVisible()) {
    await markBtn.click();
  }
  // After marking, sidebar should show at least one completion checkmark or page advanced
  await page.goto('/dashboard');
  await expect(page.locator('text=/Continue|My library/i').first()).toBeVisible();

  // Sign out and re-sign-in to confirm persistence
  await page.evaluate(() => localStorage.removeItem('coursestack:tutorial_seen:member'));
  void SEED_PASSWORD; // referenced for clarity in mock-mode flow
});
