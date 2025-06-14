import { useAuthStore } from '../stores/auth'
import securityService from './security'

/**
 * Service for retrieving sensor summaries
 */
export const sensorSummaryService = {
  /**
   * List all sensor summaries visible to the current user
   * @param {Object} [options] - Query parameters
   * @param {boolean} [options.preferred] - If true, only preferred measurements are returned. If false, only non-preferred. If omitted, all are returned.
   * @returns {Promise<Object>} Paginated response with sensor summaries
   */
  async listSensorSummary(options = {}) {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) throw new Error('Authentication required')
    if (!authStore.baseUrl) throw new Error('EEN base URL not configured')

    const queryParams = new URLSearchParams()
    if (typeof options.preferred === 'boolean') {
      queryParams.append('preferred', options.preferred.toString())
    }

    const requestUrl = `${authStore.baseUrl}/api/v3.0/sensorSummary${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    if (!securityService.validateUrlScheme(requestUrl)) throw new Error('Invalid request URL scheme')

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      }
    })

    if (!response.ok) {
      let errorMessage = `Failed to fetch sensor summary: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.message) errorMessage += ` - ${errorData.message}`
      } catch {}
      throw new Error(errorMessage)
    }
    return await response.json()
  }
} 