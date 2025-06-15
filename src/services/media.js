import { useAuthStore } from '../stores/auth'
import securityService from './security'

/**
 * Media Service for interacting with EEN Media APIs
 */
class MediaService {
  /**
   * Convert ArrayBuffer to base64 string
   * @param {ArrayBuffer} buffer - The array buffer to convert
   * @returns {string} Base64 string
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  /**
   * List media intervals for a device
   * @param {Object} options - Query options
   * @param {string} options.deviceId - The ID of the device (required)
   * @param {string} options.type - Stream type ('preview' or 'main') (required)
   * @param {string} options.mediaType - Media type ('video' or 'image') (required)
   * @param {string} options.startTimestamp__gte - Start timestamp (ISO 8601) (required)
   * @param {string} [options.endTimestamp__lte] - End timestamp (ISO 8601)
   * @param {boolean} [options.coalesce=true] - Coalesce connected intervals
   * @param {Array<string>} [options.include] - Fields to include (flvUrl, rtspUrl, rtspsUrl, multipartUrl, mp4Url)
   * @param {string} [options.pageToken] - Page token for pagination
   * @param {number} [options.pageSize] - Number of results per page
   * @returns {Promise<Object>} Paginated list of media intervals
   * @throws {Error} If the request fails
   */
  async listMedia(options = {}) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!options.deviceId) {
      throw new Error('Device ID is required')
    }

    if (!options.type) {
      throw new Error('Stream type is required (preview or main)')
    }

    if (!options.mediaType) {
      throw new Error('Media type is required (video or image)')
    }

    if (!options.startTimestamp__gte) {
      throw new Error('Start timestamp is required')
    }

    try {
      const queryParams = new URLSearchParams()
      
      // Required parameters
      queryParams.append('deviceId', options.deviceId)
      queryParams.append('type', options.type)
      queryParams.append('mediaType', options.mediaType)
      queryParams.append('startTimestamp__gte', options.startTimestamp__gte)
      
      // Optional parameters
      if (options.endTimestamp__lte) {
        queryParams.append('endTimestamp__lte', options.endTimestamp__lte)
      }
      if (typeof options.coalesce === 'boolean') {
        queryParams.append('coalesce', options.coalesce.toString())
      }
      if (options.include?.length) {
        queryParams.append('include', options.include.join(','))
      }
      if (options.pageToken) {
        queryParams.append('pageToken', options.pageToken)
      }
      if (typeof options.pageSize === 'number') {
        queryParams.append('pageSize', options.pageSize.toString())
      }
      
      const requestUrl = `${authStore.baseUrl}/api/v3.0/media?${queryParams.toString()}`
      
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
        throw new Error(`Failed to fetch media list: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[MediaService] Error fetching media list:', error)
      throw error
    }
  }

  /**
   * Get a live image from a camera
   * @param {string} deviceId - The ID of the device (camera)
   * @param {string} [type='preview'] - The type of stream to fetch ('preview' only for live images)
   * @returns {Promise<{ image: string|null, timestamp: string|null, prevToken: string|null }>} Live image data and headers
   */
  async getLiveImage(deviceId, type = 'preview') {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }
    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }
    if (!deviceId) {
      throw new Error('Device ID is required')
    }

    // Validate type parameter
    if (type !== 'preview') {
      throw new Error('Live image type must be "preview"')
    }

    try {
      const queryParams = new URLSearchParams()
      queryParams.append('deviceId', deviceId)
      queryParams.append('type', type)

      const url = `${authStore.baseUrl}/api/v3.0/media/liveImage.jpeg?${queryParams.toString()}`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(url)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'image/jpeg',
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      const timestamp = response.headers.get('X-Een-Timestamp')
      const prevToken = response.headers.get('X-Een-PrevToken')

      if (!response.ok) {
        throw new Error(`Failed to fetch live image: ${response.status} ${response.statusText}`)
      }

      // Get image as base64
      const arrayBuffer = await response.arrayBuffer()
      const base64Image = `data:image/jpeg;base64,${this.arrayBufferToBase64(arrayBuffer)}`
      return { image: base64Image, timestamp, prevToken }
    } catch (error) {
      console.error('[MediaService] Error fetching live image:', error)
      throw error
    }
  }

  /**
   * Get a recorded image from a camera
   * @param {Object} options - Query options
   * @param {string} [options.deviceId] - The ID of the device (camera) - not required when using pageToken
   * @param {string} [options.pageToken] - Token from previous request (X-Een-NextToken or X-Een-PrevToken)
   * @param {string} [options.type] - Stream type ('preview' or 'main')
   * @param {string} [options.timestamp__lt] - Return first image with timestamp less than
   * @param {string} [options.timestamp__lte] - Return first image with timestamp less or equal
   * @param {string} [options.timestamp] - Return image at this exact timestamp
   * @param {string} [options.timestamp__gte] - Return first image with timestamp greater or equal
   * @param {string} [options.timestamp__gt] - Return first image with timestamp greater than
   * @param {Array<string>} [options.overlayId__in] - List of overlay IDs to include
   * @param {Array<string>} [options.include] - Include options ('overlayEmbedded', 'overlaySvgHeader')
   * @returns {Promise<{ image: string|null, timestamp: string|null, nextToken: string|null, prevToken: string|null, overlaySvg: string|null }>} Recorded image data and headers
   */
  async getRecordedImage(options = {}) {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }
    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    // Validate required parameters (either deviceId or pageToken)
    if (!options.deviceId && !options.pageToken) {
      throw new Error('Either deviceId or pageToken is required')
    }

    // If using pageToken, no other parameters are needed
    if (!options.pageToken) {
      // Validate at least one timestamp parameter is provided
      const timestampParams = ['timestamp__lt', 'timestamp__lte', 'timestamp', 'timestamp__gte', 'timestamp__gt']
      const hasTimestamp = timestampParams.some(param => options[param])
      if (!hasTimestamp) {
        throw new Error('At least one timestamp parameter is required')
      }
    }

    // Validate overlay requirements
    if (options.include?.includes('overlaySvgHeader') && (!options.overlayId__in || !options.overlayId__in.length)) {
      throw new Error('At least one overlayId must be provided when requesting overlay headers')
    }

    try {
      const queryParams = new URLSearchParams()
      
      // Add parameters based on what's provided
      if (options.deviceId) {
        queryParams.append('deviceId', options.deviceId)
      }
      if (options.pageToken) {
        queryParams.append('pageToken', options.pageToken)
      }
      if (options.type) {
        queryParams.append('type', options.type)
      }
      
      // Timestamp parameters
      if (options.timestamp__lt) {
        queryParams.append('timestamp__lt', options.timestamp__lt)
      }
      if (options.timestamp__lte) {
        queryParams.append('timestamp__lte', options.timestamp__lte)
      }
      if (options.timestamp) {
        queryParams.append('timestamp', options.timestamp)
      }
      if (options.timestamp__gte) {
        queryParams.append('timestamp__gte', options.timestamp__gte)
      }
      if (options.timestamp__gt) {
        queryParams.append('timestamp__gt', options.timestamp__gt)
      }
      
      // Overlay parameters
      if (options.overlayId__in?.length) {
        queryParams.append('overlayId__in', options.overlayId__in.join(','))
      }
      if (options.include?.length) {
        queryParams.append('include', options.include.join(','))
      }

      const url = `${authStore.baseUrl}/api/v3.0/media/recordedImage.jpeg?${queryParams.toString()}`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(url)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'image/jpeg',
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      const timestamp = response.headers.get('X-Een-Timestamp')
      const nextToken = response.headers.get('X-Een-NextToken')
      const prevToken = response.headers.get('X-Een-PrevToken')
      const overlaySvg = response.headers.get('X-Een-OverlaySvg')

      if (!response.ok) {
        throw new Error(`Failed to fetch recorded image: ${response.status} ${response.statusText}`)
      }

      // Get image as base64
      const arrayBuffer = await response.arrayBuffer()
      const base64Image = `data:image/jpeg;base64,${this.arrayBufferToBase64(arrayBuffer)}`
      return { 
        image: base64Image, 
        timestamp, 
        nextToken, 
        prevToken, 
        overlaySvg 
      }
    } catch (error) {
      console.error('[MediaService] Error fetching recorded image:', error)
      throw error
    }
  }

  /**
   * Get available field values for recorded images
   * @param {string} deviceId - The ID of the device (camera)
   * @param {Array<string>} [include] - Fields to include ('overlayId')
   * @returns {Promise<Object>} Available field values
   * @throws {Error} If the request fails
   */
  async listRecordedImageFieldValues(deviceId, include = []) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!deviceId) {
      throw new Error('Device ID is required')
    }

    try {
      const queryParams = new URLSearchParams()
      queryParams.append('deviceId', deviceId)
      
      if (include.length > 0) {
        queryParams.append('include', include.join(','))
      }
      
      const requestUrl = `${authStore.baseUrl}/api/v3.0/media/recordedImage.jpeg:listFieldValues?${queryParams.toString()}`
      
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
        throw new Error(`Failed to fetch recorded image field values: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[MediaService] Error fetching recorded image field values:', error)
      throw error
    }
  }

  /**
   * Legacy method for backward compatibility - uses the new getRecordedImage method
   * @deprecated Use getRecordedImage instead
   * @param {string} deviceId - The ID of the device (camera)
   * @param {string} timestamp - ISO 8601 timestamp for the image
   * @param {string} [type='preview'] - The type of image to fetch ('preview' or 'main')
   * @returns {Promise<{ image: string|null, timestamp: string|null, prevToken: string|null }>} Recorded image data and headers
   */
  async getRecordedImageLegacy(deviceId, timestamp, type = 'preview') {
    console.warn('[MediaService] getRecordedImageLegacy is deprecated, use getRecordedImage instead')
    
    try {
      const result = await this.getRecordedImage({
        deviceId,
        timestamp__gte: timestamp,
        type
      })
      
      // Return in legacy format for backward compatibility
      return {
        image: result.image,
        timestamp: result.timestamp,
        prevToken: result.prevToken
      }
    } catch (error) {
      console.error('[MediaService] Error in legacy recorded image method:', error)
      return { image: null, timestamp: null, prevToken: null }
    }
  }
}

// Create and export a singleton instance
export const mediaService = new MediaService()

// Export the class for testing or multiple instances if needed
export { MediaService } 