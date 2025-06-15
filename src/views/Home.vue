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
                
                <!-- Available Cameras Section -->
                <div class="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="text-sm font-medium text-blue-900 dark:text-blue-100">Your Cameras</h5>
                    <button
                      @click="loadCameras"
                      :disabled="camerasLoading"
                      class="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {{ camerasLoading ? 'Loading...' : 'Refresh' }}
                    </button>
                  </div>
                  
                  <!-- Cameras Loading State -->
                  <div v-if="camerasLoading && !cameras.length" class="text-sm text-blue-700 dark:text-blue-300">
                    Loading cameras...
                  </div>
                  
                  <!-- Cameras Error -->
                  <div v-else-if="camerasError" class="text-sm text-red-700 dark:text-red-400">
                    {{ camerasError }}
                  </div>
                  
                  <!-- Cameras List -->
                  <div v-else-if="cameras.length > 0" class="space-y-2">
                    <div class="text-xs text-blue-600 dark:text-blue-400 mb-2">
                      Showing {{ cameras.length }} camera{{ cameras.length !== 1 ? 's' : '' }}
                    </div>
                    <div class="space-y-1">
                                             <div
                         v-for="camera in cameras"
                         :key="camera.id"
                         class="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-blue-200 dark:border-blue-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                         @click="selectCamera(camera.id)"
                       >
                         <div class="flex-1 min-w-0">
                           <p class="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                             {{ camera.name || 'Unnamed Camera' }}
                           </p>
                           <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                             ID: {{ camera.id }}
                           </p>
                         </div>
                         <div v-if="camera.status" class="flex items-center ml-2">
                           <div 
                             :class="[
                               'w-2 h-2 rounded-full mr-1',
                               camera.status?.connectionStatus === 'online' 
                                 ? 'bg-green-500' 
                                 : 'bg-red-500'
                             ]"
                           ></div>
                           <span 
                             :class="[
                               'text-xs font-medium',
                               camera.status?.connectionStatus === 'online' 
                                 ? 'text-green-600 dark:text-green-400' 
                                 : 'text-red-600 dark:text-red-400'
                             ]"
                           >
                             {{ camera.status?.connectionStatus === 'online' ? 'Online' : 'Offline' }}
                           </span>
                         </div>
                       </div>
                    </div>
                  </div>
                  
                  <!-- No Cameras Found -->
                  <div v-else class="text-sm text-blue-700 dark:text-blue-300">
                    No cameras found.
                  </div>
                </div>
                
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
                <div v-if="multipartUrl" class="text-center">
                  <h5 class="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Live Stream</h5>
                  <div class="inline-block border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <img
                      :src="multipartUrl"
                      :alt="cameraInfo?.name || 'Camera Stream'"
                      class="max-w-full h-auto"
                      style="max-height: 400px;"
                    />
                  </div>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Status: {{ streamStatus }}
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
                          <p v-if="sensor.primaryCameraId" class="text-xs text-green-600 dark:text-green-400 mt-1">
                            📷 {{ sensor.primaryCameraId }}
                          </p>
                        </div>
                        <div v-if="sensor.status" class="flex items-center ml-2">
                          <div 
                            :class="[
                              'w-2 h-2 rounded-full mr-1',
                              sensor.status?.connectionStatus === 'online' 
                                ? 'bg-green-500' 
                                : 'bg-red-500'
                            ]"
                          ></div>
                          <span 
                            :class="[
                              'text-xs font-medium',
                              sensor.status?.connectionStatus === 'online' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            ]"
                          >
                            {{ sensor.status?.connectionStatus === 'online' ? 'Online' : 'Offline' }}
                          </span>
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
import { mediaSessionService } from '../services/mediaSession'
import { feedsService } from '../services/feeds'
import { sensorService } from '../services/sensors'

// We import auth store for potential future use but don't use it directly yet
// eslint-disable-next-line no-unused-vars
const authStore = useAuthStore()

// Reactive data
const cameraId = ref('1005963a')
const loading = ref(false)
const error = ref('')
const cameraInfo = ref(null)
const multipartUrl = ref(null)
const streamStatus = ref('Stopped')
const sensors = ref([])
const sensorsLoading = ref(false)
const sensorsError = ref('')
const cameras = ref([])
const camerasLoading = ref(false)
const camerasError = ref('')

// Load camera information and get multipart URL
const loadCamera = async () => {
  if (!cameraId.value.trim()) {
    error.value = 'Please enter a camera ID'
    return
  }

  loading.value = true
  error.value = ''
  cameraInfo.value = null
  multipartUrl.value = null
  streamStatus.value = 'Loading...'

  try {
    // Get camera information
    const camera = await cameraService.getCameraById(cameraId.value.trim())
    cameraInfo.value = camera

    // Step 1: Initialize the media session cookie
    await mediaSessionService.initializeMediaSession()
    
    // Step 2: Get the multipart URL using the feeds service
    const feedMultipartUrl = await feedsService.getMultipartUrl(cameraId.value.trim(), 'preview')
    
    if (feedMultipartUrl) {
      multipartUrl.value = feedMultipartUrl
      //console.log('Using multipart URL:', feedMultipartUrl)
      streamStatus.value = 'Live'
    } else {
      error.value = 'No preview multipart URL found for this camera'
      streamStatus.value = 'Error'
    }
  } catch (err) {
    console.error('Error loading camera:', err)
    error.value = err.message || 'Failed to load camera information'
    streamStatus.value = 'Error'
  } finally {
    loading.value = false
  }
}

// Load cameras
const loadCameras = async () => {
  camerasLoading.value = true
  camerasError.value = ''
  cameras.value = []

  try {
    // Get up to 5 cameras with basic information
    const camerasResponse = await cameraService.listCameras({
      include: ['status'],
      sort: ['+name'],
      pageSize: 5
    })
    cameras.value = camerasResponse.results || []
  } catch (err) {
    console.error('Error loading cameras:', err)
    camerasError.value = err.message || 'Failed to load cameras'
  } finally {
    camerasLoading.value = false
  }
}

// Select a camera from the list
const selectCamera = (selectedCameraId) => {
  cameraId.value = selectedCameraId
  loadCamera()
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
  loadCameras()
  loadSensors()
})
</script>
