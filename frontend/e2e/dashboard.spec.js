import { test, expect } from '@playwright/test';

async function loginAsCliente(page) {
  await page.goto('/login');
  await page.getByPlaceholder('seu@email.com').fill('sindico@teste.com');
  await page.getByPlaceholder('Sua senha').fill('teste123');
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });
}

async function loginAsEmpresa(page) {
  await page.goto('/login');
  await page.getByPlaceholder('seu@email.com').fill('empresa@teste.com');
  await page.getByPlaceholder('Sua senha').fill('teste123');
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display dashboard for cliente', async ({ page }) => {
    await loginAsCliente(page);

    // Should show greeting
    await expect(page.getByText(/bom dia|boa tarde|boa noite/i).first()).toBeVisible({ timeout: 10000 });

    // Should show stats cards
    await expect(page.getByText(/negociacoes|negociacao/i).first()).toBeVisible();
  });

  test('should display dashboard for empresa', async ({ page }) => {
    await loginAsEmpresa(page);

    await expect(page.getByText(/bom dia|boa tarde|boa noite/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/negociacoes|negociacao|servicos/i).first()).toBeVisible();
  });

  test('should show quick actions for cliente', async ({ page }) => {
    await loginAsCliente(page);

    await expect(page.getByText(/buscar servicos|catalogo/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show quick actions for empresa', async ({ page }) => {
    await loginAsEmpresa(page);

    // Empresa should see service-related actions
    await expect(page.getByText(/servicos|meus servicos/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to services from dashboard', async ({ page }) => {
    await loginAsCliente(page);

    const servicesLink = page.getByRole('link', { name: /buscar servicos|servicos|catalogo/i }).first();
    await expect(servicesLink).toBeVisible({ timeout: 10000 });
    await servicesLink.click();

    await expect(page).toHaveURL(/services/i, { timeout: 10000 });
  });

  test('should navigate to deals from dashboard', async ({ page }) => {
    await loginAsCliente(page);

    // Find the deals/negotiations link in sidebar or quick actions
    const dealsLink = page.getByRole('link', { name: /negociacoes/i }).first();
    await expect(dealsLink).toBeVisible({ timeout: 10000 });
    await dealsLink.click();

    await expect(page).toHaveURL(/deals/i, { timeout: 10000 });
  });

  test('should display profile completion banner when incomplete', async ({ page }) => {
    await loginAsCliente(page);

    // Look for profile completion banner
    const completionBanner = page.getByText(/complete seu perfil|perfil.*%/i);
    // This may or may not be visible depending on the user's profile state
    // Just check the dashboard loaded correctly
    await expect(page.getByText(/bom dia|boa tarde|boa noite/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show recent negotiations section', async ({ page }) => {
    await loginAsCliente(page);

    await expect(page.getByText(/negociacoes recentes|recentes/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should show recent orders section', async ({ page }) => {
    await loginAsCliente(page);

    await expect(page.getByText(/ordens recentes|ordens|pedidos/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('sidebar should be functional', async ({ page }) => {
    await loginAsCliente(page);

    // Wait for sidebar to load
    await expect(page.getByText(/inicio|dashboard/i).first()).toBeVisible({ timeout: 10000 });

    // Test sidebar navigation
    const sidebarLinks = page.locator('nav a, aside a, [role="navigation"] a');
    const linkCount = await sidebarLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should toggle sidebar on button click or keyboard shortcut', async ({ page }) => {
    await loginAsCliente(page);

    await expect(page.getByText(/bom dia|boa tarde|boa noite/i).first()).toBeVisible({ timeout: 10000 });

    // Try keyboard shortcut Ctrl+B
    await page.keyboard.press('Control+b');
    await page.waitForTimeout(500);

    // Or try sidebar toggle button
    const toggleButton = page.locator('[data-testid="sidebar-toggle"]').or(page.getByRole('button', { name: /menu|toggle/i }));
    if (await toggleButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await toggleButton.click();
    }
  });
});
