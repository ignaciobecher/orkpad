/* Runner standalone: usa el chromium disponible (1243) por executablePath. */
import { chromium } from 'playwright-core'

const BASE = 'http://localhost:5173'
const email = `win95test${Date.now()}@example.com`
const PASS = 'Test1234!'

const browser = await chromium.launch({
  executablePath: '/home/ignacio/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome',
})
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })
const results = []
const check = (name, ok, extra = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'} ${name} ${extra}`)
  if (!ok) process.exitCode = 1
}

try {
  await page.goto(`${BASE}/register`, { waitUntil: 'networkidle' })
  await page.locator('input[placeholder*="Juan" i]').fill('Tester')
  await page.locator('#email, input[type="email"]').first().fill(email)
  await page.locator('#password, input[type="password"]').first().fill(PASS)
  const terms = page.locator('input[type="checkbox"]').first()
  if (!(await terms.isChecked())) await page.getByText(/términos y condiciones/i).first().click()
  await page.getByRole('button', { name: /crear cuenta/i }).first().click()
  await page.waitForURL('**/app/**', { timeout: 20000 })

  const ap1 = await page.evaluate(() => document.documentElement.getAttribute('data-appearance'))
  check('default win95', ap1 === 'win95', `got=${ap1}`)
  check('taskbar visible', await page.locator('.w95-taskbar').isVisible())
  await page.waitForTimeout(800)
  await page.screenshot({ path: '/tmp/shot-win95-desktop.png' })

  await page.goto(`${BASE}/app/settings`)
  await page.getByRole('button', { name: /clásica/i }).first().click()
  await page.waitForFunction(() => document.documentElement.getAttribute('data-appearance') === 'classic', null, { timeout: 5000 })
  check('switch classic attr', true)
  check('sidebar visible', await page.locator('.app-sidebar').isVisible())
  check('taskbar gone', (await page.locator('.w95-taskbar').count()) === 0)
  check('persisted', (await page.evaluate(() => localStorage.getItem('orkpad_appearance'))) === 'classic')
  await page.waitForTimeout(500)
  await page.screenshot({ path: '/tmp/shot-classic-settings.png' })

  await page.goto(`${BASE}/app/dashboard`)
  await page.waitForTimeout(800)
  check('classic dashboard sidebar', await page.locator('.app-sidebar').isVisible())
  await page.screenshot({ path: '/tmp/shot-classic-dashboard.png' })

  await page.reload({ waitUntil: 'networkidle' })
  check('persist after reload', await page.locator('.app-sidebar').isVisible())

  await page.goto(`${BASE}/app/settings`)
  await page.getByRole('button', { name: /orkpad95/i }).first().click()
  await page.waitForFunction(() => document.documentElement.getAttribute('data-appearance') === 'win95', null, { timeout: 5000 })
  check('back to win95', await page.locator('.w95-taskbar').isVisible())
  await page.goto(`${BASE}/app/tasks`)
  await page.waitForTimeout(800)
  await page.screenshot({ path: '/tmp/shot-win95-tasks.png' })
} catch (e) {
  check('no-exception', false, String(e).slice(0, 300))
  await page.screenshot({ path: '/tmp/shot-error.png' })
} finally {
  console.log(results.join('\n'))
  await browser.close()
}
