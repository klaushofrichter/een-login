import { defineConfig, devices } from '@playwright/test'

// Read base URL from environment variable, default to local dev server
const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:3333'

// Define webServer config only when testing locally
const webServer = baseURL.includes('127.0.0.1')
  ? {
      command: 'npm run dev',
      url: 'http://127.0.0.1:3333',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000 // Increased timeout for server start
    }
  : undefined

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Keep false due to shared auth state potentially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Keep workers at 1 due to auth tests potentially interfering
  reporter: 'html',
  use: {
    baseURL: baseURL, // Use the dynamic baseURL
    trace: 'on-first-retry',
    video: 'on'
  },
  outputDir: './test-results/',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
    // Add other browsers if needed
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  // Conditionally define webServer
  webServer: webServer
})