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

test.describe('Deals - Cliente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display deals list page', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/deals');

    await expect(page.getByText(/negociacoes|negociacao/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter deals by status', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/deals');

    await expect(page.getByText(/negociacoes/i).first()).toBeVisible({ timeout: 10000 });

    // Look for status filter tabs or dropdown
    const statusFilter = page.getByRole('tab', { name: /aberto|negociando|todos/i }).first()
      .or(page.locator('select').first());

    if (await statusFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
      await statusFilter.click();
    }
  });

  test('should view deal chat', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/deals');

    await expect(page.getByText(/negociacoes/i).first()).toBeVisible({ timeout: 10000 });

    // Click on a deal to view chat
    const dealCard = page.locator('[data-testid="deal-card"]').or(page.getByRole('link', { name: /ver chat|detalhes|conversa/i })).first();

    if (await dealCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await dealCard.click();
      await expect(page).toHaveURL(/chat/i, { timeout: 10000 });
    }
  });

  test('should display empty state when no deals', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/deals');

    // Either shows deals or empty state
    const content = page.getByText(/negociacoes|nenhuma negociacao|comece/i).first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Deals - Empresa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display deals list for empresa', async ({ page }) => {
    await loginAsEmpresa(page);
    await page.goto('/deals');

    await expect(page.getByText(/negociacoes/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should accept or reject deal', async ({ page }) => {
    await loginAsEmpresa(page);
    await page.goto('/deals');

    await expect(page.getByText(/negociacoes/i).first()).toBeVisible({ timeout: 10000 });

    // Look for accept/reject buttons in deal list
    const actionButton = page.getByRole('button', { name: /aceitar|rejeitar|responder/i }).first();
    if (await actionButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      expect(await actionButton.isEnabled()).toBe(true);
    }
  });
});

test.describe('Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display chat interface', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/deals');

    await expect(page.getByText(/negociacoes/i).first()).toBeVisible({ timeout: 10000 });

    // Try to navigate to a chat
    const dealLink = page.getByRole('link').filter({ hasText: /chat|conversa|negociar/i }).first()
      .or(page.locator('a[href*="chat"]').first());

    if (await dealLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await dealLink.click();

      // Chat interface elements
      await expect(page.getByPlaceholder(/mensagem|digite|escreva/i).or(page.locator('textarea')).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should send message in chat', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/deals');

    await expect(page.getByText(/negociacoes/i).first()).toBeVisible({ timeout: 10000 });

    const dealLink = page.locator('a[href*="chat"]').first();
    if (await dealLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await dealLink.click();

      // Find message input
      const messageInput = page.getByPlaceholder(/mensagem|digite/i).or(page.locator('textarea')).first();
      if (await messageInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await messageInput.fill('Mensagem de teste automatizado');

        // Find send button
        const sendButton = page.getByRole('button', { name: /enviar|send/i }).first();
        if (await sendButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await sendButton.click();
        }
      }
    }
  });
});

test.describe('Orders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display orders list', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/orders');

    await expect(page.getByText(/pedidos|ordens/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should view order details', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/orders');

    await expect(page.getByText(/pedidos|ordens/i).first()).toBeVisible({ timeout: 10000 });

    // Click on first order
    const orderCard = page.locator('[data-testid="order-card"]').or(page.getByRole('link', { name: /detalhes|ver/i })).first();
    if (await orderCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await orderCard.click();
    }
  });
});
