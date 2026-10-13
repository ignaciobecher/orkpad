import { test, expect } from '@playwright/test'

// Suite dual-appearance: verifica el switch Win95 <-> Clásica.
// Requiere backend corriendo (ver CI o docker compose).
test('dual appearance: win95 <-> classic', async ({ page }) => {
  const email = `win95test${Date.now()}@example.com`

  await page.goto('/register')
  await page.locator('input[placeholder*="Juan" i]').fill('Tester')
  await page.locator('#email').fill(email)
  await page.locator('#password').fill('Test1234!')
  await page.getByText(/términos y condiciones/i).first().click()
  await page.getByRole('button', { name: /crear cuenta/i }).first().click()
  await page.waitForURL('**/app/**', { timeout: 20000 })

  // Por defecto: win95
  await expect.poll(async () =>
    page.evaluate(() => document.documentElement.getAttribute('data-appearance')),
  ).toBe('win95')
  await expect(page.locator('.w95-taskbar')).toBeVisible()

  // Cambiar a clásica desde Configuración
  await page.goto('/app/settings')
  await page.getByRole('button', { name: /clásica/i }).first().click()
  await expect.poll(async () =>
    page.evaluate(() => document.documentElement.getAttribute('data-appearance')),
  ).toBe('classic')
  await expect(page.locator('.app-sidebar')).toBeVisible()
  await expect(page.locator('.w95-taskbar')).toHaveCount(0)
  await expect(page.evaluate(() => localStorage.getItem('orkpad_appearance'))).toBe('classic')

  // Persistencia tras reload
  await page.goto('/app/dashboard')
  await expect(page.locator('.app-sidebar')).toBeVisible()
  await page.reload()
  await expect(page.locator('.app-sidebar')).toBeVisible()

  // Volver a win95
  await page.goto('/app/settings')
  await page.getByRole('button', { name: /orkpad95/i }).first().click()
  await expect.poll(async () =>
    page.evaluate(() => document.documentElement.getAttribute('data-appearance')),
  ).toBe('win95')
  await expect(page.locator('.w95-taskbar')).toBeVisible()
})
