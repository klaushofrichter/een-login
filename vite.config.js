import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import process from 'process'
import fetch from 'node-fetch' // Need node-fetch for server-side requests
import { parse } from 'node:querystring' // To parse query strings
import { randomBytes } from 'node:crypto' // For session ID generation
import { Buffer } from 'buffer'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import pkg from './package.json'

// Define the proxy plugin
const localOauthProxy = env => {
  const sessions = new Map() // In-memory store for refresh tokens, keyed by sessionId

  // Helper to generate a session ID
  const generateSessionId = () => randomBytes(16).toString('hex')

  // Helper to handle /getAccessToken
  const handleGetAccessToken = async (req, res /*, next */) => {
    // console.log('[Vite Plugin] Intercepted /proxy/getAccessToken'); // DEBUG
    const code = parse(req.url.split('?')[1] || '').code
    const redirectUri =
      parse(req.url.split('?')[1] || '').redirect_uri ||
      env.VITE_REDIRECT_URI ||
      'http://127.0.0.1:3333'

    if (!code) {
      console.error('[Vite Plugin] Missing code parameter')
      res.statusCode = 400
      return res.end('Missing code parameter')
    }

    const tokenUrl = env.VITE_EEN_TOKEN_URL || 'https://auth.eagleeyenetworks.com/oauth2/token'
    const clientId = env.VITE_EEN_CLIENT_ID // Make sure this is in your .env
    const clientSecret = env.VITE_EEN_CLIENT_SECRET // Make sure this is in your .env

    if (!clientSecret) {
      console.error('[Vite Plugin] Missing VITE_EEN_CLIENT_SECRET in .env')
      res.statusCode = 500
      return res.end('Server configuration error: Missing client secret.')
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret
    })

    // console.log(`[Vite Plugin] Calling EEN Token URL: ${tokenUrl}`); // DEBUG
    // console.log(`[Vite Plugin] With Body Params: grant_type=authorization_code, code=${code}, redirect_uri=${redirectUri}, client_id=${clientId}, client_secret=[PRESENT]`); // DEBUG

    try {
      const eenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      })

      const responseBodyText = await eenResponse.text() // Read as text first for debugging

      if (!eenResponse.ok) {
        console.error(`[Vite Plugin] EEN Token Error ${eenResponse.status}:`, responseBodyText)
        res.statusCode = eenResponse.status
        return res.end(`EEN Token Error: ${responseBodyText}`)
      }

      const data = JSON.parse(responseBodyText) // Parse JSON only if response is OK

      if (data.refresh_token) {
        const sessionId = generateSessionId()
        sessions.set(sessionId, data.refresh_token)
        //console.log(`[Vite Plugin] Stored refresh token for session: ${sessionId}`); // DEBUG

        // Set the cookie
        res.setHeader('Set-Cookie', `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Lax`)

        // Respond to the client
        res.setHeader('Content-Type', 'application/json')
        res.statusCode = 200
        res.end(
          JSON.stringify({
            accessToken: data.access_token,
            expiresIn: data.expires_in,
            httpsBaseUrl: data.httpsBaseUrl
          })
        )
      } else {
        console.error('[Vite Plugin] No refresh token received from EEN')
        res.statusCode = 500
        res.end('Failed to obtain refresh token from EEN.')
      }
    } catch (error) {
      console.error('[Vite Plugin] Error fetching access token:', error)
      res.statusCode = 500
      res.end(`Server error: ${error.message}`)
    }
  }

  // Helper to handle /refreshAccessToken
  const handleRefreshAccessToken = async (req, res /*, next */) => {
    // console.log('[Vite Plugin] Intercepted /proxy/refreshAccessToken'); // DEBUG
    // Remove the following line as 'queryParams' is unused
    // const queryParams = parse(req.url.split('?')[1] || '')

    // Try to get sessionId from cookie
    let sessionId = req.headers.cookie
      ?.split('; ')
      .find(cookie => cookie.startsWith('sessionId='))
      ?.split('=')[1]

    if (!sessionId) {
      console.error('[Vite Plugin] Missing sessionId for refresh')
      res.statusCode = 400
      return res.end('Missing sessionId parameter')
    }

    const refreshToken = sessions.get(sessionId)

    if (!refreshToken) {
      console.error(`[Vite Plugin] No refresh token found for session: ${sessionId}`)
      res.statusCode = 401 // Unauthorized or session expired
      return res.end('Invalid or expired session.')
    }

    const tokenUrl = env.VITE_EEN_TOKEN_URL || 'https://auth.eagleeyenetworks.com/oauth2/token'
    const clientId = env.VITE_EEN_CLIENT_ID
    const clientSecret = env.VITE_EEN_CLIENT_SECRET

    if (!clientSecret) {
      console.error('[Vite Plugin] Missing VITE_EEN_CLIENT_SECRET in .env')
      res.statusCode = 500
      return res.end('Server configuration error: Missing client secret.')
    }

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    })

    try {
      const eenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      })

      const responseBodyText = await eenResponse.text() // Read as text first

      if (!eenResponse.ok) {
        console.error(`[Vite Plugin] EEN Refresh Error ${eenResponse.status}:`, responseBodyText)
        // If refresh fails (e.g., invalid_grant), remove the session
        if (eenResponse.status === 400 || eenResponse.status === 401) {
          sessions.delete(sessionId)
          console.log(`[Vite Plugin] Deleted session due to refresh failure: ${sessionId}`)
        }
        res.statusCode = eenResponse.status
        return res.end(`EEN Refresh Error: ${responseBodyText}`)
      }

      const data = JSON.parse(responseBodyText) // Parse JSON only if OK

      // --- Handle Refresh Token Rotation ---
      // Check if EEN returned a new refresh token
      if (data.refresh_token) {
        // Update the session with the new refresh token
        sessions.set(sessionId, data.refresh_token)
        // console.log(`[Vite Plugin] Updated refresh token for session: ${sessionId}`); // DEBUG
      } else {
        // If no new refresh token is provided, the old one might still be valid (depending on provider)
        // For EEN, it's likely rotated, but we log just in case.
        // console.log(`[Vite Plugin] No new refresh token received for session: ${sessionId}. Keeping existing one.`); // DEBUG
      }
      // --- End Handle Refresh Token Rotation ---

      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(
        JSON.stringify({
          accessToken: data.access_token,
          expiresIn: data.expires_in
        })
      )
    } catch (error) {
      console.error('[Vite Plugin] Error refreshing token:', error)
      res.statusCode = 500
      res.end(`Server error: ${error.message}`)
    }
  }

  // Helper to handle /revoke
  const handleRevoke = async (req, res /*, next */) => {
    //console.log('[Vite Plugin] Intercepted /proxy/revoke') // DEBUG

    // Try to get sessionId from cookie
    let sessionId = req.headers.cookie
      ?.split('; ')
      .find(cookie => cookie.startsWith('sessionId='))
      ?.split('=')[1]

    if (!sessionId) {
      console.error('[Vite Plugin] Missing sessionId for revoke')
      res.statusCode = 400
      return res.end('Missing sessionId parameter')
    }

    const refreshToken = sessions.get(sessionId)
    //console.log('[Vite Plugin] Revoking token for session:', sessionId)

    if (!refreshToken) {
      console.error(`[Vite Plugin] No refresh token found for session: ${sessionId}`)
      res.statusCode = 401 // Unauthorized or session expired
      return res.end('Invalid or expired session.')
    }

    const revokeUrl =
      env.VITE_EEN_TOKEN_URL?.replace('/token', '/revoke') ||
      'https://auth.eagleeyenetworks.com/oauth2/revoke'
    const clientId = env.VITE_EEN_CLIENT_ID
    const clientSecret = env.VITE_EEN_CLIENT_SECRET

    if (!clientSecret) {
      console.error('[Vite Plugin] Missing VITE_EEN_CLIENT_SECRET in .env')
      res.statusCode = 500
      return res.end('Server configuration error: Missing client secret.')
    }

    // Create Basic Auth header
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    try {
      //console.log('[Vite Plugin] Revoking token for session:', sessionId)
      const eenResponse = await fetch(revokeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${auth}`
        },
        body: new URLSearchParams({
          token: refreshToken
        }).toString()
      })

      if (!eenResponse.ok) {
        console.error(`[Vite Plugin] EEN Revoke Error ${eenResponse.status}`)
        res.statusCode = eenResponse.status
        return res.end('Failed to revoke token at EEN.')
      }

      // Remove the session regardless of EEN response
      sessions.delete(sessionId)
      //console.log(`[Vite Plugin] Deleted session: ${sessionId}`)

      // Remove the cookie by setting its expiration to 0
      res.setHeader(
        'Set-Cookie',
        `sessionId=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
      )

      res.statusCode = 200
      res.end('Token revoked successfully')
    } catch (error) {
      console.error('[Vite Plugin] Error revoking token:', error)
      res.statusCode = 500
      res.end(`Server error: ${error.message}`)
    }
  }

  // Helper to handle /admin/sessionsCount
  const handleSessionsCount = async (req, res /*, next */) => {
    // console.log('[Vite Plugin] Intercepted /admin/sessionsCount'); // DEBUG

    // Try to get sessionId from cookie
    let sessionId = req.headers.cookie
      ?.split('; ')
      .find(cookie => cookie.startsWith('sessionId='))
      ?.split('=')[1]

    if (!sessionId) {
      console.error('[Vite Plugin] Missing sessionId for sessionsCount')
      res.statusCode = 401
      return res.end('Session ID cookie missing')
    }

    // Verify the current session exists
    const refreshToken = sessions.get(sessionId)
    if (!refreshToken) {
      console.error(`[Vite Plugin] No refresh token found for session: ${sessionId}`)
      res.statusCode = 401
      return res.end('Invalid or expired session')
    }

    try {
      // Get the total count of sessions
      const sessionCount = sessions.size

      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ sessionCount }))
    } catch (error) {
      console.error('[Vite Plugin] Error getting session count:', error)
      res.statusCode = 500
      res.end(`Server error: ${error.message}`)
    }
  }

  // Helper to handle /admin/removeSessions
  const handleRemoveSessions = async (req, res /*, next */) => {
    // console.log('[Vite Plugin] Intercepted /admin/removeSessions'); // DEBUG

    // Try to get sessionId from cookie
    let sessionId = req.headers.cookie
      ?.split('; ')
      .find(cookie => cookie.startsWith('sessionId='))
      ?.split('=')[1]

    if (!sessionId) {
      console.error('[Vite Plugin] Missing sessionId for removeSessions')
      res.statusCode = 401
      return res.end('Session ID cookie missing')
    }

    // Verify the current session exists
    const currentRefreshToken = sessions.get(sessionId)
    if (!currentRefreshToken) {
      console.error(`[Vite Plugin] No refresh token found for session: ${sessionId}`)
      res.statusCode = 401
      return res.end('Invalid or expired session')
    }

    try {
      // Count sessions before deletion
      const totalSessions = sessions.size
      let deletedSessions = 0

      // Remove all sessions except the current one
      for (const [key] of sessions) {
        if (key !== sessionId) {
          sessions.delete(key)
          deletedSessions++
        }
      }

      const remainingSessions = sessions.size

      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({
        message: 'Remote sessions cleared successfully',
        totalSessions,
        deletedSessions,
        remainingSessions
      }))
    } catch (error) {
      console.error('[Vite Plugin] Error removing sessions:', error)
      res.statusCode = 500
      res.end(`Server error: ${error.message}`)
    }
  }

  // Helper to handle /admin/version
  const handleVersion = async (req, res /*, next */) => {
    // console.log('[Vite Plugin] Intercepted /admin/version'); // DEBUG

    // Try to get sessionId from cookie
    let sessionId = req.headers.cookie
      ?.split('; ')
      .find(cookie => cookie.startsWith('sessionId='))
      ?.split('=')[1]

    if (!sessionId) {
      console.error('[Vite Plugin] Missing sessionId for version')
      res.statusCode = 401
      return res.end('Session ID cookie missing')
    }

    // Verify the current session exists
    const refreshToken = sessions.get(sessionId)
    if (!refreshToken) {
      console.error(`[Vite Plugin] No refresh token found for session: ${sessionId}`)
      res.statusCode = 401
      return res.end('Invalid or expired session')
    }

    try {
      // Get name and version from package.json (already imported as pkg)
      const versionString = `vite - ${pkg.name} - ${pkg.version}`

      res.setHeader('Content-Type', 'application/json')
      res.statusCode = 200
      res.end(JSON.stringify({ version: versionString }))
    } catch (error) {
      console.error('[Vite Plugin] Error getting version:', error)
      res.statusCode = 500
      res.end(`Server error: ${error.message}`)
    }
  }

  return {
    name: 'local-oauth-proxy',
    configureServer(server) {
      // console.log('[Vite Plugin] configureServer hook called.'); // DEBUG
      server.middlewares.use((req, res, next) => {
        // Check if the request path starts with /proxy/ and method is POST
        if (req.method === 'POST' && req.url?.startsWith('/proxy/getAccessToken')) {
          return handleGetAccessToken(req, res, next)
        }
        if (req.method === 'POST' && req.url?.startsWith('/proxy/refreshAccessToken')) {
          return handleRefreshAccessToken(req, res, next)
        }
        if (req.method === 'POST' && req.url?.startsWith('/proxy/revoke')) {
          return handleRevoke(req, res, next)
        }
        // Admin endpoints
        if (req.method === 'GET' && req.url?.startsWith('/admin/sessionsCount')) {
          return handleSessionsCount(req, res, next)
        }
        if (req.method === 'DELETE' && req.url?.startsWith('/admin/removeSessions')) {
          return handleRemoveSessions(req, res, next)
        }
        if (req.method === 'GET' && req.url?.startsWith('/admin/version')) {
          return handleVersion(req, res, next)
        }
        // If not matching our paths, pass control to the next middleware
        next()
      })
    }
  }
}

