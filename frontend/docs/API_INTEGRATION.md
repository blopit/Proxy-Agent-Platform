# API Integration Guide

## 🔌 Overview

This guide covers all API integrations for the ADHD Task Management mobile frontend.

**API Client Location**: `src/lib/api.ts`

**Base URL**: `http://localhost:8000` (dev) or `process.env.NEXT_PUBLIC_API_URL`

---

## 🏗️ API Client Architecture

### API Client Setup

```typescript
// src/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const apiClient = {
  // Task operations
  getTasks,
  createTask,
  updateTask,
  deleteTask,

  // Capture operations
  quickCapture,

  // Energy tracking
  getEnergyLevel,
  updateEnergyLevel,

  // Progress/gamification
  getProgressStats,
  updateProgress,

  // Focus management
  getFocusSession,
  startFocusSession
}
```

### Environment Variables

Create `.env.local` in frontend root:

```bash
# API Base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

---

## 📋 Core API Endpoints

### 1. Quick Capture (Primary Capture Mode API)

**Endpoint**: `POST /api/v1/mobile/quick-capture`

**Purpose**: Natural language task capture with AI decomposition

**Request**:
```typescript
interface QuickCaptureRequest {
  text: string;              // Natural language input
  user_id: string;          // User identifier
  voice_input?: boolean;    // Was this voice input?
  auto_mode?: boolean;      // Auto AI processing?
  ask_for_clarity?: boolean; // Request clarification?
  agent_type?: string;      // 'capture' or 'search'
  agent_name?: string;      // Agent display name
}

// Usage
const response = await apiClient.quickCapture({
  text: 'Buy groceries and clean the house',
  user_id: 'mobile-user',
  voice_input: false,
  auto_mode: true,
  ask_for_clarity: false
})
```

**Response**:
```typescript
interface QuickCaptureResponse {
  task: Task;                    // Created task
  micro_steps: MicroStep[];      // Decomposed steps
  xp_earned?: number;            // XP awarded
  message: string;               // Success message
  clarifications?: Clarification[]; // If ask_for_clarity=true
}

interface Task {
  task_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  estimated_hours?: number;
  tags?: string[];
  is_digital?: boolean;
  due_date?: string;
  created_at?: string;
}

interface MicroStep {
  step_id: string;
  description: string;
  short_label: string;
  detail?: string;
  estimated_minutes: number;
  leaf_type: 'DIGITAL' | 'HUMAN';
  icon?: string;
  tags?: string[];              // CHAMPS tags

  // Hierarchy fields
  parent_step_id?: string | null;
  level: number;
  is_leaf: boolean;
  decomposition_state: 'atomic' | 'composite';
}
```

**Example Usage in Component**:
```typescript
const submitChat = async () => {
  setIsProcessing(true)

  try {
    const { apiClient } = await import('@/lib/api')

    const response = await apiClient.quickCapture({
      text: taskText,
      user_id: 'mobile-user',
      voice_input: wasVoiceInput,
      auto_mode: autoMode
    })

    // Display captured task
    setCapturedTask(response)

    // Show success celebration
    setShowCelebration(true)

    // Update XP if earned
    if (response.xp_earned) {
      setXp(prev => prev + response.xp_earned!)
    }

    // Trigger task list refresh
    setRefreshTrigger(prev => prev + 1)

  } catch (error) {
    console.error('Capture failed:', error)
    // Show error toast
  } finally {
    setIsProcessing(false)
  }
}
```

---

### 2. Get Tasks (Scout/Hunter Modes)

**Endpoint**: `GET /api/v1/tasks`

**Purpose**: Fetch tasks with filtering and pagination

**Request**:
```typescript
interface GetTasksRequest {
  user_id: string;
  limit?: number;              // Max tasks to return (default: 50)
  status?: string;             // Comma-separated: 'pending,in_progress'
  priority?: string;           // 'high', 'medium', 'low'
  is_digital?: boolean;
  due_before?: string;         // ISO date
  tags?: string;               // Comma-separated tags
}

