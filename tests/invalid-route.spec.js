// eslint-disable-next-line playwright/no-conditional-in-test, playwright/no-skipped-test
import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import { getLastPartOfUrl, loginWithEEN, logoutFromApplication } from './utils'
import { APP_NAME } from '../src/constants.js'

// Load environment variables from .env file
dotenv.config()

let loggedBaseURL = false // Flag to ensure baseURL is logged only once
let basePath = ''

test.describe('Invalid Route Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Log Base URL and Proxy URL once before the first test runs
    if (!loggedBaseURL) {
      const baseURL = page.context()._options.baseURL
      const configuredProxyUrl = process.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333' // Default logic
      const redirectUri = process.env.VITE_REDIRECT_URI || 'http://127.0.0.1:3333'
      basePath = getLastPartOfUrl(baseURL)
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (baseURL) {
        console.log(`\n🚀 Running tests against Service at URL: ${baseURL}`)
        console.log(`🔒 Using Auth Proxy URL: ${configuredProxyUrl}`)
        console.log(`🔒 Using Redirect URI: ${redirectUri}`)
        console.log(`🔒 Using basePath: ${basePath}\n`)
      }
      loggedBaseURL = true // Set flag so it doesn't log again
    }
  })

  test('should display not found page after login when navigating to invalid route', async ({
    page
  }) => {
    // eslint-disable-next-line playwright/no-conditional-in-test, playwright/no-skipped-test

    console.log(`\n▶️ Running Test: ${test.info().title}\n`)
    console.log('🔍 this test uses an invalid route with and without previous login. ')
    console.log('🔍 Starting invalid route test')

    // Increase timeout for this test
    test.setTimeout(30000) // 30 sec max for this test

    // go directly to the invalid route before login
    await page.goto(basePath + '/abcdefg')

    // Wait for redirect to EEN
    await page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: 15000 })
    console.log('✅ Redirected to EEN login page')

    // login with EEN
    await loginWithEEN(page)

    // Verify not found page after login
    const notFoundLocator = page.getByText('Page Not Found')
    await expect(notFoundLocator).toBeVisible({ timeout: 5000 })

    // we expect to be on the Not Found page
    await expect(page.getByText('Page Not Found')).toBeVisible({ timeout: 10000 })
    console.log('✅ NotFound page displayed correctly')

    // check for the Go Back to Previous Page button
    await expect(page.getByText(/Go Back to/)).toBeHidden({ timeout: 10000 })
    console.log('✅ "Go Back to Previous Page" button is correctly not visible')

    // check for the Go to Home button
    await expect(page.getByText('Go to Home')).toBeVisible({ timeout: 10000 })
    console.log('✅ "Go to Home" button is correctly visible')

    // use the Go Back to home button to go back to the home page
    await page.getByText('Go to Home').click({ timeout: 10000 })
    console.log('👈 Clicked "Go to Home" button')

    // we expect to be on the home page
    await expect(page.getByText(`Welcome to ${APP_NAME}`)).toBeVisible({ timeout: 10000 })
    console.log('✅ Home page displayed correctly')

    // Navigate to About page
    console.log('👈 Clicking "About" button')
    await page.getByRole('navigation').getByRole('link', { name: 'About' }).click()
    await page.waitForURL(/.*\/about$/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('heading', { name: 'About ' + APP_NAME })).toBeVisible({
      timeout: 10000
    })
    console.log('✅ About page displayed correctly')

    // go to another invalid route
    console.log('👈 navigating to another invalid route after login:', basePath + '/hijhlm')
    await page.goto(basePath + '/hijhlm')
    //await page.waitForTimeout(100000)

    // Verify we're on the NotFound page
    await expect(page.getByText('Page Not Found')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(`The page /hijhlm does not exist.`)).toBeVisible()
    console.log('✅ NotFound page displayed correctly')

    // Verify the "Go Back to Previous Page" button is visible
    // TODO: fix this test for production, it works locally
    //await expect(page.getByText('Go Back to Previous Page')).toBeVisible()
    //console.log('✅ "Go Back to Previous Page" button is correctly visible')

    // Verify navigation buttons are present
    await expect(page.getByText('Go to Home')).toBeVisible()

    // Navigate to home by clicking the button
    console.log('🏠 Clicking Go Back to Home button')
    await page.getByText('Go to Home').click()

    // Verify we're now on the settings page
    //await page.waitForURL(/.*\/about$/, { timeout: 10000 })
    //await expect(page.getByRole('heading', { name: 'About' })).toBeVisible({ timeout: 10000 })
    //console.log('✅ Navigated to About page successfully')

    // logout
    await logoutFromApplication(page)
    console.log('✅ Logged out successfully')

    console.log('✅ Invalid route test completed successfully')
  })
})
