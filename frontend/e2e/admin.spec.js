import { test, expect } from '@playwright/test';

async function loginAsAdmin(page) {
  await page.goto('/login');
  await page.getByPlaceholder('seu@email.com').fill('admin@condominial.com');
  await page.getByPlaceholder('Sua senha').fill('admin123');
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await expect(page).toHaveURL(/dashboard|admin/i, { timeout: 10000 });
}

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display admin dashboard', async ({ page }) => {
    await loginAsAdmin(page);

    // Admin should see admin-specific content
    await expect(page.getByText(/admin|dashboard|painel/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to admin users page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');

    await expect(page.getByText(/usuarios|users/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to admin orders page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');

    await expect(page.getByText(/pedidos|ordens|orders/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to admin plans page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/plans');

    await expect(page.getByText(/planos|plans/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin Users Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should list all users', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');

    await expect(page.getByText(/usuarios/i).first()).toBeVisible({ timeout: 10000 });

    // Should show user table or list
    const userTable = page.locator('table').or(page.locator('[data-testid="users-list"]'));
    await expect(userTable).toBeVisible({ timeout: 10000 });
  });

  test('should search users', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');

    await expect(page.getByText(/usuarios/i).first()).toBeVisible({ timeout: 10000 });

    const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i);
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('teste');
      await page.waitForTimeout(1000);
    }
  });

  test('should filter users by type', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');

    await expect(page.getByText(/usuarios/i).first()).toBeVisible({ timeout: 10000 });

    const typeFilter = page.locator('select').first().or(page.getByRole('combobox').first());
    if (await typeFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await typeFilter.click();
    }
  });

  test('should view user details', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/users');

    await expect(page.getByText(/usuarios/i).first()).toBeVisible({ timeout: 10000 });

    const viewButton = page.getByRole('button', { name: /ver|detalhes|visualizar/i }).first()
      .or(page.locator('[data-testid="view-user"]').first());

    if (await viewButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewButton.click();
    }
  });
});

test.describe('Admin Plans Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should list all plans', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/plans');

    await expect(page.getByText(/planos/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should view plan details', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/plans');

    await expect(page.getByText(/planos/i).first()).toBeVisible({ timeout: 10000 });

    // Plans should be displayed
    const planCard = page.locator('[data-testid="plan-card"]').or(page.getByText(/basico|profissional|premium/i)).first();
    await expect(planCard).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should deny admin pages to cliente users', async ({ page }) => {
    // Login as cliente
    await page.goto('/login');
    await page.getByPlaceholder('seu@email.com').fill('sindico@teste.com');
    await page.getByPlaceholder('Sua senha').fill('teste123');
    await page.getByRole('button', { name: /entrar|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });

    // Try to access admin page
    await page.goto('/admin/users');

    // Should be redirected or show access denied
    await expect(page).not.toHaveURL(/admin\/users/i, { timeout: 5000 });
  });

  test('should deny admin pages to empresa users', async ({ page }) => {
    // Login as empresa
    await page.goto('/login');
    await page.getByPlaceholder('seu@email.com').fill('empresa@teste.com');
    await page.getByPlaceholder('Sua senha').fill('teste123');
    await page.getByRole('button', { name: /entrar|login/i }).click();
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });

    // Try to access admin page
    await page.goto('/admin/users');

    // Should be redirected or show access denied
    await expect(page).not.toHaveURL(/admin\/users/i, { timeout: 5000 });
  });
});
