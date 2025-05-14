// eslint-disable-next-line playwright/no-conditional-in-test
import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import { navigateToHome, isGitHubPagesEnvironment } from './utils'

// Load environment variables from .env file
dotenv.config()
import pkg from '../package.json' assert { type: 'json' }

let loggedBaseURL = false // Flag to ensure baseURL is logged only once

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Log Base URL and Proxy URL once before the first test runs
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (!loggedBaseURL) {
      const baseURL = page.context()._options.baseURL
      const configuredProxyUrl = process.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333' // Default logic
      // eslint-disable-next-line playwright/no-conditional-in-test
      if (baseURL) {
        console.log(`\n🚀 Running tests against Service at URL: ${baseURL}`)
        console.log(`🔒 Using Auth Proxy URL: ${configuredProxyUrl}\n`)

        // Log if we're in GitHub Pages or local environment
        const environment = isGitHubPagesEnvironment(page) ? 'GitHub Pages' : 'local development'
        console.log(`🔍 Testing in ${environment} environment\n`)
      }
      loggedBaseURL = true // Set flag so it doesn't log again
    }

    // Go to the login page before each test using our utility function
    await navigateToHome(page)
  })

  test('login page should have correct elements and consistent styling', async ({ page }) => {
    console.log(`\n▶️ Running Test: ${test.info().title}\n`)
    console.log('🔍 Starting login page elements test')
    console.log('🔍 This test checks the login page for the correct elements and consistent styling')

    // Check if we're on the login page
    await expect(page.getByText('Welcome to EEN Login')).toBeVisible()
    await expect(page.getByText('Sign in with Eagle Eye Networks')).toBeVisible()
    console.log('✅ Login page main elements verified')

    // Check bottom elements styling
    const bottomDiv = page.locator('.absolute.bottom-4')
    await expect(bottomDiv).toBeVisible()
    console.log('🔎 Checking footer elements')

    // Get all text elements in the bottom div
    const version = bottomDiv.locator('span').first()
    const separator = bottomDiv.locator('span').nth(1)
    const readme = bottomDiv.locator('a')

    // Check version element
    await expect(version).toHaveClass(/text-gray-400 dark:text-gray-500/)
    await expect(version).toHaveText(/^v\d+\.\d+\.\d+$/)
    console.log('✅ Version element verified')

    // Check separator
    await expect(separator).toHaveClass(/text-gray-400 dark:text-gray-500/)
    await expect(separator).toHaveText(/\|/)
    console.log('✅ Separator element verified')

    // Check README link (account for both environments)
    const classAttr = await readme.getAttribute('class')
    expect(classAttr).toContain('text-gray-400')
    expect(classAttr).toContain('hover:text-gray-600')
    expect(classAttr).toContain('dark:hover:text-gray-500')
    expect(classAttr).toContain('dark:hover:text-gray-400')

    // eslint-disable-next-line playwright/no-conditional-in-test
    let isDev = process.env.NODE_ENV !== 'production'
    if(process.env.PLAYWRIGHT_TEST_BASE_URL === `https://klaushofrichter.github.io/${pkg.name}`) 
      isDev=false  // because we use the deployed app version on GitHub Pages

    // eslint-disable-next-line playwright/no-conditional-in-test
    const expectedReadmeHref = isDev
      ? `https://github.com/klaushofrichter/${pkg.name}/blob/develop/README.md`
      : `https://github.com/klaushofrichter/${pkg.name}/blob/gh-pages/README.md`
  await expect(readme).toHaveAttribute('href', expectedReadmeHref)
    console.log('✅ README link verified')
    console.log('✅ Login page test completed successfully')
  })
})
