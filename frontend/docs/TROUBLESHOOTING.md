# Troubleshooting & Common Patterns

## 🔧 Common Issues

### Issue: Tasks Not Loading

**Symptoms**:
- Empty task list in Scout/Hunter modes
- "No tasks" message appears immediately
- Console shows network errors

**Solutions**:

1. **Check API URL**:
```bash
# Verify .env.local exists
cat .env.local

# Should contain:
NEXT_PUBLIC_API_URL=http://localhost:8000
```

2. **Verify Backend is Running**:
```bash
# Check if backend is accessible
curl http://localhost:8000/api/v1/tasks

# Should return JSON response
```

3. **Check CORS Settings**:
```typescript
// Backend should allow frontend origin
// Check backend CORS middleware configuration
```

4. **Inspect Network Errors**:
```typescript
// Add detailed error logging
const fetchTasks = async () => {
  try {
    const response = await fetch(`${API_URL}/api/v1/tasks?user_id=mobile-user`)
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Error response:', errorText)
    }
  } catch (error) {
    console.error('Fetch error:', error)
  }
}
```

---

### Issue: Voice Input Not Working

**Symptoms**:
- Microphone button doesn't respond
- No speech recognition happening
- Browser asks for permissions but nothing happens

**Solutions**:

1. **Check Browser Compatibility**:
```typescript
// Voice input requires Chrome/Edge
const isSupported = 'webkitSpeechRecognition' in window ||
                   'SpeechRecognition' in window

console.log('Voice input supported:', isSupported)
```

2. **Verify HTTPS or Localhost**:
```bash
# Voice input requires secure context
# Must be HTTPS or localhost
# Check URL in browser
```

3. **Grant Microphone Permissions**:
```
1. Click lock icon in address bar
2. Allow microphone access
3. Refresh page
```

4. **Check useVoiceInput Hook**:
```typescript
const { isSupported, error } = useVoiceInput({
  onError: (err) => {
    console.error('Voice error:', err)
    // Handle specific error types
    if (err.type === 'not-allowed') {
      showToast('Microphone access denied')
    }
  }
})

if (!isSupported) {
  console.warn('Browser does not support voice input')
}
```

---

### Issue: Animations Stuttering

**Symptoms**:
- Swipe gestures feel laggy
- Card transitions are choppy
- UI feels unresponsive

**Solutions**:

1. **Use GPU-Accelerated Transforms**:
```typescript
// ✅ Good - GPU accelerated
transform: `translateX(${offset}px)`
willChange: 'transform'

// ❌ Bad - CPU rendering
left: `${offset}px`
```

2. **Avoid Re-renders During Drag**:
```typescript
// Use refs instead of state for drag position
const dragXRef = useRef(0)

// Direct DOM manipulation for smooth dragging
if (cardRef.current) {
  cardRef.current.style.transform = `translateX(${dragX}px)`
}
```

3. **Reduce Component Complexity**:
```typescript
// Memoize expensive components
export default React.memo(ExpensiveComponent)

// Use useMemo for computed values
const sortedTasks = useMemo(() =>
  tasks.sort((a, b) => a.priority - b.priority),
  [tasks]
)
```

4. **Check Device Performance**:
```bash
# Enable React DevTools Profiler
# Look for components re-rendering unnecessarily
```

---

### Issue: Design System Colors Not Applying

**Symptoms**:
- Dark mode not working
- Colors look wrong
- Hardcoded colors instead of theme colors

**Solutions**:

1. **Use Semantic Colors**:
```typescript
// ✅ Good - Auto dark mode
import { semanticColors } from '@/lib/design-system'
backgroundColor: semanticColors.bg.primary

// ❌ Bad - Hardcoded
backgroundColor: '#002b36'
```

2. **Check System Theme**:
```typescript
// Debug theme detection
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
console.log('Dark mode:', isDark)
```

3. **Verify Import Path**:
```typescript
// Correct import
import { semanticColors, colors } from '@/lib/design-system'

// Not from Tailwind
import { colors } from 'tailwindcss/colors' // ❌ Wrong
```

---

### Issue: API Calls Failing with 404

**Symptoms**:
- API endpoints return 404
- Backend logs show "route not found"

**Solutions**:

1. **Verify Endpoint Path**:
```typescript
// Check exact endpoint in backend
// Backend: POST /api/v1/mobile/quick-capture
// Frontend must match exactly:
const response = await fetch(`${API_URL}/api/v1/mobile/quick-capture`, {
  method: 'POST',
  // ...
})
```

2. **Check API Version**:
```typescript
// Some endpoints may be /api/v2/ instead of /api/v1/
// Verify in backend docs or OpenAPI spec
```

