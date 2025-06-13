import { useAuthStore } from '../stores/auth'
import securityService from './security'

/**
 * Camera Service for interacting with EEN Camera APIs
 */
class CameraService {
  /**
   * Get a list of cameras
   * @param {Object} [options] - Query options
   * @param {Array<string>} [options.include] - Fields to include in response
   * @param {Array<string>} [options.sort] - Sorting options
   * @param {string} [options.pageToken] - Page token for pagination
   * @param {number} [options.pageSize] - Number of results per page
   * @param {Array<string>} [options.locationId__in] - Filter by location IDs
   * @param {Array<string>} [options.bridgeId__in] - Filter by bridge IDs
   * @param {string} [options.multiCameraId] - Filter by multi camera ID
   * @param {string} [options.multiCameraId__ne] - Filter by multi camera ID not equal
   * @param {Array<string>} [options.multiCameraId__in] - Filter by multi camera IDs
   * @param {Array<string>} [options.tags__contains] - Filter by tags (all must be present)
   * @param {Array<string>} [options.tags__any] - Filter by tags (any must be present)
   * @param {Array<string>} [options.packages__contains] - Filter by packages
   * @param {string} [options.layoutId] - Filter by layout ID
   * @param {string} [options.name__contains] - Filter by name containing substring
   * @param {Array<string>} [options.name__in] - Filter by exact names
   * @param {string} [options.name] - Filter by exact name
   * @param {Array<string>} [options.id__in] - Filter by camera IDs
   * @param {Array<string>} [options.id__notIn] - Exclude camera IDs
   * @param {string} [options.id__contains] - Filter by ID containing substring
   * @param {boolean} [options.shared] - Filter by shared status
   * @param {string} [options.sharedCameraAccount] - Filter by sharing account ID
   * @param {boolean} [options.firstResponder] - Filter by first responder sharing
   * @param {boolean} [options.directToCloud] - Filter by direct to cloud connection
   * @param {Array<string>} [options.speakerId__in] - Filter by speaker IDs
   * @param {string} [options.q] - Search query
   * @param {number} [options.qRelevance__gte] - Minimum search relevance
   * @param {Array<string>} [options.enabledAnalytics__contains] - Filter by enabled analytics
   * @param {Array<string>} [options.status__in] - Filter by status values
   * @param {string} [options.status__ne] - Filter by status not equal
   * @returns {Promise<Object>} Paginated list of cameras
   * @throws {Error} If the request fails
   */
  async listCameras(options = {}) {
    const authStore = useAuthStore()
    
    // Debug: Check auth status
    // console.log('[CameraService] Auth status:', {
    //   isAuthenticated: authStore.isAuthenticated,
    //   hasToken: !!authStore.token,
    //   baseUrl: authStore.baseUrl
    // })
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    try {
      const queryParams = new URLSearchParams()
      
      // Add include parameters if provided
      if (options.include?.length) {
        queryParams.append('include', options.include.join(','))
      }
      if (options.sort?.length) {
        queryParams.append('sort', options.sort.join(','))
      }
      if (options.pageToken) {
        queryParams.append('pageToken', options.pageToken)
      }
      if (typeof options.pageSize === 'number') {
        queryParams.append('pageSize', options.pageSize.toString())
      }

      // Add filter parameters
      if (options.locationId__in?.length) {
        queryParams.append('locationId__in', options.locationId__in.join(','))
      }
      if (options.bridgeId__in?.length) {
        queryParams.append('bridgeId__in', options.bridgeId__in.join(','))
      }
      if (options.multiCameraId) {
        queryParams.append('multiCameraId', options.multiCameraId)
      }
      if (options.multiCameraId__ne) {
        queryParams.append('multiCameraId__ne', options.multiCameraId__ne)
      }
      if (options.multiCameraId__in?.length) {
        queryParams.append('multiCameraId__in', options.multiCameraId__in.join(','))
      }
      if (options.tags__contains?.length) {
        queryParams.append('tags__contains', options.tags__contains.join(','))
      }
      if (options.tags__any?.length) {
        queryParams.append('tags__any', options.tags__any.join(','))
      }
      if (options.packages__contains?.length) {
        queryParams.append('packages__contains', options.packages__contains.join(','))
      }
      if (options.layoutId) {
        queryParams.append('layoutId', options.layoutId)
      }
      if (options.name__contains) {
        queryParams.append('name__contains', options.name__contains)
      }
      if (options.name__in?.length) {
        queryParams.append('name__in', options.name__in.join(','))
      }
      if (options.name) {
        queryParams.append('name', options.name)
      }
      if (options.id__in?.length) {
        queryParams.append('id__in', options.id__in.join(','))
      }
      if (options.id__notIn?.length) {
        queryParams.append('id__notIn', options.id__notIn.join(','))
      }
      if (options.id__contains) {
        queryParams.append('id__contains', options.id__contains)
      }
      if (typeof options.shared === 'boolean') {
        queryParams.append('shareDetails.shared', options.shared.toString())
      }
      if (options.sharedCameraAccount) {
        queryParams.append('shareDetails.accountId', options.sharedCameraAccount)
      }
      if (typeof options.firstResponder === 'boolean') {
        queryParams.append('shareDetails.firstResponder', options.firstResponder.toString())
      }
      if (typeof options.directToCloud === 'boolean') {
        queryParams.append('deviceInfo.directToCloud', options.directToCloud.toString())
      }
      if (options.speakerId__in?.length) {
        queryParams.append('speakerId__in', options.speakerId__in.join(','))
      }
      if (options.q) {
        queryParams.append('q', options.q)
      }
      if (typeof options.qRelevance__gte === 'number') {
        queryParams.append('qRelevance__gte', options.qRelevance__gte.toString())
      }
      if (options.enabledAnalytics__contains?.length) {
        queryParams.append('enabledAnalytics__contains', options.enabledAnalytics__contains.join(','))
      }
      if (options.status__in?.length) {
        queryParams.append('status__in', options.status__in.join(','))
      }
      if (options.status__ne) {
        queryParams.append('status__ne', options.status__ne)
      }
      
      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      
      // Debug: Log the request URL
      console.log('[CameraService] Request URL:', requestUrl)
      
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
        // Try to get more detailed error information
        let errorMessage = `Failed to fetch cameras: ${response.status} ${response.statusText}`
        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage += ` - ${errorData.message}`
          }
          console.error('[CameraService] Error response:', errorData)
        } catch (parseError) {
          console.error('[CameraService] Could not parse error response:', parseError)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[CameraService] Error fetching cameras:', error)
      throw error
    }
  }

  /**
   * Get camera details by ID
   * @param {string} cameraId - The ID of the camera to fetch
   * @param {Object} [options] - Query options
   * @param {Array<string>} [options.include] - Fields to include in response
   * @returns {Promise<Object>} Camera details
   * @throws {Error} If the request fails or camera is not found
   */
  async getCameraById(cameraId, options = {}) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!cameraId) {
      throw new Error('Camera ID is required')
    }

    try {
      const queryParams = new URLSearchParams()
      
      // Add include parameters if provided
      if (options.include?.length) {
        queryParams.append('include', options.include.join(','))
      }

      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras/${cameraId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      
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
        if (response.status === 404) {
          throw new Error(`Camera not found: ${cameraId}`)
        }
        throw new Error(`Failed to fetch camera: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[CameraService] Error fetching camera:', error)
      throw error
    }
  }

  /**
   * Add a new camera to the account
   * @param {Object} cameraData - Camera data for addition
   * @param {string} cameraData.registrationStrategy - How to register the camera (bridge, rtspUrl, cameraDirect, channel)
   * @param {string} [cameraData.bridgeId] - Bridge ID (required for bridge strategy)
   * @param {string} [cameraData.guid] - Camera GUID
   * @param {string} [cameraData.macAddress] - Camera MAC address
   * @param {string} [cameraData.name] - Camera name
   * @param {Object} [cameraData.rtspConnectionSettings] - RTSP settings (for rtspUrl strategy)
   * @returns {Promise<Object>} Added camera details
   * @throws {Error} If the request fails
   */
  async addCamera(cameraData) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!cameraData || !cameraData.registrationStrategy) {
      throw new Error('Camera data with registrationStrategy is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(requestUrl)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(cameraData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to add camera: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ''}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[CameraService] Error adding camera:', error)
      throw error
    }
  }

  /**
   * Update a camera
   * @param {string} cameraId - The ID of the camera to update
   * @param {Object} updateData - Camera update data
   * @returns {Promise<void>} 
   * @throws {Error} If the request fails
   */
  async updateCamera(cameraId, updateData) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!cameraId) {
      throw new Error('Camera ID is required')
    }

    if (!updateData) {
      throw new Error('Update data is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras/${cameraId}`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(requestUrl)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(requestUrl, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Camera not found: ${cameraId}`)
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to update camera: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ''}`)
      }
    } catch (error) {
      console.error('[CameraService] Error updating camera:', error)
      throw error
    }
  }

  /**
   * Delete a camera
   * @param {string} cameraId - The ID of the camera to delete
   * @returns {Promise<void>}
   * @throws {Error} If the request fails
   */
  async deleteCamera(cameraId) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!cameraId) {
      throw new Error('Camera ID is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras/${cameraId}`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(requestUrl)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(requestUrl, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Camera not found: ${cameraId}`)
        }
        throw new Error(`Failed to delete camera: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('[CameraService] Error deleting camera:', error)
      throw error
    }
  }

  /**
   * Update multiple cameras at once
   * @param {Object} bulkUpdateData - Bulk update data
   * @param {Array<string>} bulkUpdateData.cameraIds - Array of camera IDs to update
   * @param {Object} bulkUpdateData.updateFields - Fields to update on all cameras
   * @returns {Promise<Object>} Bulk update response with individual results
   * @throws {Error} If the request fails
   */
  async updateBulkCameras(bulkUpdateData) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!bulkUpdateData || !bulkUpdateData.cameraIds?.length) {
      throw new Error('Bulk update data with camera IDs is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras:bulkUpdate`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(requestUrl)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(bulkUpdateData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to bulk update cameras: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ''}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[CameraService] Error bulk updating cameras:', error)
      throw error
    }
  }

  /**
   * Get available field values for cameras (useful for filtering)
   * @param {Object} [options] - Query options
   * @param {Array<string>} [options.include] - Fields to include in response
   * @param {boolean} [options.firstResponder] - Filter by first responder sharing
   * @returns {Promise<Object>} Available field values
   * @throws {Error} If the request fails
   */
  async listCamerasFieldValues(options = {}) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    try {
      const queryParams = new URLSearchParams()
      
      if (options.include?.length) {
        queryParams.append('include', options.include.join(','))
      }
      if (typeof options.firstResponder === 'boolean') {
        queryParams.append('shareDetails.firstResponder', options.firstResponder.toString())
      }

      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras:listFieldValues${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      
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
        throw new Error(`Failed to fetch camera field values: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[CameraService] Error fetching camera field values:', error)
      throw error
    }
  }

  /**
   * Open a camera tunnel for direct access
   * @param {string} cameraId - The ID of the camera
   * @param {Object} [tunnelData] - Tunnel configuration data
   * @returns {Promise<Object>} Tunnel response with connection details
   * @throws {Error} If the request fails
   */
  async putCameraTunnel(cameraId, tunnelData = {}) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!cameraId) {
      throw new Error('Camera ID is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras/${cameraId}/tunnel`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(requestUrl)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(requestUrl, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(tunnelData)
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Camera not found: ${cameraId}`)
        }
        throw new Error(`Failed to open camera tunnel: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[CameraService] Error opening camera tunnel:', error)
      throw error
    }
  }

  /**
   * Close a camera tunnel
   * @param {string} cameraId - The ID of the camera
   * @returns {Promise<void>}
   * @throws {Error} If the request fails
   */
  async deleteCameraTunnel(cameraId) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!cameraId) {
      throw new Error('Camera ID is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras/${cameraId}/tunnel`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(requestUrl)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(requestUrl, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Camera not found: ${cameraId}`)
        }
        throw new Error(`Failed to close camera tunnel: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('[CameraService] Error closing camera tunnel:', error)
      throw error
    }
  }

  /**
   * Get camera metrics
   * @param {string} cameraId - The ID of the camera
   * @param {Object} [options] - Query options
   * @param {string} [options.timestamp__lte] - Filter metrics before this timestamp
   * @param {string} [options.timestamp__gte] - Filter metrics after this timestamp
   * @param {Array<string>} [options.target__in] - Filter by metric targets
   * @param {string} [options.period] - Aggregation period
   * @returns {Promise<Object>} Camera metrics data
   * @throws {Error} If the request fails
   */
  async getCameraMetrics(cameraId, options = {}) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!cameraId) {
      throw new Error('Camera ID is required')
    }

    try {
      const queryParams = new URLSearchParams()
      
      if (options.timestamp__lte) {
        queryParams.append('timestamp__lte', options.timestamp__lte)
      }
      if (options.timestamp__gte) {
        queryParams.append('timestamp__gte', options.timestamp__gte)
      }
      if (options.target__in?.length) {
        queryParams.append('target__in', options.target__in.join(','))
      }
      if (options.period) {
        queryParams.append('period', options.period)
      }

      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras/${cameraId}/metrics${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      
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
        if (response.status === 404) {
          throw new Error(`Camera not found: ${cameraId}`)
        }
        throw new Error(`Failed to fetch camera metrics: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[CameraService] Error fetching camera metrics:', error)
      throw error
    }
  }

  /**
   * Swap a camera with a new one
   * @param {string} cameraId - The ID of the camera to swap
   * @param {Object} swapData - Camera swap data
   * @param {string} swapData.guid - GUID of the new camera
   * @returns {Promise<void>}
   * @throws {Error} If the request fails
   */
  async swapCamera(cameraId, swapData) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!cameraId) {
      throw new Error('Camera ID is required')
    }

    if (!swapData || !swapData.guid) {
      throw new Error('Swap data with GUID is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/cameras/${cameraId}:swap`
      
      // Validate URL scheme
      if (!securityService.validateUrlScheme(requestUrl)) {
        throw new Error('Invalid request URL scheme')
      }
      
      const response = await fetch(requestUrl, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify(swapData)
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Camera not found: ${cameraId}`)
        }
        if (response.status === 409) {
          throw new Error('Camera swap conflict - GUID may already be in use or device not visible')
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to swap camera: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ''}`)
      }
    } catch (error) {
      console.error('[CameraService] Error swapping camera:', error)
      throw error
    }
  }
}

// Create and export a singleton instance
export const cameraService = new CameraService()

// Export the class for testing or multiple instances if needed
export { CameraService } 