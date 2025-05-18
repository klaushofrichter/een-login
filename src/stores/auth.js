import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import router from '@/router' // Import the router instance

export const useAuthStore = defineStore('auth', () => {
  const token = ref(null)
  const user = ref(null)
  const hostname = ref(null)
  const port = ref(null)
  const userProfile = ref(null)
  const tokenExpiration = ref(null)
  const refreshToken = ref(null)
  const isAuthenticated = computed(() => !!token.value)
  const baseUrl = computed(() => {
    if (!hostname.value) return null
    return `https://${hostname.value}${port.value ? `:${port.value}` : ''}`
  })

  function setToken(newToken, expiresIn) {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('auth_token', newToken)
      // Set expiration time based on expires_in value
      const expirationTime = Date.now() + expiresIn * 1000 // Convert seconds to milliseconds
      tokenExpiration.value = expirationTime
      localStorage.setItem('token_expiration', expirationTime.toString())
    } else {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('token_expiration')
      tokenExpiration.value = null
    }
  }

  function setRefreshToken(newRefreshToken) {
    // this is not the actual token, but an indication that the refresh token is present at the proxy
    refreshToken.value = newRefreshToken
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken)
    } else {
      localStorage.removeItem('refresh_token')
    }
  }

  function setBaseUrl(urlData) {
    if (urlData && typeof urlData === 'object') {
      hostname.value = urlData.hostname
      port.value = urlData.port
      localStorage.setItem('hostname', urlData.hostname)
      if (urlData.port) {
        localStorage.setItem('port', String(urlData.port))
      } else {
        localStorage.removeItem('port')
      }
    } else {
      hostname.value = null
      port.value = null
      localStorage.removeItem('hostname')
      localStorage.removeItem('port')
    }
  }

  function setUser(userData) {
    user.value = userData
    if (userData) {
      localStorage.setItem('user_data', JSON.stringify(userData))
    } else {
      localStorage.removeItem('user_data')
    }
  }

  function setUserProfile(profile) {
    userProfile.value = profile
  }

  // Temporary storage for credentials during logout
  let tempCredentials = null
  let logoutInterval = null

  function initialize() {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data')
    const storedHostname = localStorage.getItem('hostname')
    const storedPort = localStorage.getItem('port')
    const storedExpiration = localStorage.getItem('token_expiration')
    const storedRefreshToken = localStorage.getItem('refresh_token')

    if (storedToken) {
      token.value = storedToken
    }
    if (storedUser) {
      user.value = JSON.parse(storedUser)
    }
    if (storedHostname) {
      hostname.value = storedHostname
      if (storedPort) {
        port.value = Number(storedPort)
      }
    }
    if (storedExpiration) {
      tokenExpiration.value = Number(storedExpiration)
    }
    if (storedRefreshToken) {
      refreshToken.value = storedRefreshToken
    }
  }

  function getTokenExpirationTime() {
    if (!tokenExpiration.value) return null
    return tokenExpiration.value
  }

  function getTokenTimeRemaining() {
    if (!tokenExpiration.value) return null
    const remaining = tokenExpiration.value - Date.now()
    return Math.max(0, remaining)
  }

  async function revokeToken() {
    // Only call revoke if we have a token expiration (indicating we have a refresh token)
    //if (!tokenExpiration.value) {
    //  console.log('Skipping token revocation - no expiration time set (direct login)')
    //  return
    //}
    // Determine proxy URL, defaulting to local Vite server if VITE_AUTH_PROXY_URL is not set
    const AUTH_PROXY_URL = import.meta.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333'

    // Construct path based on whether we target the local proxy or remote
    const relativePath = '/proxy/revoke'
    const requestUrl = `${AUTH_PROXY_URL}${relativePath}`
    //console.log(`[auth.js] Fetching: ${requestUrl}`)

    try {
      const response = await fetch(requestUrl, {
        method: 'POST',
        credentials: 'include' // Important for sending the sessionId cookie
      })

      if (!response.ok) {
        console.error('Failed to revoke token:', response.status)
      }
    } catch (error) {
      console.error('Error revoking token:', error)
    }
  }

  async function logout(onDelay) {
    // Store current credentials temporarily
    tempCredentials = {
      token: token.value,
      tokenExpiration: tokenExpiration.value,
      user: user.value,
      hostname: hostname.value,
      port: port.value,
      userProfile: userProfile.value,
      refreshToken: refreshToken.value
    }
    //console.log('tempCredentials', tempCredentials)

    // Clear store values
    token.value = null
    user.value = null
    hostname.value = null
    port.value = null
    userProfile.value = null
    tokenExpiration.value = null
    refreshToken.value = null

    // Clear all localStorage items synchronously
    localStorage.clear()

    // Wait eight seconds ONLY if onDelay callback is provided
    if (onDelay) {
      await new Promise(resolve => {
        const startTime = Date.now()
        logoutInterval = setInterval(() => {
          const elapsed = Date.now() - startTime
          const remaining = Math.max(0, 8000 - elapsed)
          onDelay(remaining)
          if (remaining === 0) {
            clearInterval(logoutInterval)
            logoutInterval = null
            resolve()
          }
        }, 50)
      })
    } // No else block needed - if onDelay is not passed, skip the wait

    // Only call revoke if we have a token expiration (indicating we have a refresh token)
    if (tempCredentials.tokenExpiration) {
      try {
        console.log('revoking token')
        await revokeToken()
      } catch (error) {
        // Clear temporary credentials even if the revoke fails
        tempCredentials = null
        console.error('Error revoking token:', error)
      }
    } else {
      console.log('no token expiration, skipping revoke')
    }

    // Clear temporary credentials after successful logout (or immediate if no delay)
    tempCredentials = null

    // Use router.push for navigation to respect base path
    router.push('/')
  }

  function cancelLogout() {
    console.log('cancelling logout')
    if (tempCredentials) {
      // Clear the interval if it exists
      if (logoutInterval) {
        clearInterval(logoutInterval)
        logoutInterval = null
      }

      // Restore store values
      console.log('restoring store values')
      token.value = tempCredentials.token
      user.value = tempCredentials.user
      hostname.value = tempCredentials.hostname
      port.value = tempCredentials.port
      userProfile.value = tempCredentials.userProfile
      refreshToken.value = tempCredentials.refreshToken
      tokenExpiration.value = tempCredentials.tokenExpiration
      // Restore localStorage
      if (token.value) localStorage.setItem('auth_token', token.value)
      if (user.value) localStorage.setItem('user_data', JSON.stringify(user.value))
      if (hostname.value) localStorage.setItem('hostname', hostname.value)
      if (port.value) localStorage.setItem('port', String(port.value))
      if (refreshToken.value) localStorage.setItem('refresh_token', refreshToken.value)
      if (tokenExpiration.value) localStorage.setItem('token_expiration', tokenExpiration.value.toString())

      // Clear temporary credentials
      tempCredentials = null
    }
  }

  // Initialize the store
  initialize()

  return {
    token,
    user,
    hostname,
    port,
    userProfile,
    tokenExpiration,
    refreshToken,
    isAuthenticated,
    baseUrl,
    setToken,
    setBaseUrl,
    setUser,
    setUserProfile,
    setRefreshToken,
    initialize,
    getTokenExpirationTime,
    getTokenTimeRemaining,
    logout,
    cancelLogout,
    revokeToken
  }
})