// Usage
const tasks = await apiClient.getTasks({
  user_id: 'mobile-user',
  limit: 100,
  status: 'pending,in_progress'
})
```

**Response**:
```typescript
interface GetTasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
}
```

**Example Usage (Scout Mode)**:
```typescript
const fetchTasks = async () => {
  setIsLoading(true)

  try {
    const response = await fetch(
      `${API_URL}/api/v1/tasks?limit=100&user_id=mobile-user`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch tasks')
    }

    const data = await response.json()
    setTasks(data.tasks || data || [])

  } catch (err) {
    console.warn('Tasks not available:', err)
    setTasks([])
  } finally {
    setIsLoading(false)
  }
}
```

---

### 3. Energy Tracking (Mender Mode)

**Endpoint**: `GET /api/v1/energy/current-level`

**Purpose**: Get user's current energy level with trends

**Request**:
```typescript
const energyData = await apiClient.getEnergyLevel('mobile-user')
```

**Response**:
```typescript
interface EnergyResponse {
  user_id: string;
  energy_level: number;        // 0-10 scale
  current_level?: number;      // Alias for energy_level
  trend?: 'rising' | 'falling' | 'stable';
  predicted_next_hour?: number;
  last_updated: string;
}
```

**Example Usage (Mender Mode)**:
```typescript
const fetchEnergyData = async () => {
  try {
    const { apiClient } = await import('@/lib/api')
    const energyData = await apiClient.getEnergyLevel('mobile-user')

    // Backend returns 0-10 scale, convert to percentage
    const energyLevel = energyData.energy_level || energyData.current_level || 7.2
    const energyPercentage = Math.round(energyLevel * 10)

    setEnergy(energyPercentage)

  } catch (error) {
    console.warn('Energy endpoint not available, using defaults')
  }
}
```

---

### 4. Progress Stats (Mapper Mode)

**Endpoint**: `GET /api/v1/gamification/progress/{user_id}`

**Purpose**: Get user progress (XP, level, streaks)

**Request**:
```typescript
const stats = await apiClient.getProgressStats('mobile-user')
```

**Response**:
```typescript
interface ProgressStatsResponse {
  user_id: string;
  level: number;
  total_xp: number;
  current_streak?: number;
  active_days_streak?: number;  // Alias for current_streak
  engagement_score?: number;     // Alternative metric
  tasks_completed_today?: number;
  tasks_completed_total?: number;
}
```

**Example Usage (Mapper Mode)**:
```typescript
const fetchProgressData = async () => {
  try {
    const { apiClient } = await import('@/lib/api')
    const stats = await apiClient.getProgressStats('mobile-user')

    // Handle different response formats
    if (stats.active_days_streak !== undefined) {
      setStreakDays(stats.active_days_streak)
    } else if (stats.current_streak !== undefined) {
      setStreakDays(stats.current_streak)
    }

    // Map engagement score to level (1-10 scale)
    if (stats.engagement_score !== undefined) {
      setLevel(Math.floor(stats.engagement_score) || 1)
      setXp(Math.floor(stats.engagement_score * 1000) || 0)
    } else {
      setXp(stats.total_xp || 0)
      setLevel(stats.level || 1)
    }

  } catch (error) {
    console.warn('Progress endpoint not available, using defaults')
  }
}
```

---

## 🔄 Real-time Updates (WebSocket)

**Location**: `src/hooks/useWebSocket.ts`

**Status**: Currently disabled in production, but available

**Endpoint**: `ws://localhost:8000/ws`

### WebSocket Hook

