import { useAuthStore } from '../stores/auth'
import securityService from './security'

/**
 * Media Session Service for interacting with EEN Media Session APIs
 */
class MediaSessionService {
  /**
   * Get media session URL for setting session cookies
   * @returns {Promise<Object>} Media session URL response
   * @throws {Error} If the request fails
   */
  async getMediaSession() {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/media/session`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(requestUrl)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch media session: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[MediaSessionService] Error fetching media session:', error)
      throw error
    }
  }

  /**
   * Initialize media session cookie by calling the session URL
   * This method fetches the session URL and then makes a request to that URL to set the cookie
   * @returns {Promise<boolean>} True if session was successfully initialized
   * @throws {Error} If the request fails
   */
  async initializeMediaSession() {
    try {
      // First get the media session URL
      const sessionResponse = await this.getMediaSession()
      
      if (!sessionResponse.url) {
        throw new Error('No session URL returned from media session endpoint')
      }

      // Validate the session URL scheme
      if (!securityService.validateUrlScheme(sessionResponse.url)) {
        throw new Error('Invalid session URL scheme')
      }

      // Make a request to the session URL to set the cookie
      // This request will set the media session cookie in the browser
      const authStore = useAuthStore()
      const cookieResponse = await fetch(sessionResponse.url, {
        method: 'GET',
        credentials: 'include', // Important: include cookies in the request
        headers: {
          'Accept': '*/*',
          'Authorization': `Bearer ${authStore.token}` // Include auth for session setup
        }
      })

      if (!cookieResponse.ok) {
        throw new Error(`Failed to initialize media session cookie: ${cookieResponse.status} ${cookieResponse.statusText}`)
      }

      console.log('[MediaSessionService] Media session cookie initialized successfully')
      return true
    } catch (error) {
      console.error('[MediaSessionService] Error initializing media session:', error)
      throw error
    }
  }

  /**
   * Get media session URL and redirect to it (for browser-based redirects)
   * This method is useful when you want the browser to handle the redirect automatically
   * @returns {Promise<string>} The session URL for manual redirection
   * @throws {Error} If the request fails
   */
  async getMediaSessionUrl() {
    try {
      const sessionResponse = await this.getMediaSession()
      
      if (!sessionResponse.url) {
        throw new Error('No session URL returned from media session endpoint')
      }

      return sessionResponse.url
    } catch (error) {
      console.error('[MediaSessionService] Error getting media session URL:', error)
      throw error
    }
  }

  /**
   * Check if media session is likely active by testing access to a media endpoint
   * Note: This is a utility method to help determine if the session cookie is working
   * @param {string} testMediaUrl - A media URL to test (optional)
   * @returns {Promise<boolean>} True if session appears to be active
   */
  async isMediaSessionActive(testMediaUrl = null) {
    try {
      // If no test URL provided, we can't verify the session
      if (!testMediaUrl) {
        console.warn('[MediaSessionService] No test media URL provided, cannot verify session status')
        return false
      }

      // Validate the test URL scheme
      if (!securityService.validateUrlScheme(testMediaUrl)) {
        throw new Error('Invalid test media URL scheme')
      }

      // Try to access the media URL with credentials (cookies)
      const testResponse = await fetch(testMediaUrl, {
        method: 'HEAD', // Use HEAD to avoid downloading the full media
        credentials: 'include',
        headers: {
          'Accept': '*/*'
        }
      })

      // If we get a 2xx response, the session is likely active
      return testResponse.ok
    } catch (error) {
      console.error('[MediaSessionService] Error checking media session status:', error)
      return false
    }
  }
}

// Create and export a singleton instance
export const mediaSessionService = new MediaSessionService()

// Export the class for testing or multiple instances if needed
export { MediaSessionService } 