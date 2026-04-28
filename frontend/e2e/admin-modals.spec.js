import { test, expect } from '@playwright/test'

// Skip webserver, use existing
test.use({ baseURL: 'http://localhost:3000' })

async function loginAsAdmin(page) {
  await page.goto('/login')
  // Use name attribute to be more specific since there are 2 email inputs
  await page.locator('input[name="email"]').fill('admin@servicepro.com.br')
  await page.locator('input[name="password"]').fill('admin123')
  // Click the specific "Entrar" button
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page).toHaveURL(/dashboard|admin/i, { timeout: 15000 })
}

test.describe('Admin User Modals', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.context().clearCookies()
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test('should open user view modal with slide-over design', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/users')

    // Wait for users table to load
    // Wait for the users table to load
    await expect(page.locator('table tbody')).toBeVisible({ timeout: 15000 })

    // Click view button on first user
    const viewButton = page.locator('button[title="Ver detalhes"]').first()
    if (await viewButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await viewButton.click()

      // Check slide-over panel appeared with new design elements
      await expect(page.getByText(/Visao Geral/i).or(page.getByText(/Detalhes/i))).toBeVisible({ timeout: 5000 })
    }
  })

  test('should open user edit modal with tabs', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/users')

    // Wait for the users table to load
    await expect(page.locator('table tbody')).toBeVisible({ timeout: 15000 })

    // Click edit button on first user
    const editButton = page.locator('button[title="Editar"]').first()
    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click()

      // Check tabs are visible in the modal
      await expect(page.getByText(/Dados Basicos/i)).toBeVisible({ timeout: 5000 })
      await expect(page.getByText(/Endereco/i)).toBeVisible({ timeout: 5000 })

      // Check save button exists
      await expect(page.getByText(/Salvar alteracoes/i)).toBeVisible({ timeout: 3000 })
    }
  })

  test('should open create user modal with steps', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/users')

    // Wait for the users table to load
    await expect(page.locator('table tbody')).toBeVisible({ timeout: 15000 })

    // Click new user button
    const newUserButton = page.getByRole('button', { name: /Novo Usuario/i })
    await expect(newUserButton).toBeVisible({ timeout: 5000 })
    await newUserButton.click()

    // Check step indicator
    await expect(page.getByText(/Passo 1 de 2/i)).toBeVisible({ timeout: 5000 })

    // Check type selection cards
    await expect(page.getByText(/Cliente/i)).toBeVisible({ timeout: 3000 })
    await expect(page.getByText(/Empresa/i)).toBeVisible({ timeout: 3000 })
    await expect(page.getByText(/Admin/i)).toBeVisible({ timeout: 3000 })

    // Fill basic info
    await page.getByPlaceholder(/nome completo/i).fill('Teste Usuario')
    await page.getByPlaceholder(/email@exemplo/i).fill('teste@teste.com')
    await page.getByPlaceholder(/Min. 8 caracteres/i).fill('senha12345')
    await page.getByPlaceholder(/Repita a senha/i).fill('senha12345')

    // Click continue
    await page.getByRole('button', { name: /Continuar/i }).click()

    // Should be on step 2
    await expect(page.getByText(/Passo 2 de 2/i)).toBeVisible({ timeout: 5000 })

    // Check summary section
    await expect(page.getByText(/Resumo/i)).toBeVisible({ timeout: 3000 })
  })

  test('should navigate between edit modal tabs', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/users')

    // Wait for the users table to load
    await expect(page.locator('table tbody')).toBeVisible({ timeout: 15000 })

    const editButton = page.locator('button[title="Editar"]').first()
    if (await editButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await editButton.click()

      // Start on basic tab
      await expect(page.getByText(/Dados Basicos/i)).toBeVisible({ timeout: 5000 })

      // Click address tab
      const addressTab = page.getByRole('button', { name: /Endereco/i })
      if (await addressTab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addressTab.click()

        // Should show address fields
        await expect(page.getByText(/CEP/i).or(page.getByText(/Cidade/i))).toBeVisible({ timeout: 3000 })
      }
    }
  })

  test('should close modal on cancel', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/users')

    // Wait for the users table to load
    await expect(page.locator('table tbody')).toBeVisible({ timeout: 15000 })

    // Open create modal
    const newUserButton = page.getByRole('button', { name: /Novo Usuario/i })
    await newUserButton.click()

    await expect(page.getByText(/Passo 1 de 2/i)).toBeVisible({ timeout: 5000 })

    // Click cancel
    await page.getByRole('button', { name: /Cancelar/i }).click()

    // Modal should close
    await expect(page.getByText(/Passo 1 de 2/i)).not.toBeVisible({ timeout: 3000 })
  })
})
