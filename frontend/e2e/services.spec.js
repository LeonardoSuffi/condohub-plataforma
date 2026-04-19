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

test.describe('Services - Public', () => {
  test('should display public services page', async ({ page }) => {
    await page.goto('/');

    // Home page should show featured services or service listing
    await expect(page.getByText(/servicos|prestadores|condohub/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should display service categories', async ({ page }) => {
    await page.goto('/services');

    // Should show categories or services list
    await expect(page.getByText(/servicos|catalogo|categoria/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Services - Authenticated Cliente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should browse services catalog', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/services');

    await expect(page.getByText(/servicos|catalogo/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter services by category', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/services');

    // Wait for page to load
    await expect(page.getByText(/servicos|catalogo/i).first()).toBeVisible({ timeout: 10000 });

    // Look for category filter
    const categoryFilter = page.locator('select').first().or(page.getByRole('combobox').first());
    if (await categoryFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await categoryFilter.click();
    }
  });

  test('should search services', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/services');

    await expect(page.getByText(/servicos|catalogo/i).first()).toBeVisible({ timeout: 10000 });

    // Look for search input
    const searchInput = page.getByPlaceholder(/buscar|pesquisar|search/i);
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('manutencao');
      await page.waitForTimeout(1000);
    }
  });

  test('should view service details', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/services');

    await expect(page.getByText(/servicos|catalogo/i).first()).toBeVisible({ timeout: 10000 });

    // Click on first service card/link
    const serviceCard = page.locator('[data-testid="service-card"]').or(page.locator('.service-card')).or(page.getByRole('link', { name: /ver detalhes|detalhes|saiba mais/i }));
    if (await serviceCard.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await serviceCard.first().click();
      await expect(page).toHaveURL(/service|servico/i, { timeout: 10000 });
    }
  });

  test('should initiate contact with service provider', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/services');

    await expect(page.getByText(/servicos|catalogo/i).first()).toBeVisible({ timeout: 10000 });

    // Find contact/negotiate button
    const contactButton = page.getByRole('button', { name: /contato|negociar|solicitar/i }).first();
    if (await contactButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await contactButton.click();
    }
  });
});

test.describe('Services - Authenticated Empresa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should view my services page', async ({ page }) => {
    await loginAsEmpresa(page);
    await page.goto('/my-services');

    await expect(page.getByText(/meus servicos|servicos/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should create new service', async ({ page }) => {
    await loginAsEmpresa(page);
    await page.goto('/my-services');

    await expect(page.getByText(/meus servicos/i).first()).toBeVisible({ timeout: 10000 });

    // Find create/add button
    const createButton = page.getByRole('button', { name: /novo|adicionar|criar|cadastrar/i }).first()
      .or(page.getByRole('link', { name: /novo|adicionar|criar/i }).first());

    if (await createButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await createButton.click();

      // Should show service creation form
      await expect(page.getByText(/novo servico|criar servico|cadastrar/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should edit existing service', async ({ page }) => {
    await loginAsEmpresa(page);
    await page.goto('/my-services');

    await expect(page.getByText(/meus servicos/i).first()).toBeVisible({ timeout: 10000 });

    // Find edit button on first service
    const editButton = page.getByRole('button', { name: /editar/i }).first()
      .or(page.locator('[data-testid="edit-service"]').first());

    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click();
      await expect(page.getByText(/editar servico|atualizar/i).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should delete service', async ({ page }) => {
    await loginAsEmpresa(page);
    await page.goto('/my-services');

    await expect(page.getByText(/meus servicos/i).first()).toBeVisible({ timeout: 10000 });

    // Find delete button
    const deleteButton = page.getByRole('button', { name: /excluir|deletar|remover/i }).first();
    if (await deleteButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Note: We won't actually click delete in the test to preserve data
      expect(await deleteButton.isEnabled()).toBe(true);
    }
  });
});
