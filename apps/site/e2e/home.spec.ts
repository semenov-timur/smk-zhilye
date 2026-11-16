import { expect, test } from '@playwright/test'

const SITE_WITH_CMS = 'http://localhost:4321/'
const SITE_WITHOUT_CMS = 'http://localhost:4322/'

test.describe('home page', () => {
  test('AC-3: home shows «CMS: доступна» when CMS is up', async ({ page }) => {
    await page.goto(SITE_WITH_CMS)

    await expect(page.getByTestId('cms-status')).toHaveText('CMS: доступна')
  })

  test('AC-4: home returns 200 and shows «CMS: недоступна» when CMS is down', async ({ page }) => {
    const response = await page.goto(SITE_WITHOUT_CMS)

    expect(response?.status()).toBe(200)
    await expect(page.getByTestId('cms-status')).toHaveText('CMS: недоступна')
  })
})