3. **Inspect Full URL**:
```typescript
const fullUrl = `${API_URL}/api/v1/tasks`
console.log('Fetching from:', fullUrl)
// Should be: http://localhost:8000/api/v1/tasks
```

---

### Issue: Task Breakdown Not Showing

**Symptoms**:
- After capture, no micro-steps appear
- TaskBreakdownModal is empty
- Console shows "No micro_steps in response"

**Solutions**:

1. **Verify Backend Returns micro_steps**:
```typescript
const response = await apiClient.quickCapture({ text, user_id })
console.log('Capture response:', response)
console.log('Micro steps:', response.micro_steps)

if (!response.micro_steps || response.micro_steps.length === 0) {
  console.warn('Backend did not return micro_steps')
}
```

2. **Check Backend Processing**:
```bash
# Backend logs should show:
# "Decomposing task into micro-steps"
# "Generated X micro-steps"
```

3. **Verify AI Processing Enabled**:
```typescript
// Make sure auto_mode is true
const response = await apiClient.quickCapture({
  text: taskText,
  user_id: 'mobile-user',
  auto_mode: true  // ← Must be true for AI decomposition
})
```

---

### Issue: Energy Gauge Shows Wrong Value

**Symptoms**:
- Energy always shows same number
- Energy doesn't update
- Energy shows 0 or 100 constantly

**Solutions**:

1. **Check Backend Scale Conversion**:
```typescript
// Backend returns 0-10 scale
// Frontend needs 0-100 percentage
const energyData = await apiClient.getEnergyLevel('mobile-user')

// Convert correctly
const energyLevel = energyData.energy_level || energyData.current_level || 7.2
const energyPercentage = Math.round(energyLevel * 10)  // 7.2 → 72%

console.log('Raw energy:', energyLevel, '→ Percentage:', energyPercentage)
setEnergy(energyPercentage)
```

2. **Verify Polling Interval**:
```typescript
// Energy should update periodically
useEffect(() => {
  fetchEnergyData()

  const energyInterval = setInterval(fetchEnergyData, 60000) // Every minute

  return () => clearInterval(energyInterval)
}, [])
```

3. **Check Default Fallback**:
```typescript
// Graceful degradation if API fails
const energyLevel = energyData.energy_level || 7.2  // Default 72%
```

---

## 🎯 Common Patterns

### Pattern: Refresh on Tab Switch

```typescript
const [mode, setMode] = useState<Mode>('capture')
const [refreshTrigger, setRefreshTrigger] = useState(0)

// Refresh data when switching to a mode
const handleModeChange = (newMode: Mode) => {
  setMode(newMode)

  // Trigger data refresh for data-dependent modes
  if (['search', 'hunt', 'rest'].includes(newMode)) {
    setRefreshTrigger(prev => prev + 1)
  }
}

<BiologicalTabs
  activeTab={mode}
  onTabChange={handleModeChange}
/>
```

---

### Pattern: Loading State with Error Fallback

```typescript
const [data, setData] = useState<Task[]>([])
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

const fetchData = async () => {
  setIsLoading(true)
  setError(null)

  try {
    const response = await apiClient.getTasks({ user_id: 'mobile-user' })
    setData(response.tasks)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error')
    console.error('Fetch error:', err)
  } finally {
    setIsLoading(false)
  }
}

// Render
if (isLoading && data.length === 0) {
  return <LoadingSpinner />
}

if (error) {
  return <ErrorMessage message={error} onRetry={fetchData} />
}

if (data.length === 0) {
  return <EmptyState message="No tasks found" />
}

return <TaskList tasks={data} />
```

---

### Pattern: Optimistic UI Updates

```typescript
const [tasks, setTasks] = useState<Task[]>([])

const handleTaskComplete = async (task: Task) => {
  // Save original state for rollback
  const originalTasks = [...tasks]

  // Optimistically update UI immediately
  setTasks(prev => prev.map(t =>
    t.task_id === task.task_id
      ? { ...t, status: 'completed' }
      : t
  ))

  // Show immediate feedback
  showToast('Task completed!', { type: 'success' })

  try {
    // Send update to backend
    await apiClient.updateTask(task.task_id, { status: 'completed' })

  } catch (error) {
    // Rollback on error
    setTasks(originalTasks)
    showToast('Failed to update task', { type: 'error' })
    console.error('Update failed:', error)
  }
}
```

---

### Pattern: Debounced Search

