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
                <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Camera Viewer</h4>
                
                <!-- Camera ID Input Section -->
                <div class="flex space-x-2 mb-4">
                  <div class="flex-1">
                    <label for="cameraId" class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Camera ID
                    </label>
                    <input
                      id="cameraId"
                      v-model="cameraId"
                      type="text"
                      placeholder="Enter camera ID..."
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-gray-100 text-sm"
                    />
                  </div>
                  <div class="flex items-end">
                    <button
                      @click="loadCamera"
                      :disabled="loading || !cameraId.trim()"
                      class="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {{ loading ? 'Loading...' : 'Load Camera' }}
                    </button>
                  </div>
                </div>

                <!-- Error Display -->
                <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p class="text-sm text-red-700 dark:text-red-400">{{ error }}</p>
                </div>

                <!-- Camera Information -->
                <div v-if="cameraInfo" class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <h5 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Camera Information</h5>
                  <p class="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Name:</strong> {{ cameraInfo.name || 'N/A' }}
                  </p>
                  <p class="text-sm text-blue-700 dark:text-blue-300">
                    <strong>ID:</strong> {{ cameraInfo.id || 'N/A' }}
                  </p>
                  <p v-if="cameraInfo.status" class="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Status:</strong> {{ cameraInfo.status }}
                  </p>
                </div>

                <!-- Camera Image -->
                <div v-if="cameraImage" class="text-center">
                  <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Live Image</h5>
                  <div class="inline-block border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <img
                      :src="cameraImage"
                      :alt="cameraInfo?.name || 'Camera Image'"
                      class="max-w-full h-auto"
                      style="max-height: 400px;"
                    />
                  </div>
                  <p v-if="imageTimestamp" class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Captured: {{ formatTimestamp(imageTimestamp) }}
                  </p>
                </div>

                <!-- Available Sensors Section -->
                <div class="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="text-sm font-medium text-green-900 dark:text-green-100">Available Sensors</h5>
                    <button
                      @click="loadSensors"
                      :disabled="sensorsLoading"
                      class="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {{ sensorsLoading ? 'Loading...' : 'Refresh' }}
                    </button>
                  </div>
                  
                  <!-- Sensors Loading State -->
                  <div v-if="sensorsLoading && !sensors.length" class="text-sm text-green-700 dark:text-green-300">
                    Loading sensors...
                  </div>
                  
                  <!-- Sensors Error -->
                  <div v-else-if="sensorsError" class="text-sm text-red-700 dark:text-red-400">
                    {{ sensorsError }}
                  </div>
                  
                  <!-- Sensors List -->
                  <div v-else-if="sensors.length > 0" class="space-y-2">
                    <div class="text-xs text-green-600 dark:text-green-400 mb-2">
                      Found {{ sensors.length }} sensor device{{ sensors.length !== 1 ? 's' : '' }}
                    </div>
                    <div class="max-h-32 overflow-y-auto space-y-1">
                      <div
                        v-for="sensor in sensors"
                        :key="sensor.id"
                        class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-green-200 dark:border-green-700"
                      >
                        <div class="flex-1 min-w-0">
                          <p class="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                            {{ sensor.name || 'Unnamed Sensor' }}
                          </p>
                          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                            ID: {{ sensor.id }}
                          </p>
                          <p v-if="sensor.status" class="text-xs text-gray-500 dark:text-gray-400">
                            Status: {{ sensor.status }}
                          </p>
                        </div>
                        <div v-if="sensor.primaryCameraId" class="text-xs text-green-600 dark:text-green-400 ml-2">
                          📷 {{ sensor.primaryCameraId }}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- No Sensors Found -->
                  <div v-else class="text-sm text-green-700 dark:text-green-300">
                    No sensor devices found.
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
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { APP_NAME } from '../constants'
import { cameraService } from '../services/cameras'
import { mediaService } from '../services/media'
import { sensorService } from '../services/sensors'

// We import auth store for potential future use but don't use it directly yet
// eslint-disable-next-line no-unused-vars
const authStore = useAuthStore()

// Reactive data
const cameraId = ref('1005963a')
const loading = ref(false)
const error = ref('')
const cameraInfo = ref(null)
const cameraImage = ref(null)
const imageTimestamp = ref(null)
const sensors = ref([])
const sensorsLoading = ref(false)
const sensorsError = ref('')

// Load camera information and image
const loadCamera = async () => {
  if (!cameraId.value.trim()) {
    error.value = 'Please enter a camera ID'
    return
  }

  loading.value = true
  error.value = ''
  cameraInfo.value = null
  cameraImage.value = null
  imageTimestamp.value = null

  try {
    // Get camera information
    const camera = await cameraService.getCameraById(cameraId.value.trim())
    cameraInfo.value = camera

    // Get live image
    const imageResult = await mediaService.getLiveImage(cameraId.value.trim())
    if (imageResult.image) {
      cameraImage.value = imageResult.image
      imageTimestamp.value = imageResult.timestamp
    } else {
      error.value = 'Failed to load camera image'
    }
  } catch (err) {
    console.error('Error loading camera:', err)
    error.value = err.message || 'Failed to load camera information'
  } finally {
    loading.value = false
  }
}

// Load sensors
const loadSensors = async () => {
  sensorsLoading.value = true
  sensorsError.value = ''
  sensors.value = []

  try {
    // Get sensor devices with status information
    const sensorsResponse = await sensorService.listSensorDevices({
      include: ['status'],
      sort: ['+name']
    })
    sensors.value = sensorsResponse.results || []
  } catch (err) {
    console.error('Error loading sensors:', err)
    sensorsError.value = err.message || 'Failed to load sensors'
  } finally {
    sensorsLoading.value = false
  }
}

// Format timestamp for display
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Unknown'
  try {
    const date = new Date(timestamp)
    return date.toLocaleString()
  } catch (err) {
    return timestamp
  }
}

onMounted(() => {
  document.title = `${APP_NAME} - Home`
  loadSensors()
})
</script>
