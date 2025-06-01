<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div v-if="loading && !userProfile" class="p-8 text-center">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
        ></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading your profile...</p>
      </div>

      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            User Profile
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            Your Eagle Eye Networks account information
          </p>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <div v-if="loading && !userProfile" class="text-center py-4">
              <div
                class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"
              ></div>
              <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading profile...</p>
            </div>
            <div v-else-if="error" class="text-center py-4">
              <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
              <button
                class="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                @click="fetchUserProfile"
              >
                Retry
              </button>
            </div>
            <div v-else-if="!userProfile" class="text-center py-4">
              <p class="text-sm text-gray-500 dark:text-gray-400">No profile data available</p>
            </div>
            <div v-else class="grid grid-cols-1 gap-6">
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {{ userProfile.firstName || 'N/A' }}
                  </dd>
                </div>
                <div class="sm:col-span-1">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {{ userProfile.lastName || 'N/A' }}
                  </dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {{ userProfile.email || 'N/A' }}
                  </dd>
                </div>
                <div class="sm:col-span-2">
                  <dt class="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
                  <dd class="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {{ userProfile.id || 'N/A' }}
                  </dd>
                </div>
              </dl>

              <!-- Credentials Section -->
              <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Credentials
                </h4>
                <div class="space-y-4">
                  <div class="grid grid-cols-8 gap-4">
                    <div class="col-span-6">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >Base URL</label
                      >
                      <input
                        :value="authStore.hostname"
                        readonly
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600"
                      />
                    </div>
                    <div class="col-span-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >Port</label
                      >
                      <input
                        :value="authStore.port"
                        readonly
                        class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Access Token</label
                    >
                    <div class="flex items-center space-x-4">
                      <div class="flex-1">
                        <input
                          :id="'access-token'"
                          :type="showToken ? 'text' : 'password'"
                          :value="authStore.token"
                          readonly
                          class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600"
                        />
                      </div>
                      <div class="flex space-x-2">
                        <button
                          class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          @click="toggleAndCopyToken"
                        >
                          {{ showToken ? 'Hide' : 'Show & Copy' }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Token Expiration -->
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Token Expiration</label
                    >
                    <div class="flex items-center space-x-2">
                      <div class="flex-1">
                        <div
                          :id="'expiration-time'"
                          class="block w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm dark:bg-gray-800 dark:text-gray-100 px-3 py-2 bg-gray-50 dark:bg-gray-700 break-words"
                        >
                          {{ tokenExpirationText }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Refresh Token Status -->
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >Refresh Token</label
                    >
                    <div class="flex items-center space-x-4">
                      <div class="flex-1">
                        <input
                          :id="'refresh-token'"
                          :value="hasRefreshToken ? 'Available' : 'No Refresh Token available'"
                          readonly
                          class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm sm:text-sm dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-0 focus:border-gray-300 dark:focus:border-gray-600"
                        />
                      </div>
                      <button
                        v-if="hasRefreshToken"
                        :disabled="isRefreshing"
                        class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        @click="handleRefresh"
                      >
                        <span v-if="isRefreshing" class="mr-2">
                          <div
                            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
                          ></div>
                        </span>
                        {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { userService } from '../services/user'
import { refreshToken } from '../services/auth'
import { APP_NAME } from '../constants'

const authStore = useAuthStore()
const loading = ref(false)
const error = ref(null)
const showToken = ref(false)
let expirationInterval = null
const forceUpdate = ref(0)
const isRefreshing = ref(false)

const userProfile = computed(() => authStore.userProfile)
const pageTitle = computed(() => `${APP_NAME} - Profile`)
const hasRefreshToken = computed(() => !!localStorage.getItem('refresh_token'))

const tokenExpirationText = computed(() => {
  forceUpdate.value
  const remaining = authStore.getTokenTimeRemaining()
  if (remaining === null || remaining === undefined) return 'Token expiration date is unknown'
  if (remaining <= 0) return 'Token expired'

  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)

  // Calculate absolute expiration time
  const now = new Date()
  const expirationTime = new Date(now.getTime() + remaining)
  const timeString = expirationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  // Determine if expiration is today, tomorrow, or later
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  let dayIndicator
  if (expirationTime < tomorrow) {
    dayIndicator = 'today'
  } else if (expirationTime < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)) {
    dayIndicator = 'tomorrow'
  } else {
    dayIndicator = expirationTime.toLocaleDateString()
  }

  let remainingText
  if (hours >= 2) {
    remainingText = `more than ${hours} hours remaining`
  } else {
    remainingText = `${minutes} minutes remaining`
  }

  return `${remainingText} (expires at ${timeString} ${dayIndicator})`
})

async function fetchUserProfile() {
  if (!authStore.baseUrl || !authStore.token) {
    error.value = 'Please log in to view your profile'
    return
  }

  if (authStore.userProfile) {
    return
  }

  loading.value = true
  error.value = null

  try {
    const data = await userService.getUserProfile()
    authStore.setUserProfile({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email
    })
  } catch (err) {
    error.value = err.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

function copyToken() {
  if (authStore.token) {
    navigator.clipboard.writeText(authStore.token)
  }
}

function toggleAndCopyToken() {
  showToken.value = !showToken.value
  if (showToken.value) {
    copyToken()
  }
}

async function handleRefresh() {
  if (isRefreshing.value) return

  isRefreshing.value = true
  try {
    const success = await refreshToken()
    if (success) {
      forceUpdate.value++
      // Hide the token if it was shown
      showToken.value = false
    }
  } catch (error) {
    console.error('Failed to refresh token:', error)
  } finally {
    isRefreshing.value = false
  }
}

onMounted(async () => {
  document.title = pageTitle.value
  await fetchUserProfile()
  expirationInterval = setInterval(() => {
    forceUpdate.value++
  }, 60000)
})

onUnmounted(() => {
  if (expirationInterval) {
    clearInterval(expirationInterval)
  }
})
</script>
