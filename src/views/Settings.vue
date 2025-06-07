<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">Settings</h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Configure your application preferences
          </p>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <div class="space-y-6">
              <!-- Theme Settings -->
              <div>
                <h4 class="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Theme</h4>
                <div class="flex items-center space-x-4">
                  <button
                    class="px-4 py-2 rounded-md text-sm font-medium"
                    :class="[
                      theme === 'light'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    ]"
                    @click="setTheme('light')"
                  >
                    Light
                  </button>
                  <button
                    class="px-4 py-2 rounded-md text-sm font-medium"
                    :class="[
                      theme === 'dark'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    ]"
                    @click="setTheme('dark')"
                  >
                    Dark
                  </button>
                  <button
                    class="px-4 py-2 rounded-md text-sm font-medium"
                    :class="[
                      theme === 'system'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    ]"
                    @click="setTheme('system')"
                  >
                    System
                  </button>
                </div>
              </div>

              <!-- Admin Settings - Only show for Hofrichter -->
              <div v-if="isLoadingProfile" class="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 class="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Admin</h4>
                <div class="flex items-center space-x-2">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                  <span class="text-sm text-gray-500 dark:text-gray-400">Checking admin permissions...</span>
                </div>
              </div>
              <div v-else-if="isHofrichter" class="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 class="text-base font-medium text-gray-900 dark:text-gray-100 mb-4">Admin</h4>
                <div class="space-y-4">
                  <div class="flex items-center space-x-4">
                    <button
                      :disabled="isRemovingSessions"
                      class="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      @click="showConfirmDialog = true"
                    >
                      <span v-if="isRemovingSessions" class="mr-2">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block"></div>
                      </span>
                      {{ isRemovingSessions ? 'Removing...' : 'Remove All Sessions' }}
                    </button>
                  </div>
                  <div class="flex flex-col space-y-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        Active sessions:
                      </span>
                      <span v-if="isLoadingSessionCount" class="text-sm text-gray-500 dark:text-gray-400">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 inline-block"></div>
                      </span>
                      <span v-else-if="sessionCount !== null" class="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {{ sessionCount }}
                      </span>
                      <span v-else class="text-sm text-red-500 dark:text-red-400">
                        Error loading count
                      </span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-sm text-gray-600 dark:text-gray-400">
                        Proxy version:
                      </span>
                      <span v-if="isLoadingVersion" class="text-sm text-gray-500 dark:text-gray-400">
                        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 inline-block"></div>
                      </span>
                      <span v-else-if="versionInfo !== null" class="text-sm font-medium text-gray-900 dark:text-gray-100 font-mono">
                        {{ versionInfo }}
                      </span>
                      <span v-else class="text-sm text-red-500 dark:text-red-400">
                        Error loading version
                      </span>
                    </div>
                  </div>
                </div>
                <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  This will log out all other devices while keeping your current session active.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialog for showing results -->
    <div v-if="showDialog" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeDialog"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-green-600 dark:text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                  Sessions Removed
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-line">
                    {{ dialogMessage }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm" @click="closeDialog">
              OK
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showConfirmDialog" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeConfirmDialog"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100" id="modal-title">
                  Remove All Sessions
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to remove all remote sessions? This will log out all other devices while keeping your current session active.
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm" @click="confirmRemoveSessions">
              Remove Sessions
            </button>
            <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" @click="closeConfirmDialog">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useThemeStore } from '../stores/theme'
import { useAuthStore } from '../stores/auth'
import { userService } from '../services/user'
import { APP_NAME } from '../constants'

const themeStore = useThemeStore()
const authStore = useAuthStore()
const theme = computed(() => themeStore.theme)

// Add loading state for profile
const isLoadingProfile = ref(false)

// State for admin functionality
const isRemovingSessions = ref(false)
const showDialog = ref(false)
const showConfirmDialog = ref(false)
const dialogMessage = ref('')
const isLoadingSessionCount = ref(true)
const sessionCount = ref(null)
const isLoadingVersion = ref(true)
const versionInfo = ref(null)

// Check if user is Hofrichter
const isHofrichter = computed(() => {
  return authStore.userProfile?.lastName === 'Hofrichter'
})

const setTheme = newTheme => {
  themeStore.setTheme(newTheme)
}

const fetchUserProfile = async () => {
  if (!authStore.baseUrl || !authStore.token) {
    return
  }

  if (authStore.userProfile) {
    return
  }

  isLoadingProfile.value = true

  try {
    const data = await userService.getUserProfile()
    authStore.setUserProfile({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email
    })
  } catch (error) {
    console.error('Failed to load profile for admin check:', error)
  } finally {
    isLoadingProfile.value = false
  }
}

const removeAllSessions = async () => {
  isRemovingSessions.value = true
  
  try {
    // Determine proxy URL, defaulting to local Vite server if VITE_AUTH_PROXY_URL is not set
    const AUTH_PROXY_URL = import.meta.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333'
    const requestUrl = `${AUTH_PROXY_URL}/admin/removeSessions`
    
    const response = await fetch(requestUrl, {
      method: 'DELETE',
      credentials: 'include', // Important for sending the sessionId cookie
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    dialogMessage.value = `${result.message}

Deleted sessions: ${result.deletedSessions}
Remaining sessions: ${result.remainingSessions}`
    showDialog.value = true
    
    // Refresh the session count after successful removal
    await fetchSessionCount()
  } catch (error) {
    console.error('Error removing sessions:', error)
    dialogMessage.value = `Failed to remove sessions: ${error.message}`
    showDialog.value = true
  } finally {
    isRemovingSessions.value = false
  }
}

const closeDialog = () => {
  showDialog.value = false
  dialogMessage.value = ''
}

const closeConfirmDialog = () => {
  showConfirmDialog.value = false
}

const confirmRemoveSessions = () => {
  showConfirmDialog.value = false
  removeAllSessions()
}

onMounted(async () => {
  document.title = `${APP_NAME} - Settings`
  
  // Fetch user profile first to ensure we have the lastName for admin check
  await fetchUserProfile()
  
  // Only fetch session count and version if user is Hofrichter
  if (isHofrichter.value) {
    fetchSessionCount()
    fetchVersion()
  }
})

const fetchSessionCount = async () => {
  try {
    // Determine proxy URL, defaulting to local Vite server if VITE_AUTH_PROXY_URL is not set
    const AUTH_PROXY_URL = import.meta.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333'
    const requestUrl = `${AUTH_PROXY_URL}/admin/sessionsCount`
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      credentials: 'include', // Important for sending the sessionId cookie
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    sessionCount.value = result.sessionCount
  } catch (error) {
    console.error('Error fetching session count:', error)
    sessionCount.value = null
  } finally {
    isLoadingSessionCount.value = false
  }
}

const fetchVersion = async () => {
  try {
    // Determine proxy URL, defaulting to local Vite server if VITE_AUTH_PROXY_URL is not set
    const AUTH_PROXY_URL = import.meta.env.VITE_AUTH_PROXY_URL || 'http://127.0.0.1:3333'
    const requestUrl = `${AUTH_PROXY_URL}/admin/version`
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      credentials: 'include', // Important for sending the sessionId cookie
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    versionInfo.value = result.version
  } catch (error) {
    console.error('Error fetching version:', error)
    versionInfo.value = null
  } finally {
    isLoadingVersion.value = false
  }
}
</script>