```typescript
import { useMemo, useState } from 'react'
import { debounce } from 'lodash'

const [searchQuery, setSearchQuery] = useState('')
const [searchResults, setSearchResults] = useState<Task[]>([])

const debouncedSearch = useMemo(
  () => debounce(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const results = await apiClient.searchTasks(query)
      setSearchResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }, 300), // Wait 300ms after user stops typing
  []
)

// Cleanup on unmount
useEffect(() => {
  return () => {
    debouncedSearch.cancel()
  }
}, [debouncedSearch])

// Usage
<input
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value)
    debouncedSearch(e.target.value)
  }}
  placeholder="Search tasks..."
/>
```

---

### Pattern: Progressive Loading

```typescript
const [displayedTasks, setDisplayedTasks] = useState<Task[]>([])
const [allTasks, setAllTasks] = useState<Task[]>([])
const [page, setPage] = useState(1)

const TASKS_PER_PAGE = 20

// Load initial batch
useEffect(() => {
  const initial = allTasks.slice(0, TASKS_PER_PAGE)
  setDisplayedTasks(initial)
}, [allTasks])

// Load more on scroll
const loadMore = () => {
  const nextPage = page + 1
  const start = (nextPage - 1) * TASKS_PER_PAGE
  const end = start + TASKS_PER_PAGE
  const nextBatch = allTasks.slice(start, end)

  setDisplayedTasks(prev => [...prev, ...nextBatch])
  setPage(nextPage)
}

// Infinite scroll hook
useEffect(() => {
  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      // Near bottom, load more
      loadMore()
    }
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [page, allTasks])
```

---

### Pattern: Modal State Management

```typescript
const [isModalOpen, setIsModalOpen] = useState(false)
const [modalData, setModalData] = useState<Task | null>(null)

const openModal = (task: Task) => {
  setModalData(task)
  setIsModalOpen(true)
}

const closeModal = () => {
  setIsModalOpen(false)
  // Clear data after animation completes
  setTimeout(() => setModalData(null), 300)
}

// Modal component
<TaskBreakdownModal
  captureResponse={modalData}
  isOpen={isModalOpen}
  onClose={closeModal}
  onStartTask={() => {
    closeModal()
    setMode('hunt')
  }}
/>
```

---

### Pattern: Safe Color Extraction

```typescript
// Safely get color from energy value
const getEnergyColor = (energy: number): string => {
  // Clamp energy to valid range
  const clamped = Math.max(0, Math.min(100, energy))

  // Use color blending utility
  const color = getBatteryColor(clamped)

  return color
}

// Usage
<div style={{
  backgroundColor: getEnergyColor(energy),
  color: semanticColors.text.inverse
}}>
  {energy}%
</div>
```

---

## 🔍 Debugging Tips

### Enable Detailed Logging

```typescript
// Add to .env.local
NEXT_PUBLIC_DEBUG=true
NEXT_PUBLIC_API_DEBUG=true

// Use in code
const DEBUG = process.env.NEXT_PUBLIC_DEBUG === 'true'

if (DEBUG) {
  console.log('[DEBUG] Component mounted', { props, state })
}
```

### React DevTools Profiler

```bash
# Install React DevTools browser extension
# Enable Profiler in DevTools
# Record interactions to find slow components
```

### Network Tab Analysis

```
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by 'Fetch/XHR'
4. Perform action
5. Check request/response details
```

### Component State Inspector

```typescript
// Temporary debug hook
const useDebugState = (label: string, value: any) => {
  useEffect(() => {
    console.log(`[${label}]:`, value)
  }, [label, value])
}

// Usage
useDebugState('tasks', tasks)
useDebugState('isLoading', isLoading)
```

---

## 🚨 Error Boundaries

### Wrap Components in Error Boundaries

```typescript
import ErrorBoundary from '@/components/ErrorBoundary'

<ErrorBoundary>
  <ScoutMode
    onTaskTap={handleTaskTap}
    refreshTrigger={refreshTrigger}
  />
</ErrorBoundary>
```

### Create Custom Error Boundary

```typescript
import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: spacing[4] }}>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
```

---

## 📋 Checklist for New Features

- [ ] Component follows design system tokens
- [ ] TypeScript types defined for props
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states included
- [ ] Accessibility attributes added
- [ ] Responsive design tested
- [ ] Performance optimized (React.memo, useMemo)
- [ ] API integration tested
- [ ] Error boundary wrapped
- [ ] Console logs removed (except debug mode)
- [ ] Component documented in COMPONENT_LIBRARY.md

---

## 📚 Additional Resources

- **React DevTools**: https://react.dev/learn/react-developer-tools
- **Next.js Debugging**: https://nextjs.org/docs/advanced-features/debugging
- **TypeScript Errors**: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html
- **Performance Profiling**: https://react.dev/reference/react/Profiler

---

**Last Updated**: 2025-10-25

**Questions?** Check other docs or create an issue
