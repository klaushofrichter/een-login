import { useAuthStore } from '../stores/auth'
import securityService from './security'

/**
 * Sensor Service for interacting with EEN Sensor Device APIs
 */
class SensorService {
  /**
   * Get sensor device details by ID
   * @param {string} sensorDeviceId - The ID of the sensor device to fetch
   * @param {Array<string>} [include] - Optional array of fields to include (status, timeZone, notes, deviceInfo, sampler, battery, bluetooth, locationSummary, gatewaySummary)
   * @returns {Promise<Object>} Sensor device details
   * @throws {Error} If the request fails or sensor device is not found
   */
  async getSensorDeviceById(sensorDeviceId, include = []) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!sensorDeviceId) {
      throw new Error('Sensor Device ID is required')
    }

    try {
      let requestUrl = `${authStore.baseUrl}/api/v3.0/sensorDevices/${sensorDeviceId}`
      
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
          throw new Error(`Sensor device not found: ${sensorDeviceId}`)
        }
        throw new Error(`Failed to fetch sensor device: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[SensorService] Error fetching sensor device:', error)
      throw error
    }
  }

  /**
   * Get a list of sensor devices
   * @param {Object} [options] - Query options
   * @param {Array<string>} [options.locationId__in] - List of Location IDs to filter on
   * @param {Array<string>} [options.parentId__in] - List of Parent IDs to filter on
   * @param {Array<string>} [options.propertyType__in] - List of property types to filter on
   * @param {Array<string>} [options.thresholdLevel__in] - List of threshold levels to filter on
   * @param {Array<string>} [options.cameraId__in] - List of Camera IDs to filter on
   * @param {Array<string>} [options.id__in] - List of Sensor Device IDs to filter on
   * @param {string} [options.q] - Text search query
   * @param {number} [options.qRelevance__gte] - Minimum similarity threshold for text search (0-1)
   * @param {Array<string>} [options.include] - Fields to include in response
   * @param {Array<string>} [options.sort] - Sorting options (e.g., ['+name', '-qRelevance'])
   * @param {string} [options.pageToken] - Page token for pagination
   * @param {number} [options.pageSize] - Number of results per page
   * @returns {Promise<Object>} Paginated list of sensor devices
   * @throws {Error} If the request fails
   */
  async listSensorDevices(options = {}) {
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
      if (options.locationId__in?.length) {
        queryParams.append('locationId__in', options.locationId__in.join(','))
      }
      if (options.parentId__in?.length) {
        queryParams.append('parentId__in', options.parentId__in.join(','))
      }
      if (options.propertyType__in?.length) {
        queryParams.append('propertyType__in', options.propertyType__in.join(','))
      }
      if (options.thresholdLevel__in?.length) {
        queryParams.append('thresholdLevel__in', options.thresholdLevel__in.join(','))
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
      
      // Add string/number parameters
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
      
      const requestUrl = `${authStore.baseUrl}/api/v3.0/sensorDevices${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      
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
        throw new Error(`Failed to fetch sensor devices: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[SensorService] Error fetching sensor devices:', error)
      throw error
    }
  }

  /**
   * Add a new sensor device
   * @param {Object} sensorDeviceData - The sensor device data to create
   * @param {string} sensorDeviceData.name - The name of the sensor device
   * @param {string} sensorDeviceData.guid - The GUID of the sensor device
   * @param {string} [sensorDeviceData.locationId] - The location ID
   * @param {string} [sensorDeviceData.primaryCameraId] - The primary camera ID
   * @param {string} [sensorDeviceData.notes] - Notes about the sensor device
   * @returns {Promise<Object>} Created sensor device details
   * @throws {Error} If the request fails
   */
  async addSensorDevice(sensorDeviceData) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!sensorDeviceData || !sensorDeviceData.name || !sensorDeviceData.guid) {
      throw new Error('Sensor device name and GUID are required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/sensorDevices`
      
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
        body: JSON.stringify(sensorDeviceData)
      })

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('Sensor device already exists or conflict occurred')
        }
        throw new Error(`Failed to add sensor device: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('[SensorService] Error adding sensor device:', error)
      throw error
    }
  }

  /**
   * Update a sensor device
   * @param {string} sensorDeviceId - The ID of the sensor device to update
   * @param {Object} updateData - The data to update
   * @param {string} [updateData.name] - The name of the sensor device
   * @param {string} [updateData.locationId] - The location ID
   * @param {string} [updateData.primaryCameraId] - The primary camera ID
   * @param {string} [updateData.notes] - Notes about the sensor device
   * @returns {Promise<void>} Resolves when update is complete
   * @throws {Error} If the request fails
   */
  async updateSensorDevice(sensorDeviceId, updateData) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!sensorDeviceId) {
      throw new Error('Sensor Device ID is required')
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error('Update data is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/sensorDevices/${sensorDeviceId}`
      
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
          throw new Error(`Sensor device not found: ${sensorDeviceId}`)
        }
        throw new Error(`Failed to update sensor device: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('[SensorService] Error updating sensor device:', error)
      throw error
    }
  }

  /**
   * Delete a sensor device
   * @param {string} sensorDeviceId - The ID of the sensor device to delete
   * @returns {Promise<void>} Resolves when deletion is complete
   * @throws {Error} If the request fails
   */
  async deleteSensorDevice(sensorDeviceId) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Authentication required')
    }

    if (!authStore.baseUrl) {
      throw new Error('EEN base URL not configured')
    }

    if (!sensorDeviceId) {
      throw new Error('Sensor Device ID is required')
    }

    try {
      const requestUrl = `${authStore.baseUrl}/api/v3.0/sensorDevices/${sensorDeviceId}`
      
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
          throw new Error(`Sensor device not found: ${sensorDeviceId}`)
        }
        throw new Error(`Failed to delete sensor device: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error('[SensorService] Error deleting sensor device:', error)
      throw error
    }
  }
}

// Create and export a singleton instance
export const sensorService = new SensorService()

// Export the class for testing or multiple instances if needed
export { SensorService } 