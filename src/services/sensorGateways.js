import { useAuthStore } from '../stores/auth'
import securityService from './security'

/**
 * Service for managing sensor gateways
 */
export const sensorGatewayService = {
  /**
   * List all sensor gateways visible to the current user
   * @param {Object} options - Query parameters
   * @param {string[]} [options.locationId__in] - List of Location IDs to filter on
   * @param {string[]} [options.id__in] - List of Sensor Gateway IDs to filter on
   * @param {string} [options.q] - Text search query
   * @param {number} [options.qRelevance__gte] - Minimum similarity threshold (0-1)
   * @param {string[]} [options.include] - Fields to include in response
   * @param {string[]} [options.sort] - Sort fields
   * @param {string} [options.pageToken] - Pagination token
   * @param {number} [options.pageSize] - Number of items per page
   * @returns {Promise<Object>} Paginated response with sensor gateways
   */
  async listSensorGateways(options = {}) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) throw new Error('Authentication required')
    if (!authStore.baseUrl) throw new Error('EEN base URL not configured')

    const queryParams = new URLSearchParams()
    if (options.locationId__in?.length) queryParams.append('locationId__in', options.locationId__in.join(','))
    if (options.id__in?.length) queryParams.append('id__in', options.id__in.join(','))
    if (options.q) queryParams.append('q', options.q)
    if (typeof options.qRelevance__gte === 'number') queryParams.append('qRelevance__gte', options.qRelevance__gte.toString())
    if (options.include?.length) queryParams.append('include', options.include.join(','))
    if (options.sort?.length) queryParams.append('sort', options.sort.join(','))
    if (options.pageToken) queryParams.append('pageToken', options.pageToken)
    if (typeof options.pageSize === 'number') queryParams.append('pageSize', options.pageSize.toString())

    const requestUrl = `${authStore.baseUrl}/api/v3.0/sensorGateways${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    if (!securityService.validateUrlScheme(requestUrl)) throw new Error('Invalid request URL scheme')

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      let errorMessage = `Failed to fetch sensor gateways: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.message) errorMessage += ` - ${errorData.message}`
      } catch {}
      throw new Error(errorMessage)
    }
    return await response.json()
  },

  /**
   * Get a specific sensor gateway by ID
   * @param {string} sensorGatewayId - The ID of the sensor gateway
   * @param {string[]} [include] - Fields to include in response
   * @returns {Promise<Object>} Sensor gateway details
   */
  async getSensorGateway(sensorGatewayId, include = []) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) throw new Error('Authentication required')
    if (!authStore.baseUrl) throw new Error('EEN base URL not configured')
    if (!sensorGatewayId) throw new Error('Sensor Gateway ID is required')

    let requestUrl = `${authStore.baseUrl}/api/v3.0/sensorGateways/${sensorGatewayId}`
    if (include.length > 0) requestUrl += `?include=${encodeURIComponent(include.join(','))}`
    if (!securityService.validateUrlScheme(requestUrl)) throw new Error('Invalid request URL scheme')

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      if (response.status === 404) throw new Error(`Sensor gateway not found: ${sensorGatewayId}`)
      throw new Error(`Failed to fetch sensor gateway: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  },

  /**
   * Create a new sensor gateway
   * @param {Object} data - Sensor gateway creation data
   * @param {string} data.name - Name of the sensor gateway
   * @param {string} data.connectId - Connect ID for the sensor gateway
   * @param {string} [data.locationId] - Optional location ID
   * @returns {Promise<Object>} Created sensor gateway
   */
  async createSensorGateway(data) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) throw new Error('Authentication required')
    if (!authStore.baseUrl) throw new Error('EEN base URL not configured')

    const requestUrl = `${authStore.baseUrl}/api/v3.0/sensorGateways`
    if (!securityService.validateUrlScheme(requestUrl)) throw new Error('Invalid request URL scheme')

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to create sensor gateway: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ''}`)
    }
    return await response.json()
  },

  /**
   * Update an existing sensor gateway
   * @param {string} sensorGatewayId - The ID of the sensor gateway to update
   * @param {Object} data - Update data
   * @param {string} [data.name] - New name
   * @param {string} [data.notes] - New notes
   * @param {string} [data.locationId] - New location ID
   * @param {Object} [data.timeZone] - New timezone settings
   * @returns {Promise<void>}
   */
  async updateSensorGateway(sensorGatewayId, data) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) throw new Error('Authentication required')
    if (!authStore.baseUrl) throw new Error('EEN base URL not configured')
    if (!sensorGatewayId) throw new Error('Sensor Gateway ID is required')

    const requestUrl = `${authStore.baseUrl}/api/v3.0/sensorGateways/${sensorGatewayId}`
    if (!securityService.validateUrlScheme(requestUrl)) throw new Error('Invalid request URL scheme')

    const response = await fetch(requestUrl, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      if (response.status === 404) throw new Error(`Sensor gateway not found: ${sensorGatewayId}`)
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`Failed to update sensor gateway: ${response.status} ${response.statusText}${errorData.message ? ` - ${errorData.message}` : ''}`)
    }
  },

  /**
   * Delete a sensor gateway
   * @param {string} sensorGatewayId - The ID of the sensor gateway to delete
   * @returns {Promise<void>}
   */
  async deleteSensorGateway(sensorGatewayId) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) throw new Error('Authentication required')
    if (!authStore.baseUrl) throw new Error('EEN base URL not configured')
    if (!sensorGatewayId) throw new Error('Sensor Gateway ID is required')

    const requestUrl = `${authStore.baseUrl}/api/v3.0/sensorGateways/${sensorGatewayId}`
    if (!securityService.validateUrlScheme(requestUrl)) throw new Error('Invalid request URL scheme')

    const response = await fetch(requestUrl, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      if (response.status === 404) throw new Error(`Sensor gateway not found: ${sensorGatewayId}`)
      throw new Error(`Failed to delete sensor gateway: ${response.status} ${response.statusText}`)
    }
  }
} 