import { test, expect } from '@playwright/test'

test('renders the Orkpad landing page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Orkpad/)
  await expect(page.locator('.hero-title')).toBeVisible()
})

test('renders the login form', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('form.login-form')).toBeVisible()
  await expect(page.locator('#email')).toBeVisible()
  await expect(page.locator('#password')).toBeVisible()
})