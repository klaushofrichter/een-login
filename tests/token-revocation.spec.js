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
dotenv.config()  // for .env variables

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

  test('should revoke token on logout', async ({ page }) => {


    console.log(`\n▶️ Running Test: ${test.info().title}\n`)
    console.log('🔍 Starting token revocation test')
    console.log('  This test performs a login, retrieves an access token, and then logs out. ')
    console.log('  Then it goes to the direct page and enters the access token to check if it is revoked. ')
    test.setTimeout(30000)  // 30 sec max for this test

    // go directly to the home page
    await navigateToLogin(page)
    await loginToApplication(page)

    // we expect to be on the home page
    await expect(page.getByText('You have successfully logged in to your Eagle Eye Networks account')).toBeVisible({ timeout: 10000 })
    console.log('✅ Home page displayed correctly')

    // go to the profile page
    await page.goto(basePath+'/profile')  // this does not click the button in the navigation bar
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

    // logout
    await logoutFromApplication(page)
    console.log('✅ Logged out from application with extra timeout')
    await page.waitForTimeout(5000)

   // go to the direct page
   await page.goto(basePath+'/direct')
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
    await expect(page.getByText('The client caller does not have a valid authentication credential')).toBeVisible({ timeout: 10000 })
    console.log('✅ Token revoked text displayed correctly')

    // press the "back to login" button
    await backToLoginButton.click()
    console.log('✅ Back to Login button clicked')

    // check that we are on the login page
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible({ timeout: 10000 })
    console.log('✅ Login page displayed correctly')

    console.log('✅ Token revocation test completed successfully')
  })
})
