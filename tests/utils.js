/**
 * Helper functions for Playwright tests to work with both local and GitHub Pages environments
 */

import { expect } from '@playwright/test'
import dotenv from 'dotenv'

// Whitelist of allowed GitHub Pages hosts
const GITHUB_PAGES_HOSTS = [
  'klaushofrichter.github.io'
  // Add more allowed hosts here as needed
]

/**
 * Determines if we're testing against GitHub Pages
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @returns {boolean} True if we're testing against GitHub Pages
 */
export function isGitHubPagesEnvironment(page) {
  const baseURL = page.context()._options.baseURL
  if (!baseURL) return false
  try {
    const { host } = new URL(baseURL)
    return GITHUB_PAGES_HOSTS.includes(host)
  } catch {
    return false
  }
}

/**
 * Builds a URL that works in both local and GitHub Pages environments
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} path - The path to navigate to (e.g. '/settings')
 * @returns {string} The full URL to use
 */
export function buildUrl(page, path) {
  const baseURL = page.context()._options.baseURL

  if (isGitHubPagesEnvironment(page)) {
    // GitHub Pages environment
    if (baseURL.endsWith('/een-login')) {
      return `${baseURL}${path}`
    } else if (!baseURL.includes('/een-login/')) {
      return `${baseURL}/een-login${path}`
    }
  }

  // Local development or already correct structure
  return new URL(path, baseURL).toString()
}

/**
 * Creates a URL pattern that works in both environments for URL matching
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} pathSuffix - The path ending to match (e.g. '/settings')
 * @returns {RegExp} A regular expression for matching the URL
 */
export function createUrlPattern(page, pathSuffix) {
  if (isGitHubPagesEnvironment(page)) {
    return new RegExp(`.*/een-login${pathSuffix}$`)
  }
  return new RegExp(`.*${pathSuffix}$`)
}

/**
 * Navigates to the app's home/login page as a starting point
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function navigateToHome(page) {
  console.log(`📝 Navigating to Home - REPLACED BY NAVIGATE TO LOGIN PAGE`)
  await navigateToLogin(page)
}

/**
 * Navigates to the app's login page as a starting point
 * @param {import('@playwright/test').Page} page - Playwright page object
 */
export async function navigateToLogin(page) {
  const loginUrl = buildUrl(page, '/')
  console.log(`📝 Navigating to Login URL: ${loginUrl}`)
  await page.goto(loginUrl) 
}

/**
 * Handles login to the application
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {string} username - The username to log in with
 * @param {string} password - The password to log in with
 */
export async function loginToApplication(page) {
  console.log('🔑 Starting login process')

  // Load environment variables from .env file
  dotenv.config()

  // Get credentials
   const username = process.env.TEST_USER
   const password = process.env.TEST_PASSWORD

   // eslint-disable-next-line playwright/no-conditional-in-test
   if (!username || !password) {
     throw new Error('Test credentials not found')
   }

  // Find and click login button
  const loginButton = page.getByText('Sign in with Eagle Eye Networks')
  await loginButton.click()

  // login with EEN
  await loginWithEEN(page)

  // In GitHub Pages, we need to handle the OAuth flow
  if (isGitHubPagesEnvironment(page)) {
    // Wait for redirect back to our app with code parameter
    await page.waitForURL(/.*\/een-login\/\?code=.*/, { timeout: 15000 })
    console.log('✅ Redirected back to app with code')

    // Wait for the code to be processed and redirect to home
    await page.waitForURL(/.*\/een-login\/home/, { timeout: 15000 })
    console.log('✅ Code processed, redirected to home')
  } else {
    // Wait for home page in local environment
    const homePattern = createUrlPattern(page, '/home')
    await page.waitForURL(homePattern, { timeout: 20000 })
  }
  console.log('✅ Successfully logged in')
}


