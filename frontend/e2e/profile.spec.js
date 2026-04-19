import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to login before tests
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

test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display profile page for cliente', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/profile');

    await expect(page.getByText(/meu perfil|perfil/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/sindico@teste.com/i)).toBeVisible();
  });

  test('should display profile page for empresa', async ({ page }) => {
    await loginAsEmpresa(page);
    await page.goto('/profile');

    await expect(page.getByText(/meu perfil|perfil/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/empresa@teste.com/i)).toBeVisible();
  });

  test('should allow editing profile information', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/profile');

    // Wait for page to load
    await expect(page.getByText(/meu perfil/i).first()).toBeVisible({ timeout: 10000 });

    // Click edit button
    const editButton = page.getByRole('button', { name: /editar/i });
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Fields should become editable
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toBeEnabled();

    // Change name
    const originalName = await nameInput.inputValue();
    await nameInput.fill('Nome Atualizado Test');

    // Save changes
    const saveButton = page.getByRole('button', { name: /salvar/i });
    await saveButton.click();

    // Should show success message
    await expect(page.getByText(/sucesso|atualizado/i)).toBeVisible({ timeout: 10000 });

    // Restore original name
    await editButton.click();
    await nameInput.fill(originalName);
    await saveButton.click();
  });

  test('should upload profile photo successfully', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/profile');

    // Wait for page to load
    await expect(page.getByText(/meu perfil/i).first()).toBeVisible({ timeout: 10000 });

    // Create a test image file
    const testImagePath = path.join(__dirname, 'test-image.png');

    // Create a simple PNG if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      // Create a minimal valid PNG (1x1 pixel red)
      const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
        0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xFE,
        0xD4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
        0x44, 0xAE, 0x42, 0x60, 0x82
      ]);
      fs.writeFileSync(testImagePath, pngData);
    }

    // Find the file input (hidden)
    const fileInput = page.locator('input[type="file"][accept*="image"]').first();

    // Upload the file
    await fileInput.setInputFiles(testImagePath);

    // Wait for upload to complete - should show success message
    await expect(page.getByText(/foto atualizada|sucesso/i)).toBeVisible({ timeout: 15000 });

    // Verify we're still on the profile page (not redirected to login)
    await expect(page).toHaveURL(/profile/i);

    // Verify we're still authenticated
    await expect(page.getByText(/meu perfil/i).first()).toBeVisible();

    // Clean up test file
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  test('should not logout after photo upload', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/profile');

    await expect(page.getByText(/meu perfil/i).first()).toBeVisible({ timeout: 10000 });

    // Create a test image
    const testImagePath = path.join(__dirname, 'test-image2.png');
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xFE,
      0xD4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
      0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, pngData);

    const fileInput = page.locator('input[type="file"][accept*="image"]').first();
    await fileInput.setInputFiles(testImagePath);

    // Wait a bit for the upload
    await page.waitForTimeout(3000);

    // Verify NOT redirected to login
    await expect(page).not.toHaveURL(/login/i);

    // Verify still on profile page
    await expect(page.getByText(/meu perfil/i).first()).toBeVisible();

    // Verify token still exists
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();

    fs.unlinkSync(testImagePath);
  });

  test('should show error for large file upload', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/profile');

    await expect(page.getByText(/meu perfil/i).first()).toBeVisible({ timeout: 10000 });

    // Create a file that's too large (> 2MB) - we'll simulate this with a fake file
    const testImagePath = path.join(__dirname, 'large-test-image.png');

    // Create a file larger than 2MB (just header + padding)
    const largeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3MB
    // Add PNG signature at the start
    largeBuffer.write('\x89PNG\r\n\x1a\n', 0, 'binary');
    fs.writeFileSync(testImagePath, largeBuffer);

    const fileInput = page.locator('input[type="file"][accept*="image"]').first();
    await fileInput.setInputFiles(testImagePath);

    // Should show error message about file size
    await expect(page.getByText(/2MB|tamanho|grande/i)).toBeVisible({ timeout: 5000 });

    fs.unlinkSync(testImagePath);
  });

  test('should display profile completion progress', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/profile');

    await expect(page.getByText(/meu perfil/i).first()).toBeVisible({ timeout: 10000 });

    // Should show profile completion percentage
    const completionText = page.getByText(/%/);
    await expect(completionText.first()).toBeVisible();
  });

  test('should display statistics for user', async ({ page }) => {
    await loginAsCliente(page);
    await page.goto('/profile');

    await expect(page.getByText(/meu perfil/i).first()).toBeVisible({ timeout: 10000 });

    // Should show statistics section
    await expect(page.getByText(/estatisticas/i)).toBeVisible();
  });

  test('should allow empresa to upload logo', async ({ page }) => {
    await loginAsEmpresa(page);
    await page.goto('/profile');

    await expect(page.getByText(/meu perfil/i).first()).toBeVisible({ timeout: 10000 });

    // Look for logo section (only for empresa)
    const logoSection = page.getByText(/logo/i);
    await expect(logoSection.first()).toBeVisible();

    // Create a test image
    const testImagePath = path.join(__dirname, 'test-logo.png');
    const pngData = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
      0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
      0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
      0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
      0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xFE,
      0xD4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
      0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    fs.writeFileSync(testImagePath, pngData);

    // Upload logo - find the second file input (first is for profile photo)
    const fileInputs = page.locator('input[type="file"][accept*="image"]');
    const logoInput = fileInputs.nth(1);

    if (await logoInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoInput.setInputFiles(testImagePath);
      await expect(page.getByText(/logo atualizada|sucesso/i)).toBeVisible({ timeout: 15000 });
    }

    fs.unlinkSync(testImagePath);
  });
});
