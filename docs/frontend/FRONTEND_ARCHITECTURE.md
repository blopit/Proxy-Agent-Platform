# Frontend Architecture (DEPRECATED)

**🚨 DEPRECATION NOTICE: This document describes the OLD Next.js web frontend**

**For CURRENT architecture, see:**
- **[`FRONTEND_CURRENT_STATE.md`](../FRONTEND_CURRENT_STATE.md)** - Current Expo/React Native architecture
- **[`mobile/README.md`](../../mobile/README.md)** - Mobile app architecture

---

## ⚠️ Historical Reference Only

This document describes the **deprecated Next.js 15 web frontend** architecture.

The web frontend was **removed in October 2025** and replaced with an Expo/React Native universal app.

**This document is kept for:**
- Understanding design patterns that were migrated
- Historical context for architecture decisions
- Reference for what worked and what didn't

**Do NOT use this as a guide for current development.**

---

# Frontend Architecture (Next.js - DEPRECATED as of October 2025)

Complete system architecture overview for the Proxy Agent Platform frontend.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Layers](#architecture-layers)
4. [Core Systems](#core-systems)
5. [Component Organization](#component-organization)
6. [Data Flow](#data-flow)
7. [State Management](#state-management)
8. [Routing Architecture](#routing-architecture)
9. [Design Patterns](#design-patterns)
10. [Performance Architecture](#performance-architecture)

---

## Overview

### System Architecture

The frontend follows a **4-layer architecture** with clear separation of concerns:

```
┌────────────────────────────────────────────────────────────┐
│  Layer 1: Presentation (Pages/Routes)                      │
│  • Next.js App Router (src/app/)                           │
│  • Route definitions                                       │
│  • Server/Client component composition                    │
│  • SEO and metadata                                        │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│  Layer 2: Components (UI Layer)                            │
│  • React components (src/components/)                      │
│  • Mobile-first components (50+)                           │
│  • Shared/reusable components                              │
│  • Design system primitives                                │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│  Layer 3: Business Logic (Hooks)                           │
│  • Custom React hooks (src/hooks/)                         │
│  • State management                                        │
│  • Side effects                                            │
│  • Reusable logic patterns                                 │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│  Layer 4: Services & Utilities                             │
│  • API client (src/lib/api.ts)                             │
│  • Design system (src/lib/design-system.ts)                │
│  • Utilities and helpers                                   │
│  • Type definitions                                        │
└────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Mobile-First**: All components designed for mobile, enhanced for desktop
2. **Design Token System**: No hardcoded values, everything from design-system.ts
3. **Component Isolation**: Storybook development for all major components
4. **Type Safety**: Strict TypeScript across the entire codebase
5. **Accessibility First**: WCAG AA compliance, keyboard navigation, ARIA labels
6. **Performance**: 60fps animations, lazy loading, optimistic updates

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose | Documentation |
|------------|---------|---------|---------------|
| **Next.js** | 15.5.6 | React framework with App Router | [Next.js Docs](https://nextjs.org/docs) |
| **React** | 18.2.0 | UI library | [React Docs](https://react.dev) |
| **TypeScript** | 5.2.2 | Type safety | [TS Docs](https://www.typescriptlang.org/docs/) |
| **Node.js** | 18+ | Runtime | [Node Docs](https://nodejs.org/docs/) |

### Styling & Design

| Technology | Version | Purpose |
|------------|---------|---------|
| **Tailwind CSS** | 3.3.0 | Utility-first CSS framework |
| **Design System** | Custom | Token-based design system |
| **Framer Motion** | 12.23.24 | Animation library |
| **clsx** | 2.1.0 | Conditional className utility |
| **tailwind-merge** | 2.2.0 | Tailwind class conflict resolution |

### UI Components & Icons

| Technology | Version | Purpose |
|------------|---------|---------|
| **lucide-react** | 0.292.0 | Icon library (300+ icons) |
| **openmoji** | 16.0.0 | Emoji graphics |
| **recharts** | 3.3.0 | Data visualization |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **Storybook** | 9.1.15 | Component development & documentation |
| **ESLint** | 8.51.0 | Code linting |
| **Jest** | Latest | Test runner |
| **Testing Library** | 16.3.0 | Component testing |

### Special Features

| Technology | Version | Purpose |
|------------|---------|---------|
| **@copilotkit/react-core** | 1.10.6 | AI copilot integration |
| **date-fns** | 4.1.0 | Date manipulation |
| **react-hot-toast** | 2.6.0 | Toast notifications |

---

## Architecture Layers

### Layer 1: Presentation (Pages/Routes)

**Location:** `src/app/`

**Responsibility:** Route definitions, page layouts, server/client composition

**Key Files:**
```
app/
├── layout.tsx              # Root layout (providers, global styles)
├── page.tsx                # Dashboard home page
├── globals.css             # Global styles (Tailwind)
├── mobile/                 # Mobile-specific routes
│   ├── page.tsx
│   ├── capture/
│   ├── scout/
│   ├── hunt/
│   ├── map/
│   └── mend/
├── tasks/                  # Task management routes
├── demo/                   # Demo pages
└── api/                    # API routes (if any)
```

**Pattern:**
- Server components by default
- Client components with `'use client'` directive
- Metadata and SEO defined at page level
- Layout composition for consistent structure

### Layer 2: Components (UI Layer)

**Location:** `src/components/`

**Responsibility:** Presentation logic, UI composition, user interactions

**Organization:**
```
components/
├── _TEMPLATE.tsx           # Component template
├── mobile/                 # Mobile-first components (50+)
│   ├── modes/              # Biological workflow modes
│   │   ├── CaptureMode.tsx
│   │   ├── ScoutMode.tsx
│   │   ├── HunterMode.tsx
│   │   ├── MapperMode.tsx
│   │   └── MenderMode.tsx
│   ├── cards/              # Card components
│   │   ├── TaskCard.tsx
│   │   └── TaskCardBig.tsx
│   ├── BiologicalTabs.tsx
│   ├── ChevronButton.tsx
│   ├── CaptureModal.tsx
│   ├── ConnectionElement.tsx
│   └── [40+ more components]
├── shared/                 # Reusable components
│   ├── AsyncJobTimeline.tsx
│   ├── OpenMoji.tsx
│   ├── ProgressBar.tsx
│   └── TaskCheckbox.tsx
├── dashboard/              # Dashboard components
│   ├── StatsCard.tsx
│   ├── ProductivityChart.tsx
│   ├── ActivityFeed.tsx
│   └── AgentCard.tsx
├── tasks/                  # Task management
│   ├── QuickCapture.tsx
│   ├── TaskList.tsx
│   └── TaskDashboard.tsx
├── system/                 # Design system primitives
│   ├── SystemButton.tsx
│   ├── SystemCard.tsx
│   ├── SystemInput.tsx
│   ├── SystemModal.tsx
│   └── SystemBadge.tsx
└── ui/                     # Low-level UI primitives
    └── card.tsx
```

**Component Categories:**

1. **Mode Components** (5) - Biological workflow modes
2. **Card Components** (10+) - Various card layouts and sizes
3. **Form Components** (8+) - Inputs, buttons, modals
4. **Navigation Components** (5+) - Tabs, menus, breadcrumbs
5. **Data Display** (10+) - Charts, timelines, stats
6. **Feedback Components** (5+) - Toasts, loading, errors

### Layer 3: Business Logic (Hooks)

**Location:** `src/hooks/`

**Responsibility:** State management, side effects, reusable logic

**Core Hooks:**

```typescript
// Custom hooks
hooks/
├── useVoiceInput.ts        # Web Speech API integration (240 lines)
├── useWebSocket.ts         # Real-time WebSocket connection (120 lines)
└── useCaptureFlow.ts       # Task capture workflow (150 lines)
```

**Hook Patterns:**

1. **Data Fetching Hooks**
   - API calls
   - Loading states
   - Error handling
   - Cache management

2. **UI State Hooks**
   - Modal visibility
   - Form state
   - Selection state
   - Animation state

3. **Side Effect Hooks**
   - WebSocket connections
   - Voice input
   - LocalStorage sync
   - Event listeners

### Layer 4: Services & Utilities

**Location:** `src/lib/`, `src/types/`, `src/utils/`

**Responsibility:** API communication, utilities, type definitions

**Key Services:**

```
lib/
├── design-system.ts        # Design token system (CRITICAL)
├── api.ts                  # API client with typed methods
├── ai-api.ts               # AI endpoint client
├── card-utils.ts           # Card component utilities
├── hierarchy-config.ts     # Task hierarchy configuration
└── utils.ts                # General utilities

types/
├── task.ts                 # Task type definitions
├── agent.ts                # Agent type definitions
├── user.ts                 # User type definitions
└── [other types]
```

---

## Core Systems

### 1. Design System

**Location:** `src/lib/design-system.ts`

**Purpose:** Single source of truth for all design decisions

**Exports:**
```typescript
// Spacing (4px grid)
export const spacing: Record<number, string>

// Semantic colors (Solarized palette)
export const semanticColors: {
  bg: { primary, secondary, tertiary, hover }
  text: { primary, secondary, muted, inverse }
  border: { default, emphasis }
  accent: { primary, secondary, soft }
  status: { success, warning, error, info }
}

// Typography
export const fontSize: Record<string, string>
export const fontWeight: Record<string, number>

// Border radius
export const borderRadius: Record<string, string>

// Shadows
export const shadow: Record<string, string>

// Animations
export const duration: Record<string, string>
export const easing: Record<string, string>

// Icons
export const iconSize: Record<string, string>

// Z-index
export const zIndex: Record<string, number>
```

**Critical Rule:** NEVER hardcode design values. Always import from design-system.ts

### 2. API Client System

**Location:** `src/lib/api.ts`

**Purpose:** Centralized API communication with type safety

**Key Methods:**
```typescript
export const apiClient = {
  // Tasks
  getTasks(params: GetTasksParams): Promise<Task[]>
  getTask(id: string): Promise<Task>
  quickCapture(data: QuickCaptureRequest): Promise<Task>
  updateTaskStatus(id: string, status: TaskStatus): Promise<Task>

  // Energy tracking
  getEnergyLevel(userId: string): Promise<EnergyLevel>

  // Agents
  getAgents(): Promise<Agent[]>

  // ... 30+ more methods
}
```

**Features:**
- Typed requests and responses
- Error handling
- Request/response interceptors
- Base URL configuration
- CORS handling

### 3. Theme System

**Location:** `src/contexts/ThemeContext.tsx`

**Purpose:** Light/dark theme management with Solarized colors

**Features:**
- Light and dark mode
- LocalStorage persistence
- Solarized color palette
- Theme context provider
- `useTheme()` hook

**Usage:**
```typescript
const { mode, colors, toggleTheme, setTheme } = useTheme()
```

### 4. Voice Input System

**Location:** `src/hooks/useVoiceInput.ts`

**Purpose:** Web Speech API integration for voice-to-text

**Features:**
- Real-time transcription
- Interim results
- Multi-language support
- Error handling
- Browser compatibility check

**Performance:** 2-second target from voice to saved task

### 5. WebSocket System

**Location:** `src/hooks/useWebSocket.ts`

**Purpose:** Real-time bidirectional communication

**Features:**
- Auto-reconnection
- Message queuing
- Connection state management
- Error handling
- Heartbeat/ping-pong

### 6. Storybook System

**Location:** `.storybook/`

**Purpose:** Component development, testing, and documentation

**Features:**
- 28+ component stories
- 20+ color themes
- Accessibility testing (a11y addon)
- Viewport testing (mobile, tablet, desktop)
- Interactive controls
- Auto-generated docs

**Configuration:**
```
.storybook/
├── main.ts                 # Main configuration
├── preview.ts              # Global decorators and parameters
├── themes.ts               # 20+ color theme definitions
└── test-setup.ts           # Test configuration
```

### 7. Component Template System

**Location:** `src/components/_TEMPLATE.tsx`

**Purpose:** Standardized component creation

**Includes:**
- TypeScript interface pattern
- JSDoc documentation
- Design system imports
- Event handler patterns
- Best practices examples
- Testing checklist

### 8. Biological Workflow System

**Purpose:** ADHD-friendly task management modes

**Five Modes:**

1. **Capture Mode** - Ultra-fast task capture (2-second target)
   - Voice input
   - Quick text entry
   - Minimal friction
   - Auto-submit

2. **Scout Mode** - Netflix-style task browsing
   - Horizontal scrolling
   - Variable card sizes
   - Edge fade gradients
   - Momentum scrolling

3. **Hunter Mode** - Deep work focus
   - Focus timer
   - Single task display
   - Distraction blocking
   - Progress tracking

4. **Mapper Mode** - Task breakdown & dependencies
   - Tree visualization
   - Drag-and-drop
   - Dependency lines
   - Collapse/expand

5. **Mender Mode** - Review & reflection
   - Timeline view
   - Completion stats
   - Achievement gallery
   - Streak tracking

---

## Component Organization

### Component Hierarchy

```
Application
├── Root Layout (app/layout.tsx)
│   ├── ThemeProvider
│   ├── Global Styles
│   └── Metadata
│
├── Pages (app/*/page.tsx)
│   ├── Dashboard Page
│   │   ├── StatsCard[]
│   │   ├── ProductivityChart
│   │   └── ActivityFeed
│   │
│   ├── Mobile Page
│   │   ├── BiologicalTabs
│   │   │   ├── CaptureMode
│   │   │   ├── ScoutMode
│   │   │   ├── HunterMode
│   │   │   ├── MapperMode
│   │   │   └── MenderMode
│   │   └── MobileNavigation
│   │
│   └── Tasks Page
│       ├── QuickCapture
│       ├── TaskList
│       │   └── TaskCard[]
│       └── TaskDashboard
│
└── Shared Components
    ├── AsyncJobTimeline
    ├── ProgressBar
    ├── OpenMoji
    └── TaskCheckbox
```

### Component Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Page | `page.tsx` | `app/tasks/page.tsx` |
| Layout | `layout.tsx` | `app/layout.tsx` |
| Component | `PascalCase.tsx` | `TaskCard.tsx` |
| Story | `*.stories.tsx` | `TaskCard.stories.tsx` |
| Test | `*.test.tsx` | `TaskCard.test.tsx` |
| Hook | `use*.ts` | `useVoiceInput.ts` |
| Utility | `camelCase.ts` | `cardUtils.ts` |
| Type | `type.ts` | `task.ts` |

---

## Data Flow

### Standard Data Flow

```
User Action
    ↓
Component (onClick, onChange, etc.)
    ↓
Custom Hook (business logic)
    ↓
API Client (HTTP request)
    ↓
Backend API
    ↓
API Client (response)
    ↓
Custom Hook (state update)
    ↓
Component (re-render)
    ↓
UI Update
```

### Example: Task Capture Flow

```typescript
// 1. User clicks "Capture" button
<CaptureMode onCapture={handleCapture} />

// 2. Component calls custom hook
const { startCapture, submitTask } = useCaptureFlow()

// 3. Hook manages voice input
const { transcript } = useVoiceInput()

// 4. Hook calls API client
const task = await apiClient.quickCapture({
  text: transcript,
  user_id: userId
})

// 5. State updates
setTasks(prev => [...prev, task])

// 6. UI re-renders with new task
```

### WebSocket Data Flow

```
Backend Event (task_updated)
    ↓
WebSocket Connection
    ↓
useWebSocket Hook (onMessage)
    ↓
Event Handler (update local state)
    ↓
Component Re-render
    ↓
UI Update (optimistic)
```

---

## State Management

### State Architecture

**No global state library** (no Redux, Zustand, etc.)

**State Layers:**

1. **Server State** (Next.js)
   - Server components
   - Server actions
   - Data fetching

2. **Context State** (React Context)
   - ThemeContext (light/dark mode)
   - Future: UserContext, SettingsContext

3. **Local State** (useState)
   - Component-level state
   - Form state
   - UI state (modals, menus, etc.)

4. **Custom Hooks** (Reusable Logic)
   - useVoiceInput
   - useWebSocket
   - useCaptureFlow

### State Patterns

#### Local State
```typescript
const [count, setCount] = useState(0)
const [isOpen, setIsOpen] = useState(false)
```

#### Object State
```typescript
const [form, setForm] = useState({ name: '', email: '' })
setForm(prev => ({ ...prev, name: 'John' }))
```

#### Derived State
```typescript
const [tasks, setTasks] = useState([])
const completedTasks = tasks.filter(t => t.status === 'completed')
```

---

## Routing Architecture

### Next.js App Router

**File-System Based Routing:**

```
app/
├── page.tsx                    → /
├── layout.tsx                  → Root layout
├── mobile/
│   ├── page.tsx                → /mobile
│   ├── capture/
│   │   └── page.tsx            → /mobile/capture
│   ├── scout/
│   │   └── page.tsx            → /mobile/scout
│   └── [mode]/
│       └── page.tsx            → /mobile/hunt, /mobile/map, /mobile/mend
├── tasks/
│   ├── page.tsx                → /tasks
│   └── [id]/
│       └── page.tsx            → /tasks/:id
└── demo/
    └── page.tsx                → /demo
```

### Navigation Patterns

```typescript
// Client-side navigation
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/mobile/capture')

// Link component
import Link from 'next/link'
<Link href="/tasks">Tasks</Link>
```

---

## Design Patterns

### 1. Component Composition Pattern

```typescript
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### 2. Render Props Pattern

```typescript
<DataFetcher
  url="/api/tasks"
  render={(data, loading, error) => (
    loading ? <Spinner /> :
    error ? <Error message={error} /> :
    <TaskList tasks={data} />
  )}
/>
```

### 3. Custom Hook Pattern

```typescript
function useData(url) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData(url).then(setData).finally(() => setLoading(false))
  }, [url])

  return { data, loading }
}
```

### 4. Controlled Component Pattern

```typescript
function Form() {
  const [value, setValue] = useState('')

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}
```

---

## Performance Architecture

### Optimization Strategies

1. **Code Splitting**
   - Next.js automatic code splitting
   - Dynamic imports for heavy components
   - Route-based splitting

2. **Lazy Loading**
   ```typescript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <Spinner />,
     ssr: false
   })
   ```

3. **Memoization**
   ```typescript
   const expensiveValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
   const stableCallback = useCallback(() => doSomething(id), [id])
   const MemoizedComponent = memo(Component)
   ```

4. **Optimistic Updates**
   ```typescript
   // Update UI immediately
   setTasks(prev => [...prev, newTask])

   // Then sync with server
   await apiClient.createTask(newTask)
   ```

5. **Image Optimization**
   ```typescript
   import Image from 'next/image'

   <Image
     src="/avatar.png"
     width={50}
     height={50}
     alt="Avatar"
   />
   ```

### Performance Targets

- **2-second task capture** - From voice to saved
- **< 500ms API response** - Average
- **< 100ms UI updates** - Optimistic updates
- **< 2s dashboard load** - Complete with data
- **60fps animations** - All animations

---

**Last Updated:** October 28, 2025
**Maintained By:** Frontend Team
