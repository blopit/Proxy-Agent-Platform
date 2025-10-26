# API Integration Patterns

> **PURPOSE**: Guide for integrating with backend APIs using established patterns.
> **BEFORE MAKING API CALLS**: Review this guide to follow best practices and avoid common mistakes.

## 📋 Table of Contents

- [Core Principles](#core-principles)
- [API Clients](#api-clients)
  - [Main API Client](#main-api-client)
  - [AI API Client](#ai-api-client)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)
- [Loading States](#loading-states)
- [Type Safety](#type-safety)
- [Custom Hooks for API Calls](#custom-hooks-for-api-calls)
- [WebSocket Integration](#websocket-integration)
- [Best Practices](#best-practices)
- [Anti-Patterns](#anti-patterns)

---

## 🎯 Core Principles

### 1. **Always Use API Clients**
Never make raw `fetch()` calls to the backend. Use the centralized API clients.

### 2. **Type Safety First**
All API calls should be typed with TypeScript interfaces.

### 3. **Error Handling Everywhere**
Always wrap API calls in try-catch blocks and handle errors gracefully.

### 4. **Loading States**
Show loading indicators for all async operations.

### 5. **Optimistic Updates**
Update UI immediately, then sync with backend.

---

## 🌐 API Clients

### Main API Client

**Location**: [`src/lib/api.ts`](src/lib/api.ts:1)

The main API client handles all backend communication for tasks, energy, progress, focus, and gamification.

#### Import

```typescript
import { apiClient } from '@/lib/api'
// or import specific types
import type { Task, TasksResponse, QuickCaptureRequest } from '@/lib/api'
```

#### Available Methods

##### **Task Management**

```typescript
// Get tasks with filters
const response = await apiClient.getTasks({
  user_id: 'user-123',
  status: 'active',
  priority: 'high',
  limit: 50,
  offset: 0
})
// Returns: TasksResponse { tasks: Task[], total: number }

// Get single task
const task = await apiClient.getTask('task-123')
// Returns: Task

// Update task
const updatedTask = await apiClient.updateTask('task-123', {
  status: 'completed',
  actual_hours: 2.5
})
// Returns: Task

// Delete task
await apiClient.deleteTask('task-123')
// Returns: void
```

##### **Quick Capture**

```typescript
// Capture task with full breakdown
const result = await apiClient.quickCapture({
  text: 'Deploy new authentication system to production',
  user_id: 'demo-user',
  voice_input: false,
  auto_mode: true,
  ask_for_clarity: false
})
// Returns: QuickCaptureResponse {
//   task: CapturedTask
//   micro_steps: MicroStep[]
//   breakdown: TaskBreakdown
//   needs_clarification: boolean
//   processing_time_ms: number
// }
```

##### **Energy Tracking**

```typescript
// Get current energy level
const energyData = await apiClient.getEnergyLevel('user-123')
// Returns: EnergyData { energy_level: number, trend: string, ... }

// Log energy level
await apiClient.logEnergyLevel('user-123', 75)
// Returns: void
```

##### **Progress & Gamification**

```typescript
// Get progress stats
const stats = await apiClient.getProgressStats('user-123')
// Returns: ProgressStats {
//   tasks_completed_today: number
//   xp_earned_today: number
//   current_streak: number
//   engagement_score: number
//   ...
// }

// Get achievements
const achievements = await apiClient.getAchievements('user-123')
// Returns: Achievement[]

// Get leaderboard
const leaderboard = await apiClient.getLeaderboard()
// Returns: LeaderboardEntry[]
```

##### **Focus Sessions**

```typescript
// Start focus session
const { session_id } = await apiClient.startFocusSession('user-123', 'task-123')
// Returns: { session_id: string }

// End focus session
await apiClient.endFocusSession(session_id)
// Returns: void
```

##### **Health Check**

```typescript
// Check API health
const { status } = await apiClient.healthCheck()
// Returns: { status: 'healthy' | 'degraded' | 'down' }
```

---

### AI API Client

**Location**: [`src/lib/ai-api.ts`](src/lib/ai-api.ts:1)

Handles AI-specific endpoints for task breakdown, categorization, and smart suggestions.

#### Import

```typescript
import { aiApi } from '@/lib/ai-api'
```

#### Available Methods

```typescript
// Break down task into subtasks
const breakdown = await aiApi.breakdownTask('Deploy authentication system')
// Returns: { subtasks: Subtask[], estimated_time: number }

// Categorize task automatically
const category = await aiApi.categorizeTask(task)
// Returns: { category: string, tags: string[] }

// Get smart suggestions
const suggestions = await aiApi.getSuggestions('user-123')
// Returns: Suggestion[]
```

---

## 🔄 Common Patterns

### Pattern 1: Simple API Call in Component

**Use when**: Single API call needed for component

```typescript
'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import type { Task } from '@/lib/api'

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await apiClient.getTasks({
          user_id: 'demo-user',
          status: 'active',
          limit: 50
        })
        setTasks(response.tasks)
      } catch (err) {
        setError(err as Error)
        console.error('Failed to fetch tasks:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {tasks.map(task => (
        <div key={task.task_id}>{task.title}</div>
      ))}
    </div>
  )
}
```

---

### Pattern 2: Custom Hook for API Logic

**Use when**: API logic needs to be reused across components

```typescript
// src/hooks/useTaskList.ts
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import type { Task } from '@/lib/api'

interface UseTaskListOptions {
  userId: string
  status?: string
  autoFetch?: boolean
}

export function useTaskList(options: UseTaskListOptions) {
  const { userId, status = 'active', autoFetch = true } = options

  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTasks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await apiClient.getTasks({
        user_id: userId,
        status,
        limit: 100
      })
      setTasks(response.tasks)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (autoFetch) {
      fetchTasks()
    }
  }, [userId, status, autoFetch])

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks
  }
}

// Usage in component
import { useTaskList } from '@/hooks/useTaskList'

function MyComponent() {
  const { tasks, isLoading, error, refetch } = useTaskList({
    userId: 'demo-user',
    status: 'active'
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      {tasks.map(task => <div key={task.task_id}>{task.title}</div>)}
    </div>
  )
}
```

---

### Pattern 3: Optimistic Updates

**Use when**: Immediate UI feedback needed (e.g., task completion)

```typescript
async function completeTask(taskId: string) {
  // 1. Update UI immediately (optimistic)
  setTasks(prev => prev.map(task =>
    task.task_id === taskId
      ? { ...task, status: 'completed' }
      : task
  ))

  // 2. Show success feedback
  showToast('Task completed!', 'success')

  // 3. Sync with backend
  try {
    await apiClient.updateTask(taskId, { status: 'completed' })
  } catch (error) {
    // 4. Rollback on error
    setTasks(prev => prev.map(task =>
      task.task_id === taskId
        ? { ...task, status: 'active' }
        : task
    ))
    showToast('Failed to complete task', 'error')
  }
}
```

---

### Pattern 4: Parallel API Calls

**Use when**: Multiple independent API calls needed

```typescript
async function loadDashboardData() {
  setIsLoading(true)

  try {
    // Run all API calls in parallel
    const [tasksResponse, energyData, statsData] = await Promise.all([
      apiClient.getTasks({ user_id: 'demo-user', limit: 10 }),
      apiClient.getEnergyLevel('demo-user'),
      apiClient.getProgressStats('demo-user')
    ])

    setTasks(tasksResponse.tasks)
    setEnergy(energyData.energy_level)
    setStats(statsData)
  } catch (error) {
    console.error('Failed to load dashboard:', error)
    setError(error as Error)
  } finally {
    setIsLoading(false)
  }
}
```

---

### Pattern 5: Mutation with Refetch

**Use when**: Creating/updating data that affects list views

```typescript
async function createTask(taskData: Partial<Task>) {
  setIsCreating(true)

  try {
    const newTask = await apiClient.quickCapture({
      text: taskData.title,
      user_id: 'demo-user',
      auto_mode: true
    })

    // Refetch task list to include new task
    await fetchTasks()

    showToast('Task created!', 'success')
    return newTask
  } catch (error) {
    showToast('Failed to create task', 'error')
    throw error
  } finally {
    setIsCreating(false)
  }
}
```

---

## 🚨 Error Handling

### Pattern: Comprehensive Error Handling

```typescript
async function handleApiCall() {
  try {
    const result = await apiClient.getTasks({ user_id: 'demo-user' })
    return result
  } catch (error) {
    // 1. Type guard for Error objects
    if (error instanceof Error) {
      // 2. Log for debugging
      console.error('API Error:', error.message)

      // 3. Show user-friendly message
      if (error.message.includes('Network')) {
        showToast('Connection error. Check your internet.', 'error')
      } else if (error.message.includes('401')) {
        showToast('Session expired. Please log in.', 'error')
      } else {
        showToast('Something went wrong. Please try again.', 'error')
      }

      // 4. Set error state for UI
      setError(error)

      // 5. Re-throw if caller needs to handle
      throw error
    }

    // Handle non-Error objects
    console.error('Unknown error:', error)
    throw new Error('An unexpected error occurred')
  }
}
```

### Error State Display

```typescript
// Error boundary pattern
if (error) {
  return (
    <div style={{
      padding: spacing[4],
      backgroundColor: semanticColors.bg.secondary,
      borderRadius: borderRadius.lg,
      border: `2px solid ${semanticColors.accent.error}`
    }}>
      <h3 style={{ color: semanticColors.accent.error }}>
        Failed to load tasks
      </h3>
      <p style={{ color: semanticColors.text.secondary }}>
        {error.message}
      </p>
      <button onClick={refetch}>Try Again</button>
    </div>
  )
}
```

---

## ⏳ Loading States

### Pattern: Skeleton Loading

```typescript
if (isLoading) {
  return (
    <div>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            height: spacing[16],
            backgroundColor: semanticColors.bg.secondary,
            borderRadius: borderRadius.lg,
            marginBottom: spacing[2],
            animation: 'pulse 1.5s ease-in-out infinite'
          }}
        />
      ))}
    </div>
  )
}
```

### Pattern: Inline Loading Indicator

```typescript
<button
  onClick={handleSubmit}
  disabled={isLoading}
  style={{
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: isLoading
      ? semanticColors.bg.tertiary
      : semanticColors.accent.primary
  }}
>
  {isLoading ? 'Saving...' : 'Save'}
</button>
```

---

## 🔐 Type Safety

### Always Import and Use Types

```typescript
// ✅ GOOD: Typed API calls
import { apiClient } from '@/lib/api'
import type { Task, TasksResponse } from '@/lib/api'

const [tasks, setTasks] = useState<Task[]>([])

async function fetchTasks() {
  const response: TasksResponse = await apiClient.getTasks({
    user_id: 'demo-user'
  })
  setTasks(response.tasks)
}

// ❌ BAD: No types
const [tasks, setTasks] = useState([])

async function fetchTasks() {
  const response = await fetch('/api/v1/tasks')
  const data = await response.json()
  setTasks(data.tasks)
}
```

### Define Custom Types When Needed

```typescript
// Extended type for UI-specific fields
interface TaskWithUI extends Task {
  isExpanded: boolean
  isEditing: boolean
}

const [tasks, setTasks] = useState<TaskWithUI[]>([])
```

---

## 🪝 Custom Hooks for API Calls

### When to Create a Custom Hook

Create a custom hook when:
- API logic is reused across multiple components
- Complex state management needed
- Multiple related API calls
- Need to encapsulate business logic

### Example: useQuickCapture Hook

```typescript
// src/hooks/useQuickCapture.ts
import { useState } from 'react'
import { apiClient } from '@/lib/api'
import type { QuickCaptureRequest, QuickCaptureResponse } from '@/lib/api'

export function useQuickCapture() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [stage, setStage] = useState<'idle' | 'listening' | 'processing' | 'saving'>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [result, setResult] = useState<QuickCaptureResponse | null>(null)

  const capture = async (text: string, options: Partial<QuickCaptureRequest> = {}) => {
    setIsCapturing(true)
    setStage('processing')
    setError(null)

    try {
      const response = await apiClient.quickCapture({
        text,
        user_id: options.user_id || 'demo-user',
        voice_input: options.voice_input || false,
        auto_mode: options.auto_mode ?? true,
        ask_for_clarity: options.ask_for_clarity ?? false
      })

      setStage('saving')
      setResult(response)
      setStage('idle')
      return response
    } catch (err) {
      setError(err as Error)
      setStage('idle')
      throw err
    } finally {
      setIsCapturing(false)
    }
  }

  const reset = () => {
    setStage('idle')
    setError(null)
    setResult(null)
  }

  return {
    capture,
    isCapturing,
    stage,
    error,
    result,
    reset
  }
}

// Usage
import { useQuickCapture } from '@/hooks/useQuickCapture'

function CaptureComponent() {
  const { capture, isCapturing, stage } = useQuickCapture()

  const handleCapture = async () => {
    try {
      const result = await capture('Deploy to production', {
        auto_mode: true
      })
      console.log('Captured:', result.task.title)
    } catch (error) {
      console.error('Capture failed:', error)
    }
  }

  return (
    <button onClick={handleCapture} disabled={isCapturing}>
      {stage === 'processing' ? 'Processing...' : 'Capture'}
    </button>
  )
}
```

---

## 🔌 WebSocket Integration

### Using the WebSocket Hook

**Location**: [`src/hooks/useWebSocket.ts`](src/hooks/useWebSocket.ts:1)

```typescript
import useWebSocket from '@/hooks/useWebSocket'

function RealTimeComponent() {
  const { socket, isConnected, sendMessage } = useWebSocket(
    'ws://localhost:8000/ws/tasks'
  )

  useEffect(() => {
    if (!socket) return

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data)
      console.log('Received:', data)

      // Handle different message types
      if (data.type === 'task_created') {
        setTasks(prev => [...prev, data.task])
      } else if (data.type === 'task_updated') {
        setTasks(prev => prev.map(t =>
          t.task_id === data.task.task_id ? data.task : t
        ))
      }
    }

    socket.addEventListener('message', handleMessage)
    return () => socket.removeEventListener('message', handleMessage)
  }, [socket])

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  )
}
```

---

## ✅ Best Practices

### 1. **Always Use Try-Catch**
```typescript
// ✅ GOOD
try {
  const result = await apiClient.getTasks({ user_id: 'demo-user' })
} catch (error) {
  handleError(error)
}

// ❌ BAD
const result = await apiClient.getTasks({ user_id: 'demo-user' })
```

### 2. **Show Loading States**
```typescript
// ✅ GOOD
const [isLoading, setIsLoading] = useState(false)

async function fetchData() {
  setIsLoading(true)
  try {
    const data = await apiClient.getTasks({ user_id: 'demo-user' })
    setTasks(data.tasks)
  } finally {
    setIsLoading(false)
  }
}

// ❌ BAD
async function fetchData() {
  const data = await apiClient.getTasks({ user_id: 'demo-user' })
  setTasks(data.tasks)
}
```

### 3. **Use TypeScript Types**
```typescript
// ✅ GOOD
import type { Task, TasksResponse } from '@/lib/api'
const [tasks, setTasks] = useState<Task[]>([])

// ❌ BAD
const [tasks, setTasks] = useState([])
```

### 4. **Clean Up Effects**
```typescript
// ✅ GOOD
useEffect(() => {
  let cancelled = false

  async function fetchData() {
    const data = await apiClient.getTasks({ user_id: 'demo-user' })
    if (!cancelled) {
      setTasks(data.tasks)
    }
  }

  fetchData()
  return () => { cancelled = true }
}, [])

// ❌ BAD
useEffect(() => {
  async function fetchData() {
    const data = await apiClient.getTasks({ user_id: 'demo-user' })
    setTasks(data.tasks)
  }
  fetchData()
}, [])
```

### 5. **Use Optimistic Updates for Better UX**
```typescript
// ✅ GOOD
async function completeTask(taskId: string) {
  // Update UI immediately
  setTasks(prev => prev.map(t =>
    t.task_id === taskId ? { ...t, status: 'completed' } : t
  ))

  try {
    await apiClient.updateTask(taskId, { status: 'completed' })
  } catch (error) {
    // Rollback on error
    setTasks(prev => prev.map(t =>
      t.task_id === taskId ? { ...t, status: 'active' } : t
    ))
  }
}
```

---

## 🚫 Anti-Patterns

### ❌ Don't Make Raw Fetch Calls

```typescript
// ❌ BAD
const response = await fetch('http://localhost:8000/api/v1/tasks')
const data = await response.json()

// ✅ GOOD
const data = await apiClient.getTasks({ user_id: 'demo-user' })
```

### ❌ Don't Ignore Errors

```typescript
// ❌ BAD
async function fetchTasks() {
  const data = await apiClient.getTasks({ user_id: 'demo-user' })
  setTasks(data.tasks)
}

// ✅ GOOD
async function fetchTasks() {
  try {
    const data = await apiClient.getTasks({ user_id: 'demo-user' })
    setTasks(data.tasks)
  } catch (error) {
    console.error('Failed to fetch tasks:', error)
    setError(error as Error)
  }
}
```

### ❌ Don't Skip Loading States

```typescript
// ❌ BAD
<button onClick={handleSubmit}>Submit</button>

// ✅ GOOD
<button onClick={handleSubmit} disabled={isLoading}>
  {isLoading ? 'Submitting...' : 'Submit'}
</button>
```

### ❌ Don't Hardcode User IDs

```typescript
// ❌ BAD
const tasks = await apiClient.getTasks({ user_id: 'hardcoded-user' })

// ✅ GOOD
const { userId } = useAuth() // or get from context/props
const tasks = await apiClient.getTasks({ user_id: userId })
```

---

## 📚 Additional Resources

- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Main developer navigation
- **[COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)** - All existing components
- **[DONT_RECREATE.md](./DONT_RECREATE.md)** - Existing systems checklist
- **[Design System](./DESIGN_SYSTEM.md)** - Design tokens

---

**Last Updated**: 2025-10-23

**Remember**: Always use API clients, handle errors, show loading states, and type everything!
