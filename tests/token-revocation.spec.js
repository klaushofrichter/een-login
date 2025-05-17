// eslint-disable-next-line playwright/no-conditional-in-test
import { test, expect } from '@playwright/test'
import dotenv from 'dotenv'
// eslint-disable-next-line no-unused-vars
import {
  navigateToLogin,
  loginToApplication,
  logoutFromApplication,
  getLastPartOfUrl
} from './utils'

// Load environment variables from .env file
dotenv.config() // for .env variables

let loggedBaseURL = false // Flag to ensure baseURL is logged only once
let basePath = ''

test.describe('Token Revocation', () => {
  test.beforeEach(async ({ page }) => {
    // Log Base URL and Proxy URL once before the first test runs
    // eslint-disable-next-line playwright/no-conditional-in-test
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

  test('should revoke token on logout', async ({ page, browser }) => {
    console.log(`\n▶️ Running Test: ${test.info().title}\n`)
    console.log('🔍 Starting token revocation test')
    console.log(
      '  This test performs a login, retrieves an access token, and then logs out and cancels the logout process. '
    )
    console.log(
      '  The logout again without cancelation, and go to the direct page and enters the access token to check if it is revoked. '
    )
    test.setTimeout(30000) // 30 sec max for this test

    // go directly to the home page
    await navigateToLogin(page, basePath)
    await loginToApplication(page, basePath)

    // we expect to be on the home page
    await expect(
      page.getByText('You have successfully logged in to your Eagle Eye Networks account')
    ).toBeVisible({ timeout: 10000 })
    console.log('✅ Home page displayed correctly')

    // go to the profile page
    await page.goto(basePath + '/profile') // this does not click the button in the navigation bar
    await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible({ timeout: 10000 })
    console.log('✅ Profile page displayed correctly')

    // find the Show and Copy button
    const showCopyButton = page.getByRole('button', { name: 'Show & Copy' })
    await showCopyButton.click()
    console.log('✅ Show and Copy button clicked')

    // wait for the hide button to be visible
    const hideButton = page.getByRole('button', { name: 'Hide' })
    await expect(hideButton).toBeVisible({ timeout: 10000 })
    console.log('✅ Hide button displayed correctly')

    // retrieve the access token from the input field (try label, then fallback to readonly input)
    const accessTokenInput = page.locator('#access-token')
    await expect(accessTokenInput).toBeVisible({ timeout: 10000 })
    console.log('✅ Access token input field found correctly')

    // get the access token from the input field
    const accessToken = await accessTokenInput.inputValue()
    console.log('✅ Access token retrieved from input field')

    // retrieve the expiration time from the input field
    const expirationTimeInput = page.locator('#expiration-time')
    await expect(expirationTimeInput).toBeVisible({ timeout: 10000 })
    console.log('✅ Expiration time input field found correctly')
    const expirationTime = await expirationTimeInput.inputValue()
    console.log('✅ Expiration time retrieved from input field:', expirationTime)
    expect(expirationTime).toContain('more than')

    // retrieve the refresh token from the input field
    const refreshTokenInput = page.locator('#refresh-token')
    await expect(refreshTokenInput).toBeVisible({ timeout: 10000 })
    console.log('✅ Refresh token input field found correctly')
    const refreshToken = await refreshTokenInput.inputValue()
    console.log('✅ Refresh token retrieved from input field:', refreshToken)
    expect(refreshToken).toBe('Available')

    // SECOND PAGE SPAWN HERE - ANONYMOUS
    // open a new context 
    const anonymousContext = await browser.newContext();

    // Create a new page within the anonymous context
    const secondPage = await anonymousContext.newPage();
    await secondPage.goto(basePath + '/direct')
    await expect(secondPage.getByRole('heading', { name: 'Direct' })).toBeVisible({
      timeout: 10000
    })
    console.log('✅ P2: Direct page displayed correctly')

    // enter the access token into the text field
    await secondPage.locator('#token').fill(accessToken)
    console.log('✅ P2: Access token entered into text field')

    // click the proceed button
    const secondProceedButton = secondPage.getByRole('button', { name: 'Proceed' })
    await secondProceedButton.click()
    console.log('✅ P2: Proceed button clicked')

    // wait for the home page to be visible
    await expect(secondPage.getByText('You have successfully logged in to your Eagle Eye Networks account')).toBeVisible({
      timeout: 10000
    })
    console.log('✅ P2: Home page displayed correctly')

    // go to the profile page
    await secondPage.goto(basePath + '/profile')
    await expect(secondPage.getByRole('heading', { name: 'Profile' })).toBeVisible({
      timeout: 10000
    })
    console.log('✅ P2: Profile page displayed correctly')

    // find the refresh token input field and read its value  
    const secondRefreshTokenInput = secondPage.locator('#refresh-token')
    await expect(secondRefreshTokenInput).toBeVisible({ timeout: 10000 })
    console.log('✅ P2: Refresh token input field found correctly')
    const secondRefreshToken = await secondRefreshTokenInput.inputValue()
    console.log('✅ P2: Refresh token retrieved from input field:', secondRefreshToken)
    expect(secondRefreshToken).toBe('No Refresh Token available')
    
    // find and read the expiration time
    const secondExpirationTimeInput = secondPage.locator('#expiration-time')
    await expect(secondExpirationTimeInput).toBeVisible({ timeout: 10000 })
    console.log('✅ P2: Expiration time input field found correctly')
    const secondExpirationTime = await secondExpirationTimeInput.inputValue()
    console.log('✅ P2: Expiration time retrieved from input field:', secondExpirationTime)
    expect(secondExpirationTime).toContain('Token expiration date is unknown')

    // close the second page
    await secondPage.close()
    console.log('✅ P2: Second page closed')

    // FIRST PAGE CONTINUES HERE
    // find and click the logout button on the first page
    const logoutButton = page.getByRole('button', { name: 'Logout' })
    await logoutButton.click()
    console.log('✅ Logout button clicked')

    // wait for the cancel button to be visible
    const cancelButton = page.getByRole('button', { name: 'Cancel' })
    await expect(cancelButton).toBeVisible({ timeout: 10000 })
    console.log('✅ Cancel button displayed correctly')

    // click the cancel button
    await cancelButton.click()

    // read the expiration time again
    const expirationTimeAfterCancel = await expirationTimeInput.inputValue()
    console.log('✅ Expiration time after cancel:', expirationTimeAfterCancel)
    expect(expirationTimeAfterCancel).toContain('more than')

    // read the refresh token again
    const refreshTokenAfterCancel = await refreshTokenInput.inputValue()
    console.log('✅ Refresh token after cancel:', refreshTokenAfterCancel)
    expect(refreshTokenAfterCancel).toBe('Available')

    // logout
    await logoutFromApplication(page)
    console.log('✅ Logged out from application with extra timeout')
    // eslint-disable-next-line playwright/no-wait-for-timeout
    await page.waitForTimeout(5000)

    // go to the direct page
    await page.goto(basePath + '/direct')
    await expect(page.getByRole('heading', { name: 'Direct' })).toBeVisible({ timeout: 10000 })
    console.log('✅ Direct page displayed correctly')

    // enter the access token into the text field
    await page.locator('#token').fill(accessToken)
    console.log('✅ Access token entered into text field')

    // clck the proceed button
    const backToLoginButton = page.getByRole('button', { name: 'Back to Login' })
    const proceedButton = page.getByRole('button', { name: 'Proceed' })
    await proceedButton.click()
    console.log('✅ Proceed button clicked')

    // wait for text to show that the token was revoked
    await expect(
      page.getByText('The client caller does not have a valid authentication credential')
    ).toBeVisible({ timeout: 10000 })
    console.log('✅ Token revoked text displayed correctly')

    // press the "back to login" button
    await backToLoginButton.click()
    console.log('✅ Back to Login button clicked')

    // check that we are on the login page
    // await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible({ timeout: 10000 })
    await page
      .getByText('Sign in with Eagle Eye Networks')
      .waitFor({ state: 'visible', timeout: 10000 })
    console.log('✅ Login page displayed correctly')

    console.log('✅ Token revocation test completed successfully')
  })
})
