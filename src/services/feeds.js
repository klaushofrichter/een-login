import { useAuthStore } from '../stores/auth'
import securityService from './security'

/**
 * Feeds Service for interacting with EEN Feeds APIs
 */
class FeedsService {
  /**
   * List feeds for devices with various filtering options
   * @param {Object} [options] - Query options
   * @param {string} [options.deviceId] - The device generating the feed
   * @param {Array<string>} [options.deviceId__in] - The device IDs of the devices for which to return the feeds
   * @param {string} [options.type] - The stream type ('main', 'preview', 'talkdown')
   * @param {Array<string>} [options.include] - Fields to include ('flvUrl', 'rtspUrl', 'rtspsUrl', 'localRtspUrl', 'hlsUrl', 'multipartUrl', 'webRtcUrl', 'audioPushHttpsUrl')
   * @param {string} [options.pageToken] - Page token for pagination
   * @param {number} [options.pageSize] - Number of results per page
   * @returns {Promise<Object>} Paginated list of feeds
   * @throws {Error} If the request fails
   */
  async listFeeds(options = {}) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    try {
      const queryParams = new URLSearchParams()
      
      // Add single string parameters
      if (options.deviceId) {
        queryParams.append('deviceId', options.deviceId)
      }
      if (options.type) {
        queryParams.append('type', options.type)
      }
      if (options.pageToken) {
        queryParams.append('pageToken', options.pageToken)
      }
      if (typeof options.pageSize === 'number') {
        queryParams.append('pageSize', options.pageSize.toString())
      }
      
      // Add array parameters
      if (options.deviceId__in?.length) {
        queryParams.append('deviceId__in', options.deviceId__in.join(','))
      }
      if (options.include?.length) {
        queryParams.append('include', options.include.join(','))
      }
      
      const requestUrl = `${authStore.baseUrl}/api/v3.0/feeds${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      
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
        throw new Error(`Failed to fetch feeds: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[FeedsService] Error fetching feeds:', error)
      throw error
    }
  }

  /**
   * Get feeds for a specific device with optional filtering
   * @param {string} deviceId - The device ID to get feeds for
   * @param {Object} [options] - Additional options
   * @param {string} [options.type] - Filter by stream type ('main', 'preview', 'talkdown')
   * @param {Array<string>} [options.include] - Fields to include in response
   * @returns {Promise<Object>} Feeds response for the device
   * @throws {Error} If the request fails
   */
  async getFeedsForDevice(deviceId, options = {}) {
    if (!deviceId) {
      throw new Error('Device ID is required')
    }

    return this.listFeeds({
      deviceId,
      ...options
    })
  }

  /**
   * Get multipart URL for a specific device and stream type
   * @param {string} deviceId - The device ID
   * @param {string} [type='preview'] - The stream type ('main', 'preview', 'talkdown')
   * @returns {Promise<string|null>} The multipart URL or null if not found
   * @throws {Error} If the request fails
   */
  async getMultipartUrl(deviceId, type = 'preview') {
    if (!deviceId) {
      throw new Error('Device ID is required')
    }

    try {
      const response = await this.listFeeds({
        deviceId,
        type,
        include: ['multipartUrl']
      })

      // Find the feed with the specified type and multipartUrl
      const feed = response.results?.find(feed => 
        feed.type === type && feed.multipartUrl
      )

      return feed?.multipartUrl || null
    } catch (error) {
      console.error('[FeedsService] Error getting multipart URL:', error)
      throw error
    }
  }

  /**
   * Get all available URLs for a specific device and stream type
   * @param {string} deviceId - The device ID
   * @param {string} [type='preview'] - The stream type ('main', 'preview', 'talkdown')
   * @returns {Promise<Object|null>} Object with all available URLs or null if not found
   * @throws {Error} If the request fails
   */
  async getAllUrls(deviceId, type = 'preview') {
    if (!deviceId) {
      throw new Error('Device ID is required')
    }

    try {
      const response = await this.listFeeds({
        deviceId,
        type,
        include: [
          'flvUrl',
          'rtspUrl', 
          'rtspsUrl',
          'localRtspUrl',
          'hlsUrl',
          'multipartUrl',
          'webRtcUrl',
          'audioPushHttpsUrl'
        ]
      })

      // Find the feed with the specified type
      const feed = response.results?.find(feed => feed.type === type)

      if (!feed) {
        return null
      }

      // Return only the URL fields
      return {
        flvUrl: feed.flvUrl,
        rtspUrl: feed.rtspUrl,
        rtspsUrl: feed.rtspsUrl,
        localRtspUrl: feed.localRtspUrl,
        hlsUrl: feed.hlsUrl,
        multipartUrl: feed.multipartUrl,
        webRtcUrl: feed.webRtcUrl,
        audioPushHttpsUrl: feed.audioPushHttpsUrl
      }
    } catch (error) {
      console.error('[FeedsService] Error getting all URLs:', error)
      throw error
    }
  }
}

// Create and export a singleton instance
export const feedsService = new FeedsService()

// Export the class for testing or multiple instances if needed
export { FeedsService } 