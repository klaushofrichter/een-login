import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import {
  navigateToHome,
  loginToApplication,
  logoutFromApplication,
  getLastPartOfUrl,
  clickMobileNavButton
} from './utils'

// Load environment variables from .env file
dotenv.config()

let loggedBaseURL = false // Flag to ensure baseURL is logged only once
let basePath = ''

// Define the mobile viewport size
const mobileViewport = { width: 500, height: 800 }

test.describe('Mobile Navigation - Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Log Base URL and Proxy URL once before the first test runs
    if (!loggedBaseURL) {
      const baseURL = page.context()._options.baseURL
      const configuredProxyUrl = process.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333' // Default logic
      basePath = getLastPartOfUrl(baseURL)
      if (baseURL) {
        console.log(`\n🚀 Running tests against Service at URL: ${baseURL}`)
        console.log(`🔒 Using Auth Proxy URL: ${configuredProxyUrl}\n`)
        console.log(`🔍 Base path: ${basePath}`)
      }
      loggedBaseURL = true // Set flag so it doesn't log again
    }

    // Set mobile viewport size for all tests in this group
    await page.setViewportSize(mobileViewport)
    console.log('📱 Set viewport to mobile size:', mobileViewport)
  })

  test('should navigate through all pages via mobile menu', async ({ page }) => {
    console.log(`\n▶️ Running Test: ${test.info().title}\n`)
    console.log('🔍 Starting mobile page navigation test')

    // Navigate to login page
    await navigateToHome(page)

    // Login before each test
    await loginToApplication(page)

    // test the profile page
    await clickMobileNavButton(page, 'Profile', basePath, 'User Profile')

    // test the about page
    await clickMobileNavButton(page, 'About', basePath, 'About EEN Login')

    // test the settings page
    await clickMobileNavButton(page, 'Settings', basePath)  // no expected text because it's not unique

    // test the home page
    await clickMobileNavButton(page, 'Home', basePath, 'Welcome to EEN Login')

    // Test logout from mobile menu
    const hamburgerButton = page.locator('button[aria-controls="mobile-menu"]')
    await hamburgerButton.click()
    console.log('👆 Reopened the menu')
    await page.locator('#mobile-menu a').first().waitFor({ state: 'visible' })

    // Click Logout in the mobile menu
    console.log('🚪 Clicking logout in mobile menu')
    await page.locator('#mobile-menu button:has-text("Logout")').click()

    // Call our logout utility function with the fromMobile parameter set to true
    await logoutFromApplication(page, true)
    console.log('✅ Mobile page navigation test completed successfully')
  })
})