```typescript
import { useWebSocket } from '@/hooks/useWebSocket'

const { isConnected } = useWebSocket({
  userId: 'mobile-user',
  onMessage: (message) => {
    console.log('WebSocket message:', message)

    // Handle different message types
    switch (message.type) {
      case 'task_update':
        setRefreshTrigger(prev => prev + 1)
        break

      case 'energy_update':
        if (message.data?.current_level !== undefined) {
          setEnergy(message.data.current_level)
        }
        break

      case 'progress_update':
        if (message.data?.total_xp !== undefined) setXp(message.data.total_xp)
        if (message.data?.level !== undefined) setLevel(message.data.level)
        break

      case 'notification':
        console.log('Notification:', message.data)
        break
    }
  },
  onConnect: () => console.log('Connected to WebSocket'),
  onDisconnect: () => console.log('Disconnected from WebSocket'),
  reconnectInterval: 3000,
  maxReconnectAttempts: 5
})
```

**Message Types**:
```typescript
interface WebSocketMessage {
  type: 'task_update' | 'energy_update' | 'progress_update' | 'notification';
  data: any;
  timestamp: string;
}
```

---

## 🛠️ API Client Patterns

### Pattern 1: Loading States

```typescript
const [tasks, setTasks] = useState<Task[]>([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const fetchData = async () => {
  setIsLoading(true)
  setError(null)

  try {
    const response = await apiClient.getTasks({ user_id: 'mobile-user' })
    setTasks(response.tasks)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error')
  } finally {
    setIsLoading(false)
  }
}
```

### Pattern 2: Refresh on Trigger

```typescript
const [refreshTrigger, setRefreshTrigger] = useState(0)

useEffect(() => {
  fetchTasks()
}, [refreshTrigger])

// Trigger refresh from anywhere
const handleTaskUpdate = () => {
  setRefreshTrigger(prev => prev + 1)
}
```

### Pattern 3: Optimistic Updates

```typescript
const handleTaskComplete = async (task: Task) => {
  // Optimistically update UI
  setTasks(prev => prev.filter(t => t.task_id !== task.task_id))

  try {
    await apiClient.updateTask(task.task_id, { status: 'completed' })
    // Success - UI already updated
  } catch (error) {
    // Rollback on error
    setTasks(prev => [...prev, task])
    showErrorToast('Failed to update task')
  }
}
```

### Pattern 4: Graceful Degradation

```typescript
const fetchTasks = async () => {
  try {
    // Try primary endpoint
    const response = await fetch(`${API_URL}/api/v1/tasks?user_id=mobile-user`)

    if (!response.ok) {
      // Fallback to secondary endpoint
      const fallbackResponse = await fetch(`${API_URL}/api/v1/simple-tasks`)
      if (!fallbackResponse.ok) throw new Error('Both endpoints failed')

      const fallbackData = await fallbackResponse.json()
      setTasks(fallbackData.tasks || [])
      return
    }

    const data = await response.json()
    setTasks(data.tasks || [])

  } catch (err) {
    console.warn('API not available, using empty state:', err)
    setTasks([]) // Graceful empty state
  }
}
```

---

## 🔍 Debugging API Calls

### Enable API Logging