// Load .env variables early if needed by the plugin setup
// const mode = process.env.NODE_ENV || 'development' // Determine mode early
// const earlyEnv = loadEnv(mode, process.cwd(), '') // REMOVED - Unused

export default defineConfig(({ command, mode }) => {
  // Load .env variables for the current mode (can reuse earlyEnv if sufficient)
  const env = loadEnv(mode, process.cwd(), '')

  const config = {
    plugins: [
      vue(),
      // Add the proxy plugin instance, passing loaded env variables
      localOauthProxy(env),
      viteStaticCopy({
        targets: [
          {
            src: 'README.md',
            dest: '.'
          },
          {
            src: 'EEN_API_DOCUMENTATION.md',
            dest: '.'
          },
          {
            src: 'repository-management.pdf',
            dest: '.'
          }
        ]
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 3333,
      host: '127.0.0.1',
      strictPort: true,
      proxy: {}
    },
    preview: {
      port: 3333,
      host: '127.0.0.1',
      strictPort: true
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        // Ensure external dependencies if needed, though likely not for this proxy logic
      }
    },
    define: {
      // Define globals if needed, e.g., from package.json (APP_NAME, etc.)
      // Ensure constants are defined if used elsewhere in config/plugins
    }
    // Remove the template section if it's not actually used
    // template: { ... }
  }

  // Set base path conditionally (keep existing logic)
  if (command === 'build') {
    config.base = `/${pkg.name}/`
  } else {
    config.base = '/'
  }

  return config
})