export async function loginWithEEN(page) {
  console.log('🔑 Starting login with EEN')

  // Load environment variables from .env file
  dotenv.config()

  // Get credentials
   const username = process.env.TEST_USER
   const password = process.env.TEST_PASSWORD

   // eslint-disable-next-line playwright/no-conditional-in-test
   if (!username || !password) {
     throw new Error('Test credentials not found')
   }

  // Wait for redirect to EEN
  await page.waitForURL(/.*eagleeyenetworks.com.*/, { timeout: 15000 })
  console.log('✅ Reached EEN signin page')

  // Fill email
  const emailInput = page.locator('#authentication--input__email')
  await emailInput.waitFor({ state: 'visible', timeout: 15000 })
  await emailInput.fill(username)

  // Click next
  await page.getByRole('button', { name: 'Next' }).click()

  // Fill password
  const passwordInput = page.locator('#authentication--input__password')
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 })
  await passwordInput.fill(password)

  // Click sign in
  const signInButton = page.locator('#next')
  const signInButtonByText = page.getByRole('button', { name: 'Sign in' })
  try {
    await signInButton.click()
  } catch (error) {
    await signInButtonByText.click()
  }
  console.log('✅ Finished EEN login')
}


/**
 * Logs out of the application
 * @param {import('@playwright/test').Page} page - Playwright page object
 * @param {boolean} fromMobile - Whether the logout is from the mobile menu
 */
export async function logoutFromApplication(page, fromMobile = false, fast = false) {
  console.log('🚪 Starting logout process. FromMobile:', fromMobile)
  if (!fromMobile) {
    // Regular logout flow
    try {
      await page.getByRole('button', { name: 'Logout' }).click({ timeout: 5000 })
    } catch (error) {
      console.log('⚠️ Could not find logout button, trying alternative method')
      try {
        await page.getByRole('link', { name: 'Logout' }).click({ timeout: 5000 })
      } catch (e) {
        console.log('⚠️ Could not find logout link either, continuing')
      }
    }
  }
  // If fromMobile is true, we assume the logout button was already clicked

  // Wait for the logout modal, but don't fail if it doesn't appear
  await page.getByText('Goodbye!').waitFor({ state: 'visible', timeout: 5000 })
  console.log('✅ Logout modal displayed')

    // Click OK to confirm logout
  if (fast) {
    await page.getByRole('button', { name: 'OK' }).click()
    console.log('👆 Clicked OK button to speed up logout')
  } 
  else {
    // Wait for the logout modal to be visible
    console.log('🔍 Waiting for logout modal to timeout - this will take 10+ seconds')
    await page.waitForTimeout(5000) 
  }

  // Wait for redirect to login page
  try {
    console.log('🔍 Waiting for redirect to login page')
    await page.getByText('Sign in with Eagle Eye Networks').waitFor({ state: 'visible', timeout: 10000 })
    console.log('✅ Successfully logged out')
  } catch (e) {
    console.log('⚠️ Did not detect redirect to login page')
    throw new Error('Failed to logout')
  }
}

/**
 * Extracts the last part of a URL pathname
 * @param {string} url - The URL to extract the last part from
 * @returns {string} The last part of the URL pathname
 */
export function getLastPartOfUrl(url) {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;

    if (pathname === "/") {
      return "";
    }

    const parts = pathname.split('/');
    return '/'+parts[parts.length - 1];
  } catch (error) {
    // Handle cases where the input is not a valid URL
    console.error("Invalid URL:", error);
    return ""; // Or you could return null or throw an error
  }
}


export async function clickNavButton(page, buttonName) { 
    // click the "about" button in the navigation bar
    const button = page.getByRole('link', { name: buttonName }).first()
    await button.click()
    await expect(page.getByRole('heading', { name: buttonName })).toBeVisible({ timeout: 10000 }) 
    //await expect(page.url()).toContain(buttonName.toLowerCase(), { timeout: 10000 })
    console.log(`✅ Successfully navigated to ${buttonName} page`)
}


export async function clickMobileNavButton(page, buttonName, basePath, expectedText=null) { 
  const hamburgerButton = page.locator('button[aria-controls="mobile-menu"]')
  await expect(hamburgerButton).toBeVisible()
  await hamburgerButton.click()
  console.log('👆 Opened the mobile menu')

  // Wait for menu to be visible
  await page.locator('#mobile-menu a').first().waitFor({ state: 'visible' })

  // Navigate to the page
  console.log('👤 Navigating to '+buttonName+" page")
  await page.locator('#mobile-menu a[href*="/'+buttonName.toLowerCase()+'"]').click()

  // Use our URL pattern utility
  const profileUrl= basePath + '/' + buttonName.toLowerCase()
  await page.waitForURL(profileUrl, { timeout: 10000 })
  if (expectedText) {
    await expect(page.getByText(expectedText)).toBeVisible()
  }
  console.log('✅ '+buttonName+' page loaded successfully')
}
