# EEN API Documentation

This document provides comprehensive documentation for the EEN (Eagle Eye Networks) API services used in the application. Pleas note that there is a version of this EEN Login application that shows more details 
and practial examples [here](https://github.com/klaushofrichter/een-playground).

## Table of Contents
- [Camera Service](#camera-service)
- [Sensor Service](#sensor-service)
- [Media Service](#media-service)
- [Media Session Service](#media-session-service)
- [User Service](#user-service)
- [Measurements Service](#measurements-service)
- [Sensor Gateways Service](#sensor-gateways-service)
- [Sensor Summary Service](#sensor-summary-service)

## Camera Service

The Camera Service provides functionality to interact with EEN Camera APIs.

### Methods

#### `listCameras(options = {})`
Retrieves a paginated list of cameras with various filtering options.

**Parameters:**
- `options` (Object, optional):
  - `include` (Array<string>): Fields to include in response
  - `sort` (Array<string>): Sorting options
  - `pageToken` (string): Page token for pagination
  - `pageSize` (number): Number of results per page
  - `locationId__in` (Array<string>): Filter by location IDs
  - `bridgeId__in` (Array<string>): Filter by bridge IDs
  - `multiCameraId` (string): Filter by multi camera ID
  - `multiCameraId__ne` (string): Filter by multi camera ID not equal
  - `multiCameraId__in` (Array<string>): Filter by multi camera IDs
  - `tags__contains` (Array<string>): Filter by tags (all must be present)
  - `tags__any` (Array<string>): Filter by tags (any must be present)
  - `packages__contains` (Array<string>): Filter by packages
  - `layoutId` (string): Filter by layout ID
  - `name__contains` (string): Filter by name containing substring
  - `name__in` (Array<string>): Filter by exact names
  - `name` (string): Filter by exact name
  - `id__in` (Array<string>): Filter by camera IDs
  - `id__notIn` (Array<string>): Exclude camera IDs
  - `id__contains` (string): Filter by ID containing substring
  - `shared` (boolean): Filter by shared status
  - `sharedCameraAccount` (string): Filter by sharing account ID
  - `firstResponder` (boolean): Filter by first responder sharing
  - `directToCloud` (boolean): Filter by direct to cloud connection
  - `speakerId__in` (Array<string>): Filter by speaker IDs
  - `q` (string): Search query
  - `qRelevance__gte` (number): Minimum search relevance
  - `enabledAnalytics__contains` (Array<string>): Filter by enabled analytics
  - `status__in` (Array<string>): Filter by status values
  - `status__ne` (string): Filter by status not equal

**Returns:** Promise<Object> - Paginated list of cameras

#### `getCameraById(cameraId, options = {})`
Retrieves camera details by ID.

**Parameters:**
- `cameraId` (string): The ID of the camera to fetch
- `options` (Object, optional):
  - `include` (Array<string>): Fields to include in response

**Returns:** Promise<Object> - Camera details

#### `addCamera(cameraData)`
Adds a new camera.

**Parameters:**
- `cameraData` (Object): Camera data to create

**Returns:** Promise<Object> - Created camera details

#### `updateCamera(cameraId, updateData)`
Updates an existing camera.

**Parameters:**
- `cameraId` (string): The ID of the camera to update
- `updateData` (Object): Data to update

**Returns:** Promise<Object> - Updated camera details

#### `deleteCamera(cameraId)`
Deletes a camera.

**Parameters:**
- `cameraId` (string): The ID of the camera to delete

**Returns:** Promise<void>

#### `updateBulkCameras(bulkUpdateData)`
Updates multiple cameras in bulk.

**Parameters:**
- `bulkUpdateData` (Object): Bulk update data

**Returns:** Promise<Object> - Update results

#### `getCameraMetrics(cameraId, options = {})`
Retrieves camera metrics.

**Parameters:**
- `cameraId` (string): The ID of the camera
- `options` (Object, optional): Query options

**Returns:** Promise<Object> - Camera metrics

## Sensor Service

The Sensor Service provides functionality to interact with EEN Sensor Device APIs.

### Methods

#### `getSensorDeviceById(sensorDeviceId, include = [])`
Retrieves sensor device details by ID.

**Parameters:**
- `sensorDeviceId` (string): The ID of the sensor device to fetch
- `include` (Array<string>, optional): Fields to include (status, timeZone, notes, deviceInfo, sampler, battery, bluetooth, locationSummary, gatewaySummary)

**Returns:** Promise<Object> - Sensor device details

#### `listSensorDevices(options = {})`
Retrieves a paginated list of sensor devices.

**Parameters:**
- `options` (Object, optional):
  - `locationId__in` (Array<string>): List of Location IDs to filter on
  - `parentId__in` (Array<string>): List of Parent IDs to filter on
  - `propertyType__in` (Array<string>): List of property types to filter on
  - `thresholdLevel__in` (Array<string>): List of threshold levels to filter on
  - `cameraId__in` (Array<string>): List of Camera IDs to filter on
  - `id__in` (Array<string>): List of Sensor Device IDs to filter on
  - `q` (string): Text search query
  - `qRelevance__gte` (number): Minimum similarity threshold for text search (0-1)
  - `include` (Array<string>): Fields to include in response
  - `sort` (Array<string>): Sorting options
  - `pageToken` (string): Page token for pagination
  - `pageSize` (number): Number of results per page

**Returns:** Promise<Object> - Paginated list of sensor devices

#### `addSensorDevice(sensorDeviceData)`
Adds a new sensor device.

**Parameters:**
- `sensorDeviceData` (Object):
  - `name` (string): The name of the sensor device
  - `guid` (string): The GUID of the sensor device
  - `locationId` (string, optional): The location ID
  - `primaryCameraId` (string, optional): The primary camera ID
  - `notes` (string, optional): Notes about the sensor device

**Returns:** Promise<Object> - Created sensor device details

#### `updateSensorDevice(sensorDeviceId, updateData)`
Updates an existing sensor device.

**Parameters:**
- `sensorDeviceId` (string): The ID of the sensor device to update
- `updateData` (Object):
  - `name` (string, optional): The name of the sensor device
  - `locationId` (string, optional): The location ID
  - `primaryCameraId` (string, optional): The primary camera ID
  - `notes` (string, optional): Notes about the sensor device

**Returns:** Promise<void>

#### `deleteSensorDevice(sensorDeviceId)`
Deletes a sensor device.

**Parameters:**
- `sensorDeviceId` (string): The ID of the sensor device to delete

**Returns:** Promise<void>

## Media Service

The Media Service provides comprehensive functionality to interact with EEN Media APIs for retrieving live and recorded media content.

### Methods

#### `listMedia(options = {})`
Lists media intervals for a device with various filtering options.

**Parameters:**
- `options` (Object, required):
  - `deviceId` (string): The ID of the device (required)
  - `type` (string): Stream type ('preview' or 'main') (required)
  - `mediaType` (string): Media type ('video' or 'image') (required)
  - `startTimestamp__gte` (string): Start timestamp (ISO 8601) (required)
  - `endTimestamp__lte` (string, optional): End timestamp (ISO 8601)
  - `coalesce` (boolean, optional): Coalesce connected intervals (default: true)
  - `include` (Array<string>, optional): Fields to include ('flvUrl', 'rtspUrl', 'rtspsUrl', 'multipartUrl', 'mp4Url')
  - `pageToken` (string, optional): Page token for pagination
  - `pageSize` (number, optional): Number of results per page

**Returns:** Promise<Object> - Paginated list of media intervals

**Example:**
```javascript
const mediaList = await mediaService.listMedia({
  deviceId: 'camera123',
  type: 'preview',
  mediaType: 'video',
  startTimestamp__gte: '2023-01-01T00:00:00Z',
  endTimestamp__lte: '2023-01-01T23:59:59Z',
  include: ['flvUrl', 'mp4Url']
});
```

#### `getLiveImage(deviceId, type = 'preview')`
Retrieves a live image from a camera.

**Parameters:**
- `deviceId` (string): The ID of the device (camera)
- `type` (string, optional): The type of stream to fetch ('preview' only for live images, default: 'preview')

**Returns:** Promise<Object>:
- `image` (string|null): Base64 encoded image data with data URI format
- `timestamp` (string|null): Image timestamp from X-Een-Timestamp header
- `prevToken` (string|null): Previous token from X-Een-PrevToken header

**Example:**
```javascript
const liveImage = await mediaService.getLiveImage('camera123');
if (liveImage.image) {
  // Use the base64 image directly in an img tag
  document.getElementById('livePreview').src = liveImage.image;
}
```

#### `getRecordedImage(options = {})`
Retrieves a recorded image from a camera with advanced filtering and navigation options.

**Parameters:**
- `options` (Object):
  - `deviceId` (string, optional): The ID of the device (camera) - not required when using pageToken
  - `pageToken` (string, optional): Token from previous request (X-Een-NextToken or X-Een-PrevToken)
  - `type` (string, optional): Stream type ('preview' or 'main')
  - `timestamp__lt` (string, optional): Return first image with timestamp less than
  - `timestamp__lte` (string, optional): Return first image with timestamp less or equal
  - `timestamp` (string, optional): Return image at this exact timestamp
  - `timestamp__gte` (string, optional): Return first image with timestamp greater or equal
  - `timestamp__gt` (string, optional): Return first image with timestamp greater than
  - `overlayId__in` (Array<string>, optional): List of overlay IDs to include
  - `include` (Array<string>, optional): Include options ('overlayEmbedded', 'overlaySvgHeader')

**Returns:** Promise<Object>:
- `image` (string|null): Base64 encoded image data with data URI format
- `timestamp` (string|null): Image timestamp from X-Een-Timestamp header
- `nextToken` (string|null): Next token from X-Een-NextToken header
- `prevToken` (string|null): Previous token from X-Een-PrevToken header
- `overlaySvg` (string|null): Overlay SVG data from X-Een-OverlaySvg header

**Example:**
```javascript
// Get image at specific timestamp
const recordedImage = await mediaService.getRecordedImage({
  deviceId: 'camera123',
  timestamp__gte: '2023-01-01T12:00:00Z',
  type: 'main'
});

// Navigate using tokens
if (recordedImage.nextToken) {
  const nextImage = await mediaService.getRecordedImage({
    pageToken: recordedImage.nextToken
  });
}
```

#### `listRecordedImageFieldValues(deviceId, include = [])`
Gets available field values for recorded images, useful for discovering available overlays.

**Parameters:**
- `deviceId` (string): The ID of the device (camera)
- `include` (Array<string>, optional): Fields to include ('overlayId')

**Returns:** Promise<Object> - Available field values

**Example:**
```javascript
const fieldValues = await mediaService.listRecordedImageFieldValues('camera123', ['overlayId']);
console.log('Available overlays:', fieldValues.overlayId);
```

#### `getRecordedImageLegacy(deviceId, timestamp, type = 'preview')` ⚠️ Deprecated
Legacy method for backward compatibility. Use `getRecordedImage` instead.

**Parameters:**
- `deviceId` (string): The ID of the device (camera)
- `timestamp` (string): ISO 8601 timestamp for the image
- `type` (string, optional): The type of image to fetch ('preview' or 'main', default: 'preview')

**Returns:** Promise<Object>:
- `image` (string|null): Base64 encoded image data
- `timestamp` (string|null): Image timestamp
- `prevToken` (string|null): Previous token for caching

### Utility Methods

#### `arrayBufferToBase64(buffer)`
Converts ArrayBuffer to base64 string for image processing.

**Parameters:**
- `buffer` (ArrayBuffer): The array buffer to convert

**Returns:** string - Base64 string

## Media Session Service

The Media Session Service manages media session cookies required for accessing media streams and URLs returned by the Media Service.

### Methods

#### `getMediaSession()`
Retrieves the media session URL for setting session cookies.

**Returns:** Promise<Object> - Media session URL response

**Example:**
```javascript
const session = await mediaSessionService.getMediaSession();
console.log('Session URL:', session.url);
```

#### `initializeMediaSession()`
Initializes media session cookie by calling the session URL. This method fetches the session URL and makes a request to set the cookie automatically.

**Returns:** Promise<boolean> - True if session was successfully initialized

**Example:**
```javascript
try {
  await mediaSessionService.initializeMediaSession();
  console.log('Media session initialized');
  // Now you can access media URLs that require session cookies
} catch (error) {
  console.error('Failed to initialize media session:', error);
}
```

#### `getMediaSessionUrl()`
Gets the media session URL for manual redirection or processing.

**Returns:** Promise<string> - The session URL for manual redirection

**Example:**
```javascript
const sessionUrl = await mediaSessionService.getMediaSessionUrl();
window.location.href = sessionUrl; // Manual redirect
```

#### `isMediaSessionActive(testMediaUrl = null)`
Checks if media session is likely active by testing access to a media endpoint.

**Parameters:**
- `testMediaUrl` (string, optional): A media URL to test

**Returns:** Promise<boolean> - True if session appears to be active

**Example:**
```javascript
const mediaUrl = 'https://media.eagleeyenetworks.com/stream/video.flv';
const isActive = await mediaSessionService.isMediaSessionActive(mediaUrl);
if (!isActive) {
  await mediaSessionService.initializeMediaSession();
}
```

### Media Session Workflow

1. **Initialize Session**: Call `initializeMediaSession()` before accessing media URLs
2. **Access Media**: Use media URLs returned by Media Service methods
3. **Check Status**: Use `isMediaSessionActive()` to verify session validity
4. **Re-initialize**: Call `initializeMediaSession()` again if session expires

**Example Complete Workflow:**
```javascript
// Initialize media session
await mediaSessionService.initializeMediaSession();

// Get media intervals
const mediaList = await mediaService.listMedia({
  deviceId: 'camera123',
  type: 'preview',
  mediaType: 'video',
  startTimestamp__gte: '2023-01-01T00:00:00Z',
  include: ['flvUrl']
});

// Access the media URL (session cookie will be included automatically)
const videoUrl = mediaList.results[0].flvUrl;
```

## User Service

The User Service provides functionality to interact with EEN User APIs.

### Methods

#### `getUserProfile()`
Retrieves the current user's profile information.

**Returns:** Promise<Object> - User profile data

## Error Handling

All services implement consistent error handling:

1. Authentication errors are thrown when the user is not authenticated
2. Configuration errors are thrown when required settings are missing
3. API errors include detailed error messages from the server
4. Network errors are properly caught and logged

## Security

All API requests:
- Require authentication via Bearer token
- Validate URL schemes before making requests
- Use HTTPS for all communications
- Include proper headers for content types
- Handle sensitive data appropriately

## Best Practices

1. Always check authentication status before making requests
2. Use appropriate error handling for all API calls
3. Include proper content types in requests
4. Handle pagination for list endpoints
5. Use query parameters for filtering and sorting
6. Implement proper caching strategies for media content

## Measurements Service

The Measurements Service provides functionality to interact with EEN Measurements APIs for managing sensor measurements and their data.

### Methods

#### `getMeasurementById(measurementId, include = [])`
Retrieves measurement details by ID.

**Parameters:**
- `measurementId` (string): The ID of the measurement to fetch
- `include` (Array<string>, optional): Fields to include (measurementProperties, lastSample, measurementThreshold, locationSummary, sensorSummary)

**Returns:** Promise<Object> - Measurement details

#### `listMeasurements(options = {})`
Retrieves a paginated list of measurements.

**Parameters:**
- `options` (Object, optional):
  - `parentId__in` (Array<string>): List of Parent IDs to filter on
  - `locationId__in` (Array<string>): List of Location IDs to filter on
  - `cameraId__in` (Array<string>): List of Camera IDs to filter on
  - `id__in` (Array<string>): List of Measurement IDs to filter on
  - `preferred` (boolean): Filter by preferred measurements
  - `propertyType` (string): Filter by property type
  - `thresholdLevel` (string): Filter by threshold level
  - `q` (string): Text search query
  - `qRelevance__gte` (number): Minimum similarity threshold for text search (0-1)
  - `include` (Array<string>): Fields to include in response
  - `sort` (Array<string>): Sorting options (e.g., ['+name', '-qRelevance', '+propertyType'])
  - `pageToken` (string): Page token for pagination
  - `pageSize` (number): Number of results per page

**Returns:** Promise<Object> - Paginated list of measurements

#### `updateMeasurement(measurementId, updateData)`
Updates an existing measurement.

**Parameters:**
- `measurementId` (string): The ID of the measurement to update
- `updateData` (Object):
  - `name` (string, optional): New name
  - `notes` (string, optional): New notes
  - `preferred` (boolean, optional): New preferred status
  - `primaryCameraId` (string, optional): New primary camera ID
  - `measurementProperties` (Object, optional): New measurement properties

**Returns:** Promise<void>

#### `listMeasurementsFieldValues(options = {})`
Retrieves available field values for measurements (useful for filtering).

**Parameters:**
- `options` (Object, optional):
  - `include` (Array<string>): Fields to include in response (location)
  - `preferred` (boolean): Filter by preferred measurements

**Returns:** Promise<Object> - Available field values

#### `postSensorThresholdEvent(eventData)`
Posts a sensor threshold event (internal endpoint).

**Parameters:**
- `eventData` (Object): Sensor threshold event data

**Returns:** Promise<void>

## Sensor Gateways Service

The Sensor Gateways Service provides functionality to interact with EEN Sensor Gateway APIs for managing sensor gateway devices.

### Methods

#### `listSensorGateways(options = {})`
Retrieves a paginated list of sensor gateways.

**Parameters:**
- `options` (Object, optional):
  - `locationId__in` (Array<string>): List of Location IDs to filter on
  - `id__in` (Array<string>): List of Sensor Gateway IDs to filter on
  - `q` (string): Text search query
  - `qRelevance__gte` (number): Minimum similarity threshold (0-1)
  - `include` (Array<string>): Fields to include in response
  - `sort` (Array<string>): Sort fields
  - `pageToken` (string): Pagination token
  - `pageSize` (number): Number of items per page

**Returns:** Promise<Object> - Paginated response with sensor gateways

#### `getSensorGateway(sensorGatewayId, include = [])`
Retrieves a specific sensor gateway by ID.

**Parameters:**
- `sensorGatewayId` (string): The ID of the sensor gateway
- `include` (Array<string>, optional): Fields to include in response

**Returns:** Promise<Object> - Sensor gateway details

#### `createSensorGateway(data)`
Creates a new sensor gateway.

**Parameters:**
- `data` (Object):
  - `name` (string): Name of the sensor gateway
  - `connectId` (string): Connect ID for the sensor gateway
  - `locationId` (string, optional): Optional location ID

**Returns:** Promise<Object> - Created sensor gateway

#### `updateSensorGateway(sensorGatewayId, data)`
Updates an existing sensor gateway.

**Parameters:**
- `sensorGatewayId` (string): The ID of the sensor gateway to update
- `data` (Object):
  - `name` (string, optional): New name
  - `notes` (string, optional): New notes
  - `locationId` (string, optional): New location ID
  - `timeZone` (Object, optional): New timezone settings

**Returns:** Promise<void>

#### `deleteSensorGateway(sensorGatewayId)`
Deletes a sensor gateway.

**Parameters:**
- `sensorGatewayId` (string): The ID of the sensor gateway to delete

**Returns:** Promise<void>

## Sensor Summary Service

The Sensor Summary Service provides functionality to retrieve sensor summaries with aggregated data.

### Methods

#### `listSensorSummary(options = {})`
Retrieves sensor summaries visible to the current user.

**Parameters:**
- `options` (Object, optional):
  - `preferred` (boolean): If true, only preferred measurements are returned. If false, only non-preferred. If omitted, all are returned.

**Returns:** Promise<Object> - Paginated response with sensor summaries 