```typescript
// Add to api.ts
const API_DEBUG = process.env.NEXT_PUBLIC_API_DEBUG === 'true'

const apiClient = {
  async quickCapture(request: QuickCaptureRequest) {
    if (API_DEBUG) {
      console.log('[API] Quick Capture Request:', request)
    }

    const response = await fetch(`${API_URL}/api/v1/mobile/quick-capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    })

    const data = await response.json()

    if (API_DEBUG) {
      console.log('[API] Quick Capture Response:', data)
    }

    return data
  }
}
```

### Network Inspector

Use browser DevTools Network tab to inspect:
1. Request URL
2. Request headers
3. Request payload
4. Response status
5. Response body
6. Timing information

---

## 🧪 Testing API Integration

### Mock API Responses

```typescript
// __mocks__/api.ts
export const apiClient = {
  quickCapture: jest.fn().mockResolvedValue({
    task: mockTask,
    micro_steps: mockMicroSteps,
    xp_earned: 15,
    message: 'Task captured successfully'
  }),

  getTasks: jest.fn().mockResolvedValue({
    tasks: mockTasks,
    total: 10
  }),

  getEnergyLevel: jest.fn().mockResolvedValue({
    energy_level: 7.2,
    trend: 'rising'
  })
}
```

### Test API Errors

```typescript
test('handles API errors gracefully', async () => {
  const { apiClient } = await import('@/lib/api')

  apiClient.getTasks = jest.fn().mockRejectedValue(
    new Error('Network error')
  )

  render(<ScoutMode />)

  await waitFor(() => {
    expect(screen.getByText(/no tasks/i)).toBeInTheDocument()
  })
})
```

---

## 🚨 Error Handling

### Error Response Format

```typescript
interface APIError {
  error: string;
  detail?: string;
  status_code: number;
}
```

### Error Handling Pattern

```typescript
const handleAPIError = async (error: unknown) => {
  if (error instanceof Response) {
    const errorData = await error.json()
    return {
      message: errorData.error || 'Unknown error',
      detail: errorData.detail,
      code: error.status
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 500
    }
  }

  return {
    message: 'Unknown error occurred',
    code: 500
  }
}

// Usage
try {
  await apiClient.quickCapture(request)
} catch (error) {
  const apiError = await handleAPIError(error)
  showToast(apiError.message, { type: 'error' })
}
```

---

## 📊 API Performance Optimization

### Request Caching

```typescript
// Cache API responses for 1 minute
const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 60 * 1000 // 1 minute

const getCachedOrFetch = async (key: string, fetchFn: () => Promise<any>) => {
  const cached = cache.get(key)

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const data = await fetchFn()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}

// Usage
const tasks = await getCachedOrFetch('tasks-mobile-user', () =>
  apiClient.getTasks({ user_id: 'mobile-user' })
)
```

### Request Debouncing

```typescript
import { debounce } from 'lodash'

const debouncedSearch = useMemo(
  () => debounce(async (query: string) => {
    const results = await apiClient.searchTasks(query)
    setSearchResults(results)
  }, 300),
  []
)

// Usage in search input
onChange={(e) => debouncedSearch(e.target.value)}
```

---

## 📝 API Response Transformations

### Transform Backend → Frontend

```typescript
// Backend returns 0-10 scale, frontend uses 0-100 percentage
const transformEnergyResponse = (response: EnergyResponse) => {
  return {
    energy: Math.round(response.energy_level * 10), // 0-100
    trend: response.trend || 'stable',
    predicted: response.predicted_next_hour
      ? Math.round(response.predicted_next_hour * 10)
      : undefined
  }
}

// Usage
const rawData = await apiClient.getEnergyLevel('mobile-user')
const energyData = transformEnergyResponse(rawData)
setEnergy(energyData.energy)
```

### Normalize Task Data

```typescript
const normalizeTask = (task: any): Task => {
  return {
    task_id: task.task_id || task.id?.toString() || `task-${Date.now()}`,
    title: task.title || 'Untitled Task',
    description: task.description || task.desc,
    status: task.status || 'pending',
    priority: task.priority || 'medium',
    estimated_hours: task.estimated_hours || 0.25,
    tags: task.tags || [],
    is_digital: task.is_digital || false,
    due_date: task.due_date,
    created_at: task.created_at
  }
}
```

---

## 🔐 API Security

### Never Expose Secrets in Frontend

```bash
# ❌ BAD - Secret in frontend code
const API_KEY = 'secret-key-123'

# ✅ GOOD - Use environment variable (server-side only)
# Keep API keys in backend
```

### CORS Configuration

Backend should allow frontend origin:

```python
# Backend CORS settings
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📚 API Documentation References

- **Backend API Schemas**: `/API_schemas/`
- **OpenAPI Docs**: `http://localhost:8000/docs` (when backend running)
- **API Client Implementation**: `frontend/src/lib/api.ts`

---

**Last Updated**: 2025-10-25

**Next**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
