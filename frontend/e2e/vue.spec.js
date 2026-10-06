import { test, expect } from '@playwright/test'

test('root redirects to the register page', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/register/)
  await expect(page).toHaveTitle(/Orkpad/)
  await expect(page.locator('form.login-form')).toBeVisible()
  await expect(page.locator('#email')).toBeVisible()
  await expect(page.locator('#password')).toBeVisible()
})

test('renders the login form', async ({ page }) => {
  await page.goto('/login')
  await expect(page.locator('form.login-form')).toBeVisible()
  await expect(page.locator('#email')).toBeVisible()
  await expect(page.locator('#password')).toBeVisible()
})
