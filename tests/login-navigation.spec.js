// eslint-disable-next-line playwright/no-conditional-in-test, playwright/no-skipped-test
import { test, expect } from '@playwright/test'
import { 
  navigateToLogin, 
  loginToApplication, 
  clickNavButton, 
  getLastPartOfUrl, 
  logoutFromApplication } from './utils'

let loggedBaseURL = false // Flag to ensure baseURL is logged only once

test.describe('Login and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Log Base URL and Proxy URL once before the first test runs
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (!loggedBaseURL) {
      const baseURL = page.context()._options.baseURL
      const configuredProxyUrl = process.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333' // Default logic
      const basePath = getLastPartOfUrl(baseURL)

      // eslint-disable-next-line playwright/no-conditional-in-test
      if (baseURL) {
        console.log(`\n🚀 Running tests against Service at URL: ${baseURL}`)
        console.log(`🔒 Using Auth Proxy URL: ${configuredProxyUrl}`)
        console.log('🔒 Using basePath: ', basePath)
      }
      loggedBaseURL = true // Set flag so it doesn't log again
    }
  })

  test('should login successfully and navigate through pages', async ({ page }) => {
    console.log(`\n▶️ Running Test: ${test.info().title}\n`)
    console.log('🔍 Starting login and navigation test')
    console.log('🔍 This test performs a login, visits all pages, and logs out\n')
    test.setTimeout(30000) // overall not more than 30 seconds

    // Start from home page
    await navigateToLogin(page)

    // Use our utility function for login
    await loginToApplication(page)

    // click the "About" button in the navigation bar
    await clickNavButton(page, 'About')

    // click the "settings" button in the navigation bar
    await clickNavButton(page, 'Settings')

    // Verify settings page content
    // This test could move to another test file about settings page
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Light' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Dark' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'System' })).toBeVisible()
    console.log('🎨 Testing theme switching')
    await page.getByRole('button', { name: 'Dark' }).click()
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.getByRole('button', { name: 'Light' }).click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)

    // click the "profile" button in the navigation bar
    await clickNavButton(page, 'Profile')

    // click the "home" button in the navigation bar
    // TODO: fix this test. HOME does not work for the function below 
    //await clickNavButton(page, 'Home')

    // logout
    await logoutFromApplication(page)
    console.log('✅ Test completed successfully')
  })
})
