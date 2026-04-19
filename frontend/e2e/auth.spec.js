import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the site first, then clear auth state
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: /entrar|login/i })).toBeVisible();
    await expect(page.getByPlaceholder('seu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('Sua senha')).toBeVisible();
    await expect(page.getByRole('button', { name: /entrar|login/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('seu@email.com').fill('invalid@email.com');
    await page.getByPlaceholder('Sua senha').fill('wrongpassword');
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Wait for error message
    await expect(page.getByText(/credenciais|invalido|incorreto|erro/i)).toBeVisible({ timeout: 10000 });
  });

  test('should login successfully with valid cliente credentials', async ({ page }) => {
    await page.goto('/login');

    // Use a test user from the seeder
    await page.getByPlaceholder('seu@email.com').fill('sindico@teste.com');
    await page.getByPlaceholder('Sua senha').fill('teste123');
    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });

    // Should show user name or dashboard content - use first() since there may be multiple matches
    await expect(page.getByText(/bom dia|boa tarde|boa noite|dashboard|inicio/i).first()).toBeVisible();
  });

  test('should login successfully with valid empresa credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('seu@email.com').fill('empresa@teste.com');
    await page.getByPlaceholder('Sua senha').fill('teste123');
    await page.getByRole('button', { name: /entrar|login/i }).click();

    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });
    await expect(page.getByText(/bom dia|boa tarde|boa noite|dashboard|inicio/i).first()).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByPlaceholder('seu@email.com').fill('sindico@teste.com');
    await page.getByPlaceholder('Sua senha').fill('teste123');
    await page.getByRole('button', { name: /entrar|login/i }).click();

    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });

    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /sair|logout/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Try dropdown menu
      const userMenu = page.locator('[data-testid="user-menu"]').or(page.getByRole('button', { name: /menu|usuario/i }));
      if (await userMenu.isVisible()) {
        await userMenu.click();
        await page.getByRole('menuitem', { name: /sair|logout/i }).click();
      }
    }

    // Should redirect to login
    await expect(page).toHaveURL(/login|\/$/i, { timeout: 10000 });
  });

  test('should redirect unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login/i, { timeout: 10000 });
  });

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /entrar|login/i }).click();

    // Should show validation messages
    const errorMessages = page.locator('.text-red-500, .text-destructive, [role="alert"]');
    await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');

    const registerLink = page.getByRole('link', { name: /cadastr|registr|criar conta/i });
    await expect(registerLink).toBeVisible();
    await registerLink.click();

    await expect(page).toHaveURL(/register/i);
  });
});
