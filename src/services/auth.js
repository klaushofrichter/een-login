import { useAuthStore } from '../stores/auth'
// Remove createAuthApi import if no longer used elsewhere in this file
// import { createAuthApi } from './api'

const CLIENT_ID = import.meta.env.VITE_EEN_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://127.0.0.1:3333'
const EEN_AUTH_URL =
  import.meta.env.VITE_EEN_AUTH_URL || 'https://auth.eagleeyenetworks.com/oauth2/authorize'

// Determine proxy URL, defaulting to local Vite server if VITE_AUTH_PROXY_URL is not set
const AUTH_PROXY_URL = import.meta.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333'

//console.log(`[auth.js] Using ${REDIRECT_URI} for the redirect URI and ${CLIENT_ID} for the client ID`)

export const getAuthUrl = () => {
  //console.log(`[auth.js] Using ${REDIRECT_URI} for the redirect URI`)
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'vms.all'
  })
  const url = `${EEN_AUTH_URL}?${params.toString()}`
  return url
}

async function getAccessToken(code) {
  const tokenParams = new URLSearchParams({
    code: code,
    redirect_uri: REDIRECT_URI
  })

  // Construct path based on whether we target the local proxy or remote
  const relativePath = '/proxy/getAccessToken'
  const requestUrl = `${AUTH_PROXY_URL}${relativePath}?${tokenParams.toString()}`

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include'
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Failed to get access token: ${response.status} ${errorText || response.statusText}`
      )
    }
    const data = await response.json()

    return {
      token: data.accessToken,
      expiresIn: data.expiresIn,
      httpsBaseUrl: data.httpsBaseUrl
    }
  } catch (error) {
    console.error('[auth.js] getAccessToken fetch error:', error)
    // Rethrow a more specific error if needed, or the original
    throw new Error(`Failed to get access token: ${error.message || error}`)
  }
}

export const handleAuthCallback = async code => {
  try {
    const { token, expiresIn, httpsBaseUrl } = await getAccessToken(code)
    const authStore = useAuthStore()
    authStore.setToken(token, expiresIn)
    authStore.setBaseUrl(httpsBaseUrl)
    authStore.setRefreshToken('present')
    return { token, httpsBaseUrl }
  } catch (error) {
    console.error('Authentication error:', error)
    throw error
  }
}

export const refreshToken = async () => {
  const authStore = useAuthStore()
  const refreshTokenMarker = authStore.refreshToken

  if (!refreshTokenMarker) {
    console.log('[auth.js] Missing refresh token marker for refresh.')
    return false
  }

  // Construct path based on proxy target
  const relativePath = '/proxy/refreshAccessToken'
  const requestUrl = `${AUTH_PROXY_URL}${relativePath}`
  //console.log(`[auth.js] Fetching: ${requestUrl}`)

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include'
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(
        `Token refresh failed: ${response.status} ${errorText || response.statusText}`
      )
    }

    const data = await response.json()

    if (!data.accessToken || !data.expiresIn) {
      console.error('[auth.js] Invalid response data from refresh call:', data)
      return false
    }

    authStore.setToken(data.accessToken, data.expiresIn)
    authStore.setRefreshToken('present after refresh')
    return true
  } catch (error) {
    console.error('[auth.js] refreshToken fetch error:', error)
    return false
  }
}
