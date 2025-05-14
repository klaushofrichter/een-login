<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div class="px-4 py-5 sm:px-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
            Welcome to {{ APP_NAME }}
          </h3>
          <p class="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            You have successfully logged in to your Eagle Eye Networks account
          </p>
        </div>
        <div class="border-t border-gray-200 dark:border-gray-700">
          <div class="px-4 py-5 sm:p-6">
            <div class="grid grid-cols-1 gap-6">
              <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">Quick Links</h4>
                <ul class="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                  <li>
                    <router-link
                      to="/profile"
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                    >
                      Profile
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to="/about"
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                    >
                      About
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      to="/settings"
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
                    >
                      Settings
                    </router-link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { APP_NAME } from '../constants'

// We import auth store for potential future use but don't use it directly yet
// eslint-disable-next-line no-unused-vars
const authStore = useAuthStore()

onMounted(() => {
  document.title = `${APP_NAME} - Home`
})
</script>
