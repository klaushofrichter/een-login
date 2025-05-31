import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
import { getLastPartOfUrl, MAX_TEST_TIMEOUT } from './utils.js'
import { createRequire } from 'module'
import { APP_NAME } from '../src/constants.js'

const require = createRequire(import.meta.url)
const pkg = require('../package.json')

// Load environment variables from .env file
dotenv.config()

let loggedBaseURL = false // Flag to ensure baseURL is logged only once
let basePath = ''

test.describe('Direct Page', () => {
  test.beforeEach(async ({ page }) => {
    // Log Base URL and Proxy URL once before the first test runs
     
    if (!loggedBaseURL) {
      const baseURL = page.context()._options.baseURL
      const configuredProxyUrl = process.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333' // Default logic
      const redirectUri = process.env.VITE_REDIRECT_URI || 'http://127.0.0.1:3333'
      basePath = getLastPartOfUrl(baseURL)
       
      if (baseURL) {
        console.log(`\n🚀 Running tests against Service at URL: ${baseURL}`)
        console.log(`🔒 Using Auth Proxy URL: ${configuredProxyUrl}`)
        console.log(`🔒 Using Redirect URI: ${redirectUri}`)
        console.log(`🔒 Using basePath: ${basePath}\n`)
      }
      loggedBaseURL = true // Set flag so it doesn't log again
    }
  })

  test('direct page should have correct elements and consistent styling', async ({ page }) => {
    console.log(`\n▶️ Running Test: ${test.info().title}\n`)
    console.log('🔍 Starting direct page elements test')
    test.setTimeout(MAX_TEST_TIMEOUT) // max 40 seconds overall

    // Continue with the test for local environment
    const directUrl = basePath + '/direct'
    console.log(`📝 Direct URL: ${directUrl}`)
    await page.goto(directUrl)
    console.log('🌐 Navigated to direct login page')

    // Check if we're on the direct page
    await expect(
      page.getByRole('heading', { name: new RegExp(`Direct Access to ${APP_NAME}`) })
    ).toBeVisible()
    console.log('✅ Direct page heading verified')

    // Check for form elements
    await expect(page.getByLabel('Access Token')).toBeVisible()
    await expect(page.getByLabel('Base URL')).toBeVisible()
    await expect(page.getByLabel('Port')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Back to Login' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Proceed' })).toBeVisible()
    console.log('✅ Form elements verified')

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

    // Check README link
    const classAttr = await readme.getAttribute('class')
    expect(classAttr).toContain('text-gray-400')
    expect(classAttr).toContain('hover:text-gray-600')
    expect(classAttr).toContain('dark:hover:text-gray-500')
    expect(classAttr).toContain('dark:hover:text-gray-400')
    let isDev = process.env.NODE_ENV !== 'production'
    // eslint-disable-next-line playwright/no-conditional-in-test
    if (process.env.PLAYWRIGHT_TEST_BASE_URL === `https://klaushofrichter.github.io/${pkg.name}`)
      isDev = false // because we use the deployed app version on GitHub Pages
    // eslint-disable-next-line playwright/no-conditional-in-test
    const expectedReadmeHref = isDev
      ? `https://github.com/klaushofrichter/${pkg.name}/blob/develop/README.md`
      : `https://github.com/klaushofrichter/${pkg.name}/blob/gh-pages/README.md`
    await expect(readme).toHaveAttribute('href', expectedReadmeHref)
    console.log('✅ README link verified')
    console.log('✅ Direct page test completed successfully')
  })
})
