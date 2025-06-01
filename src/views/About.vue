<template>
  <div class="min-h-screen flex flex-col justify-between bg-gray-50 dark:bg-gray-900">
    <div class="py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div class="max-w-3xl mx-auto">
        <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
              About {{ APP_NAME }}
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
              Secure authentication with Eagle Eye Networks using OAuth2 and a Cloudflare Worker
              proxy.
            </p>
          </div>
          <div class="border-t border-gray-200 dark:border-gray-700 px-4 py-5 sm:p-6">
            <!-- Features -->
            <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">Features</h4>
            <ul class="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6">
              <li class="flex items-center">
                <svg
                  class="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Secure OAuth2 authentication via Cloudflare Worker proxy
              </li>
              <li class="flex items-center">
                <svg
                  class="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Direct Token-Based Access option
              </li>
              <li class="flex items-center">
                <svg
                  class="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Secure refresh token management via Worker
              </li>
              <li class="flex items-center">
                <svg
                  class="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                User profile display and credential copying
              </li>
              <li class="flex items-center">
                <svg
                  class="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                Theme switching (Light/Dark/System)
              </li>
              <li class="flex items-center">
                <svg
                  class="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                End-to-end testing with Playwright
              </li>
            </ul>

            <!-- Technology Stack -->
            <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Technology Stack
            </h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100">Frontend</h5>
                <ul class="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Vue 3 (Composition API)</li>
                  <li>Vite</li>
                  <li>Tailwind CSS</li>
                  <li>Pinia (State Management)</li>
                  <li>Vue Router</li>
                </ul>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100">Backend & Auth</h5>
                <ul class="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Cloudflare Workers (Proxy)</li>
                  <li>OAuth2 (Authorization Code)</li>
                  <li>Eagle Eye Networks API</li>
                  <li>localStorage (Theme)</li>
                </ul>
              </div>
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100">Testing</h5>
                <ul class="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>Playwright (E2E)</li>
                  <li>ESLint / Prettier</li>
                </ul>
              </div>
            </div>

            <!-- Version Info / README Link (Inside Card) -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div class="flex justify-center items-center space-x-2 text-xs">
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { APP_NAME } from '../constants'
import packageJson from '../../package.json'

// We import auth store for potential future use but don't use it directly yet
// eslint-disable-next-line no-unused-vars
const authStore = useAuthStore()

const appVersion = computed(() => packageJson.version)
const lastCommitDate = computed(() => {
  if (!packageJson.lastCommit) return 'unknown build date'
  const date = new Date(packageJson.lastCommit)
  return date.toLocaleString()
})

const readmeUrl = computed(() =>
  import.meta.env.DEV
    ? 'https://github.com/klaushofrichter/' + packageJson.name + '/blob/develop/README.md'
    : 'https://github.com/klaushofrichter/' + packageJson.name + '/blob/gh-pages/README.md'
)

onMounted(() => {
  document.title = `${APP_NAME} - About`
})
</script>
