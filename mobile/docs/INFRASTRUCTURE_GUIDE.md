# Mobile Infrastructure Guide

**Last Updated**: November 15, 2025
**Status**: Complete - Production Ready

This guide documents the long-term infrastructure patterns for the Proxy Agent mobile app, covering offline support, push notifications, performance optimization, and app store deployment.

---

## 📚 Table of Contents

1. [Offline Support](#offline-support)
2. [Push Notifications](#push-notifications)
3. [Performance Optimization](#performance-optimization)
4. [App Store Deployment](#app-store-deployment)
5. [Best Practices](#best-practices)

---

## 🔌 Offline Support

### Overview

The app supports full offline functionality with automatic sync when connectivity is restored.

### Components

#### 1. StorageManager

**Location**: `/mobile/src/services/storage/StorageManager.ts`

Type-safe AsyncStorage wrapper with namespacing and batch operations.

```tsx
import { StorageManager, taskStorage } from '@/services/storage/StorageManager';

// Using pre-configured instance
await taskStorage.set('myTask', { title: 'Complete project' });
const task = await taskStorage.get<Task>('myTask');

// Custom namespace
const customStorage = new StorageManager('custom');
await customStorage.multiSet({
  key1: 'value1',
  key2: { complex: 'object' },
});
```

**Features**:
- ✅ Type-safe get/set operations
- ✅ Automatic JSON serialization
- ✅ Batch operations (multiGet, multiSet)
- ✅ Namespace isolation
- ✅ Error handling

**Pre-configured instances**:
- `userStorage` - User data
- `taskStorage` - Task data
- `cacheStorage` - Cache data
- `settingsStorage` - App settings

---

#### 2. CacheManager

**Location**: `/mobile/src/services/cache/CacheManager.ts`

Smart caching with TTL, LRU eviction, and invalidation patterns.

```tsx
import { CacheManager, apiCache } from '@/services/cache/CacheManager';

// Get or fetch pattern
const tasks = await apiCache.getOrSet(
  'tasks_list',
  async () => {
    const response = await fetch('/api/tasks');
    return response.json();
  },
  300000 // 5 minutes TTL
);

// Invalidate pattern
await apiCache.invalidate(/^tasks_/); // Invalidate all task caches

// Custom cache
const customCache = new CacheManager({
  ttl: 600000, // 10 minutes
  maxSize: 50,
  persistent: true,
  namespace: 'my_cache',
});
```

**Features**:
- ✅ Time-to-live (TTL) expiration
- ✅ LRU eviction when full
- ✅ Memory + persistent storage
- ✅ Pattern-based invalidation
- ✅ Cache statistics

**Pre-configured caches**:
- `apiCache` - API responses (5 min TTL)
- `imageCache` - Image data (1 hour TTL)
- `userDataCache` - User data (10 min TTL)

---

#### 3. SyncQueue

**Location**: `/mobile/src/services/sync/SyncQueue.ts`

Queue offline operations with automatic retry and exponential backoff.

```tsx
import { syncQueue } from '@/services/sync/SyncQueue';

// Register handlers
syncQueue.registerHandler('createTask', async (payload: unknown) => {
  const task = payload as Task;
  await api.createTask(task);
});

syncQueue.registerHandler('updateTask', async (payload: unknown) => {
  const { id, data } = payload as { id: string; data: Partial<Task> };
  await api.updateTask(id, data);
});

// Queue operations (will execute when online)
await syncQueue.enqueue('createTask', taskData, {
  maxRetries: 5,
  dedupeKey: `task_${taskData.id}`, // Prevent duplicates
});

// Get queue stats
const stats = syncQueue.getStats();
console.log(`${stats.total} pending operations`);
```

**Features**:
- ✅ Automatic retry with exponential backoff
- ✅ Persistent queue across app restarts
- ✅ Network status monitoring
- ✅ Operation deduplication
- ✅ Configurable retry limits

**Retry schedule**: 1s → 2s → 4s → 8s → 16s

---

#### 4. NetworkMonitor

**Location**: `/mobile/src/services/network/NetworkMonitor.ts`

Real-time network status monitoring.

```tsx
import { networkMonitor } from '@/services/network/NetworkMonitor';

// Subscribe to network changes
const unsubscribe = networkMonitor.subscribe((status) => {
  if (status.isConnected) {
    console.log('Online!', status.type); // wifi, cellular, etc.
  } else {
    console.log('Offline');
  }
});

// Check current status
if (networkMonitor.isOnline()) {
  // Perform online-only operations
}

if (networkMonitor.isWifi()) {
  // Download large files
}

// Wait for connection
const isOnline = await networkMonitor.waitForConnection(30000); // 30 second timeout
```

**Features**:
- ✅ Real-time status updates
- ✅ Connection type detection (WiFi, cellular, etc.)
- ✅ Internet reachability check
- ✅ Observable pattern
- ✅ Connection waiting

---

### Offline-First Pattern

```tsx
// Example: Offline-first task creation
async function createTask(task: Task) {
  // 1. Save locally immediately
  await taskStorage.set(`task_${task.id}`, task);

  // 2. Update UI optimistically
  updateTaskList(task);

  // 3. Queue for sync
  await syncQueue.enqueue('createTask', task, {
    dedupeKey: `create_task_${task.id}`,
  });

  // Sync will happen automatically when online
}
```

---

## 🔔 Push Notifications

### Overview

Full push notification support with local scheduling and deep linking.

### Components

#### 1. NotificationService

**Location**: `/mobile/src/services/notifications/NotificationService.ts`

Complete notification management system.

```tsx
import { notificationService } from '@/services/notifications/NotificationService';

// Initialize (call once on app start)
await notificationService.initialize();

// Get push token (for backend)
const pushToken = notificationService.getPushToken();
await api.registerPushToken(pushToken);

// Schedule local notification
await notificationService.scheduleLocal(
  'Task Reminder',
  'Time to work on your project!',
  3600, // 1 hour from now (in seconds)
  { type: 'task_reminder', taskId: '123' }
);

// Schedule task reminder
await notificationService.scheduleTaskReminder(
  'task-123',
  'Complete documentation',
  new Date('2025-11-15T14:00:00')
);

// Schedule focus break
await notificationService.scheduleFocusBreak('session-456', 25); // 25 minutes

// Cancel notification
await notificationService.cancelNotification(notificationId);

// Listen for notifications
notificationService.addReceivedListener((notification) => {
  console.log('Received:', notification);
});

notificationService.addResponseListener((response) => {
  const data = response.notification.request.content.data as NotificationData;

  if (data.type === 'task_reminder') {
    navigation.navigate('Task', { id: data.taskId });
  }
});
```

**Features**:
- ✅ Push notification registration
- ✅ Local notification scheduling
- ✅ Deep linking support
- ✅ Badge management
- ✅ Android notification channels

**Notification types**:
- `task_reminder` - Task reminders
- `focus_break` - Focus session breaks
- `daily_summary` - Daily progress
- `achievement` - Achievement unlocks

---

#### 2. NotificationPermissions

**Location**: `/mobile/src/services/notifications/NotificationPermissions.tsx`

React components for permission management.

```tsx
import {
  NotificationPermissionGate,
  useNotificationPermission,
} from '@/services/notifications/NotificationPermissions';

// Gate pattern (wraps features requiring notifications)
function TaskRemindersScreen() {
  return (
    <NotificationPermissionGate>
      <TaskRemindersList />
    </NotificationPermissionGate>
  );
}

// Hook pattern (manual control)
function SettingsScreen() {
  const { hasPermission, requestPermission } = useNotificationPermission();

  return (
    <View>
      {!hasPermission && (
        <Button title="Enable Notifications" onPress={requestPermission} />
      )}
    </View>
  );
}
```

**Features**:
- ✅ User-friendly permission UI
- ✅ Settings deep link
- ✅ Re-request capabilities
- ✅ Permission status tracking

---

### Notification Flow

```
1. App Launch
   ↓
2. Initialize NotificationService
   ↓
3. Request Permissions (if needed)
   ↓
4. Register Push Token → Send to Backend
   ↓
5. Schedule Local Notifications
   ↓
6. Listen for User Interactions
```

---

## ⚡ Performance Optimization

### Overview

Comprehensive performance optimization utilities for production-ready apps.

### Components

#### 1. PerformanceMonitor

**Location**: `/mobile/src/utils/performance/PerformanceMonitor.ts`

Track and log performance metrics.

```tsx
import { performanceMonitor } from '@/utils/performance/PerformanceMonitor';

// Manual measurements
performanceMonitor.startMeasure('api_call');
const data = await fetchData();
performanceMonitor.endMeasure('api_call'); // Logs if > 1000ms

// Async wrapper
const data = await performanceMonitor.measureAsync(
  'fetchTasks',
  () => api.getTasks(),
  { userId: '123' } // Optional metadata
);

// Sync wrapper
const result = performanceMonitor.measureSync('computation', () => {
  return expensiveComputation();
});

// Get report
const report = performanceMonitor.getReport();
console.log('Average API call:', report.averages.api_call);

// React hook
import { useRenderPerformance } from '@/utils/performance/PerformanceMonitor';

function MyComponent() {
  useRenderPerformance('MyComponent'); // Tracks render time
  return <View>...</View>;
}

// HOC
import { withPerformanceMonitoring } from '@/utils/performance/PerformanceMonitor';

export default withPerformanceMonitoring(MyComponent);
```

**Features**:
- ✅ Start/end measurements
- ✅ Async/sync wrappers
- ✅ Performance reports
- ✅ Slow operation warnings
- ✅ React integration

---

#### 2. ImageOptimizer

**Location**: `/mobile/src/utils/performance/ImageOptimizer.ts`

Optimized image loading with progressive loading and caching.

```tsx
import { OptimizedImage, preloadImages } from '@/utils/performance/ImageOptimizer';

// Basic usage
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  width={300}
  height={200}
  blurhash="LGF5]+Yk^6#M@-5c,1J5@[or[Q6."
  priority="high"
/>

// Preload images
await preloadImages([
  'https://example.com/image1.jpg',
  'https://example.com/image2.jpg',
]);

// Clear cache
await clearImageCache();
```

**Features**:
- ✅ Progressive loading
- ✅ Blurhash placeholders
- ✅ Priority levels
- ✅ Automatic caching
- ✅ Error handling

---

#### 3. MemoizationHelpers

**Location**: `/mobile/src/utils/performance/MemoizationHelpers.ts`

React optimization utilities.

```tsx
import {
  useMemoDeep,
  useCallbackDeep,
  useDebounce,
  useThrottle,
  usePrevious,
  useMemoizedObject,
} from '@/utils/performance/MemoizationHelpers';

function MyComponent({ data }) {
  // Deep memo (compares object content, not reference)
  const processedData = useMemoDeep(
    () => expensiveComputation(data),
    [data]
  );

  // Deep callback
  const handleClick = useCallbackDeep(
    () => console.log(data),
    [data]
  );

  // Debounced value (for search inputs)
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Only searches after 500ms of no typing
    api.search(debouncedSearch);
  }, [debouncedSearch]);

  // Throttled value (for scroll handlers)
  const throttledScroll = useThrottle(scrollPosition, 100);

  // Previous value (for comparison)
  const prevData = usePrevious(data);

  useEffect(() => {
    if (data !== prevData) {
      console.log('Data changed from', prevData, 'to', data);
    }
  }, [data, prevData]);

  // Memoized object (prevents reference changes)
  const config = useMemoizedObject({
    apiUrl,
    timeout,
    headers,
  });
}
```

**Features**:
- ✅ Deep/shallow equality checks
- ✅ Debounce/throttle hooks
- ✅ Previous value tracking
- ✅ Memoized object/array creation
- ✅ Safe setState (only if mounted)

---

### Performance Best Practices

```tsx
// ✅ Good: Memoized expensive computation
const processedData = useMemo(() => {
  return data.map(item => expensiveTransform(item));
}, [data]);

// ❌ Bad: Recomputes on every render
const processedData = data.map(item => expensiveTransform(item));

// ✅ Good: Debounced search
const debouncedSearch = useDebounce(searchTerm, 500);

// ❌ Bad: Searches on every keystroke
useEffect(() => {
  api.search(searchTerm);
}, [searchTerm]);

// ✅ Good: Optimized images
<OptimizedImage source={{ uri }} width={300} height={200} />

// ❌ Bad: Unoptimized images
<Image source={{ uri }} style={{ width: 300, height: 200 }} />
```

---

## 🚀 App Store Deployment

### Overview

Complete deployment infrastructure for iOS App Store and Google Play Store.

### Configuration Files

#### 1. Production App Config

**Location**: `/mobile/app.config.production.ts`

Production-specific Expo configuration.

```bash
# Build with production config
APP_ENV=production eas build --platform ios --profile production
```

**Features**:
- iOS bundle ID, build number, permissions
- Android package name, version code, permissions
- Deep linking configuration
- Push notification setup
- Store-specific optimizations

---

#### 2. EAS Build Configuration

**Location**: `/mobile/eas.json`

Enhanced with environment variables and auto-increment.

```bash
# Development build (with dev client)
eas build --platform ios --profile development

# Preview build (internal testing)
eas build --platform all --profile preview

# Production build (for app stores)
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

**Build profiles**:
- `development` - Dev client, local testing
- `preview` - Internal testing (TestFlight/Play Internal)
- `production` - Store distribution

---

#### 3. Environment Variables

**Files**:
- `/mobile/.env.production` - Production environment
- `/mobile/.env.staging` - Staging environment

```bash
# Production
API_URL=https://api.proxyagent.app
ENABLE_ANALYTICS=true
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
SENTRY_DSN=https://xxx@sentry.io/project

# Staging
API_URL=https://staging-api.proxyagent.app
ENABLE_DEBUG_TOOLS=true
```

**Access in code**:

```tsx
import { config } from '@/config/environment';

console.log(config.apiUrl); // https://api.proxyagent.app
console.log(config.environment); // 'production'
console.log(config.features.analytics); // true
```

---

#### 4. Build Scripts

**Prebuild**: `/mobile/scripts/prebuild.sh`

```bash
# Runs before EAS build
- Validates environment variables
- Installs dependencies
- Type checks code
- Lints code
- Cleans build artifacts
```

**Postbuild**: `/mobile/scripts/postbuild.sh`

```bash
# Runs after successful build
- Uploads source maps to Sentry
- Generates build report
- Notifies team (Slack, etc.)
```

---

### Deployment Workflow

```
1. Update version in app.config.ts
   ↓
2. Run prebuild script
   ↓
3. Build with EAS
   ├─ iOS: eas build --platform ios --profile production
   └─ Android: eas build --platform android --profile production
   ↓
4. Download builds and test
   ↓
5. Submit to stores
   ├─ iOS: eas submit --platform ios
   └─ Android: eas submit --platform android
   ↓
6. Monitor release in stores
```

---

### Store Submission Checklist

**iOS (App Store)**:
- [ ] Valid Apple Developer account
- [ ] App Store Connect app created
- [ ] App icons (1024x1024)
- [ ] Screenshots (all required sizes)
- [ ] Privacy policy URL
- [ ] App description and keywords
- [ ] IDFA usage (if using ads/analytics)

**Android (Google Play)**:
- [ ] Google Play Console account
- [ ] Service account key (for automated submission)
- [ ] App icons (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (all required sizes)
- [ ] Privacy policy URL
- [ ] App description
- [ ] Content rating questionnaire

---

## ✅ Best Practices

### 1. Offline Support

```tsx
// Always save locally first, sync later
async function createItem(item: Item) {
  // 1. Save locally
  await storage.set(`item_${item.id}`, item);

  // 2. Update UI
  updateUI(item);

  // 3. Queue for sync
  await syncQueue.enqueue('createItem', item);
}
```

### 2. Caching Strategy

```tsx
// Use cache for expensive/frequent operations
const data = await cache.getOrSet(
  'expensive_data',
  () => expensiveOperation(),
  300000 // 5 minutes
);
```

### 3. Notifications

```tsx
// Always check permissions before scheduling
if (await notificationService.getPermissionsStatus()) {
  await notificationService.scheduleLocal(...);
}
```

### 4. Performance

```tsx
// Measure critical paths in production
if (config.features.performanceMonitoring) {
  performanceMonitor.setEnabled(true);
}
```

### 5. Environment Management

```tsx
// Use centralized config
import { config, isProduction } from '@/config/environment';

// Never hardcode environment-specific values
const apiUrl = config.apiUrl; // ✅ Good
const apiUrl = 'https://api.example.com'; // ❌ Bad
```

---

## 📊 Monitoring

### Key Metrics to Track

1. **Offline Queue**:
   - Pending operations count
   - Failed operations count
   - Average sync time

2. **Cache Performance**:
   - Hit rate
   - Miss rate
   - Eviction rate

3. **Notifications**:
   - Delivery rate
   - Interaction rate
   - Permission grant rate

4. **App Performance**:
   - App startup time
   - Screen transition time
   - API response time

---

## 🔗 Resources

- [AsyncStorage Docs](https://react-native-async-storage.github.io/async-storage/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [NetInfo](https://github.com/react-native-netinfo/react-native-netinfo)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [EAS Submit](https://docs.expo.dev/submit/introduction/)

---

**Next Steps**: [↑ Mobile README](../README.md) | [🎨 Design System](./MULTI_THEME_GUIDE.md) | [📚 Storybook Guide](./STORYBOOK_GUIDE.md)
