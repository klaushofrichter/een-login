import { useAuthStore } from '../stores/auth'
import securityService from './security'

/**
 * Measurements Service for interacting with EEN Measurements APIs
 */
class MeasurementsService {
  /**
   * Get measurement details by ID
   * @param {string} measurementId - The ID of the measurement to fetch
   * @param {Array<string>} [include] - Optional array of fields to include (measurementProperties, lastSample, measurementThreshold, locationSummary, sensorSummary)
   * @returns {Promise<Object>} Measurement details
   * @throws {Error} If the request fails or measurement is not found
   */
  async getMeasurementById(measurementId, include = []) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!measurementId) {
      throw new Error('Measurement ID is required')
    }

    try {
      let requestUrl = `${authStore.baseUrl}/api/v3.0/measurements/${measurementId}`
      
      // Add include parameters if provided
      if (include.length > 0) {
        const includeParam = include.join(',')
        requestUrl += `?include=${encodeURIComponent(includeParam)}`
      }
      
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
          throw new Error(`Measurement not found: ${measurementId}`)
        }
        throw new Error(`Failed to fetch measurement: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[MeasurementsService] Error fetching measurement:', error)
      throw error
    }
  }

  /**
   * Get a list of measurements
   * @param {Object} [options] - Query options
   * @param {Array<string>} [options.parentId__in] - List of Parent IDs to filter on
   * @param {Array<string>} [options.locationId__in] - List of Location IDs to filter on
   * @param {Array<string>} [options.cameraId__in] - List of Camera IDs to filter on
   * @param {Array<string>} [options.id__in] - List of Measurement IDs to filter on
   * @param {boolean} [options.preferred] - Filter by preferred measurements
   * @param {string} [options.propertyType] - Filter by property type
   * @param {string} [options.thresholdLevel] - Filter by threshold level
   * @param {string} [options.q] - Text search query
   * @param {number} [options.qRelevance__gte] - Minimum similarity threshold for text search (0-1)
   * @param {Array<string>} [options.include] - Fields to include in response (measurementProperties, lastSample, measurementThreshold, locationSummary, sensorSummary, qRelevance)
   * @param {Array<string>} [options.sort] - Sorting options (e.g., ['+name', '-qRelevance', '+propertyType'])
   * @param {string} [options.pageToken] - Page token for pagination
   * @param {number} [options.pageSize] - Number of results per page
   * @returns {Promise<Object>} Paginated list of measurements
   * @throws {Error} If the request fails
   */
  async listMeasurements(options = {}) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    try {
      const queryParams = new URLSearchParams()
      
      // Add array parameters
      if (options.parentId__in?.length) {
        queryParams.append('parentId__in', options.parentId__in.join(','))
      }
      if (options.locationId__in?.length) {
        queryParams.append('locationId__in', options.locationId__in.join(','))
      }
      if (options.cameraId__in?.length) {
        queryParams.append('cameraId__in', options.cameraId__in.join(','))
      }
      if (options.id__in?.length) {
        queryParams.append('id__in', options.id__in.join(','))
      }
      if (options.include?.length) {
        queryParams.append('include', options.include.join(','))
      }
      if (options.sort?.length) {
        queryParams.append('sort', options.sort.join(','))
      }
      
      // Add boolean/string/number parameters
      if (typeof options.preferred === 'boolean') {
        queryParams.append('preferred', options.preferred.toString())
      }
      if (options.propertyType) {
        queryParams.append('propertyType', options.propertyType)
      }
      if (options.thresholdLevel) {
        queryParams.append('thresholdLevel', options.thresholdLevel)
      }
      if (options.q) {
        queryParams.append('q', options.q)
      }
      if (typeof options.qRelevance__gte === 'number') {
        queryParams.append('qRelevance__gte', options.qRelevance__gte.toString())
      }
      if (options.pageToken) {
        queryParams.append('pageToken', options.pageToken)
      }
      if (typeof options.pageSize === 'number') {
        queryParams.append('pageSize', options.pageSize.toString())
      }
      
      const requestUrl = `${authStore.baseUrl}/api/v3.0/measurements${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      
      // Log the exact request URL for debugging
      console.log('[MeasurementsService] Request URL:', requestUrl)
      console.log('[MeasurementsService] Query params:', Object.fromEntries(queryParams))
      
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
        throw new Error(`Failed to fetch measurements: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[MeasurementsService] Error fetching measurements:', error)
      throw error
    }
  }

  /**
   * Update an existing measurement
   * @param {string} measurementId - The ID of the measurement to update
   * @param {Object} updateData - Update data
   * @param {string} [updateData.name] - New name
   * @param {string} [updateData.notes] - New notes
   * @param {boolean} [updateData.preferred] - New preferred status
   * @param {string} [updateData.primaryCameraId] - New primary camera ID
   * @param {Object} [updateData.measurementProperties] - New measurement properties
   * @returns {Promise<void>}
   * @throws {Error} If the request fails
   */
  async updateMeasurement(measurementId, updateData) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!measurementId) {
      throw new Error('Measurement ID is required')
    }

    if (!updateData) {
      throw new Error('Update data is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/measurements/${measurementId}`
      
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
          throw new Error(`Measurement not found: ${measurementId}`)
        }
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to update measurement: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ''}`)
      }
    } catch (error) {
      console.error('[MeasurementsService] Error updating measurement:', error)
      throw error
    }
  }

  /**
   * Get available field values for measurements (useful for filtering)
   * @param {Object} [options] - Query options
   * @param {Array<string>} [options.include] - Fields to include in response (location)
   * @param {boolean} [options.preferred] - Filter by preferred measurements
   * @returns {Promise<Object>} Available field values
   * @throws {Error} If the request fails
   */
  async listMeasurementsFieldValues(options = {}) {
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
      if (typeof options.preferred === 'boolean') {
        queryParams.append('preferred', options.preferred.toString())
      }

      const requestUrl = `${authStore.baseUrl}/api/v3.0/measurements:listFieldValues${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      
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
        throw new Error(`Failed to fetch measurement field values: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[MeasurementsService] Error fetching measurement field values:', error)
      throw error
    }
  }

  /**
   * Post sensor threshold event (internal endpoint)
   * @param {Object} eventData - Sensor threshold event data
   * @returns {Promise<void>}
   * @throws {Error} If the request fails
   */
  async postSensorThresholdEvent(eventData) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!eventData) {
      throw new Error('Event data is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/sensorEvents`
      
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
        body: JSON.stringify(eventData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to post sensor threshold event: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ''}`)
      }
    } catch (error) {
      console.error('[MeasurementsService] Error posting sensor threshold event:', error)
      throw error
    }
  }
}

// Export a singleton instance
export const measurementsService = new MeasurementsService() 