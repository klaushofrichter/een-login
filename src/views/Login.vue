<template>
  <div
    v-if="!isProcessingCallback"
    class="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900"
  >
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Welcome to {{ APP_NAME }}
      </h2>
      <button
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        @click="handleLogin"
      >
        Sign in with Eagle Eye Networks
      </button>
      <p class="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <router-link to="/direct" class="hover:underline font-medium"
          >Click here to use an access token for login</router-link
        >
      </p>
    </div>
    <div class="absolute bottom-4 flex items-center space-x-2 text-xs">
      <span class="text-gray-400 dark:text-gray-500">v{{ appVersion }}</span>
      <span v-if="lastCommitDate" class="text-gray-400 dark:text-gray-500"
        >| {{ lastCommitDate }}</span
      >
      <span class="text-gray-400 dark:text-gray-500">|</span>
      <a
        :href="readmeUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-500 dark:hover:text-gray-400"
        title="View README"
      >
        README
      </a>
    </div>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <!-- Loading state while processing callback -->
    <div class="flex items-center space-x-2">
      <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
      <span class="text-gray-600 dark:text-gray-400">Logging in...</span>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getAuthUrl, handleAuthCallback } from '../services/auth'
import packageJson from '../../package.json'
import { APP_NAME } from '../constants'

const router = useRouter()
const route = useRoute()
// Auth store is imported for potential future use but currently not used directly
 
const appVersion = computed(() => packageJson.version)
const lastCommitDate = computed(() => {
  if (!packageJson.lastCommit) return 'unknown build date'
  const date = new Date(packageJson.lastCommit)
  return date.toLocaleString()
})
const isProcessingCallback = ref(false)

const handleLogin = () => {
  const url = getAuthUrl()
  // this will go to the to the EEN login page, and after login, the user will be redirected to the callback URL
  window.location.href = url
}

// Check for OAuth code before mounting component
// Disabling the unused variable since it's used in future logic extensions
// eslint-disable-next-line no-unused-vars
const hasOAuthCode = computed(() => !!route.query.code)

const readmeUrl = computed(() =>
  import.meta.env.DEV
    ? 'https://github.com/klaushofrichter/' + packageJson.name + '/blob/develop/README.md'
    : 'https://github.com/klaushofrichter/' + packageJson.name + '/blob/gh-pages/README.md'
)

onMounted(async () => {
  const code = route.query.code

  if (code) {
    // Handling the redirect back FROM EEN
    isProcessingCallback.value = true
    try {
      const success = await handleAuthCallback(code)
      if (success) {
        // Check for a stored redirect path (set by the router guard)
        const redirectPath = localStorage.getItem('redirectAfterLogin')
        // Check if the path is known to be valid/invalid (set by router guard)
        const isValidRoute = localStorage.getItem('isValidRoute') === 'true'

        // Clear storage regardless of what we do next
        localStorage.removeItem('redirectAfterLogin')
        localStorage.removeItem('isValidRoute')

        if (redirectPath) {
          console.log(
            'Handling redirect after login - Path:',
            redirectPath,
            'Is valid route:',
            isValidRoute
          )

          if (isValidRoute) {
            // For valid routes, redirect to the original destination
            router.push(redirectPath)
          } else {
            // For invalid routes, use the NotFound page but keep the URL
            console.log('Invalid route detected, showing NotFound page')
            // Set a flag so NotFound can determine this was a post-login redirect
            sessionStorage.setItem('justCompletedLogin', 'true')
            // We need to manually navigate to ensure NotFound component is used
            router.push({
              name: 'NotFound',
              params: { pathMatch: redirectPath.substring(1).split('/') },
              replace: true
            })
          }
        } else {
          // Default redirect if no path was stored
          router.push('/home')
        }
      }
    } catch (error) {
      console.error('Error processing callback:', error)
      isProcessingCallback.value = false
      // Consider clearing stored redirect path on error too?
      // localStorage.removeItem('redirectAfterLogin');
      // router.push('/');
    }
  } else {
    // Standard case: User navigated directly to Login page, show the button
    document.title = `${APP_NAME} - Login`
    isProcessingCallback.value = false // Ensure loading state is off
  }
})
</script>
