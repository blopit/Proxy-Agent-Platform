# Don't Recreate - Existing Systems Checklist

> **PURPOSE**: Quick reference of existing systems to prevent duplication and wasted effort.
> **BEFORE IMPLEMENTING ANYTHING**: Check this file to see if it already exists!

## 🎯 How to Use This Checklist

1. **Read this FIRST** before implementing any feature
2. **Check off relevant systems** that exist for your use case
3. **Import and use** existing systems instead of recreating
4. **Add new systems** to this list when you create them

---

## ✅ Existing Systems Inventory

### 🎨 Design System

#### ✅ Design Tokens (src/lib/design-system.ts)
**What it does**: Provides ALL design values (spacing, colors, shadows, animations, etc.)
**When to use**: ALWAYS - for any visual styling
**Never do**: Hardcode colors (`#002b36`), spacing (`16px`), shadows, or animations

**Available Categories**:
- ✅ Spacing (4px grid: `spacing[1]` to `spacing[32]`)
- ✅ Typography (`fontSize.xs` to `fontSize['4xl']`)
- ✅ Border Radius (`borderRadius.sm` to `borderRadius.pill`)
- ✅ Icon Sizes (`iconSize.xs` to `iconSize['2xl']`)
- ✅ Colors (Solarized palette: `colors.cyan`, `colors.blue`, etc.)
- ✅ Semantic Colors (`semanticColors.bg.primary`, `semanticColors.text.primary`)
- ✅ Opacity (`opacity[0]` to `opacity[100]`)
- ✅ Z-Index Layering (`zIndex.sticky` to `zIndex.toast`)
- ✅ Shadows (`shadow.sm` to `shadow.xl` + `coloredShadow()` helper)
- ✅ Animation Durations (`duration.fast` to `duration.pause`)
- ✅ Animation Timing Constants (`animation.celebration`, `animation.frameRate`)
- ✅ Physics Constants (`physics.gravity`, `physics.particleSpeed`)

**Import**:
```typescript
import {
  spacing,
  semanticColors,
  fontSize,
  borderRadius,
  iconSize,
  zIndex,
  shadow,
  coloredShadow,
  duration,
  animation,
  physics
} from '@/lib/design-system'
```

**Documentation**: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

---

### 🪝 React Hooks

#### ✅ Voice Input (src/hooks/useVoiceInput.ts)
**What it does**: Web Speech API integration for voice-to-text
**When to use**: Voice input features, hands-free task capture
**Never do**: Recreate voice input logic or Web Speech API wrappers

**Features**:
- Voice recognition
- Start/stop recording
- Transcript updates
- Error handling
- Browser compatibility detection

**Import**:
```typescript
import useVoiceInput from '@/hooks/useVoiceInput'

const { transcript, isListening, startListening, stopListening, error } = useVoiceInput()
```

---

#### ✅ WebSocket Connection (src/hooks/useWebSocket.ts)
**What it does**: Manages WebSocket connection for real-time updates
**When to use**: Real-time features, live task updates, notifications
**Never do**: Create raw WebSocket connections

**Features**:
- Auto-reconnect logic
- Connection state management
- Message sending/receiving
- Error handling
- Cleanup on unmount

**Import**:
```typescript
import useWebSocket from '@/hooks/useWebSocket'

const { socket, isConnected, sendMessage } = useWebSocket('ws://localhost:8000/ws')
```

---

#### ✅ Capture Flow (src/hooks/useCaptureFlow.ts)
**What it does**: Manages task capture workflow with loading states
**When to use**: Task creation flow, multi-step capture process
**Never do**: Recreate task capture state management

**Features**:
- Loading stage management ('listening', 'processing', 'saving')
- Error handling
- Success/failure callbacks
- Cleanup logic

**Import**:
```typescript
import useCaptureFlow from '@/hooks/useCaptureFlow'

const { stage, isLoading, startCapture, completeCapture, error } = useCaptureFlow()
```

---

### 🛠️ Utility Functions

#### ✅ className Utility (src/lib/utils.ts)
**What it does**: Merges className strings with conditional logic
**When to use**: Combining Tailwind classes, conditional styling
**Never do**: Manual string concatenation for classNames

**Features**:
- Filters falsy values
- Supports strings, arrays, objects
- Type-safe

**Import**:
```typescript
import { cn } from '@/lib/utils'

<div className={cn(
  'base-class',
  condition && 'conditional-class',
  { 'active': isActive }
)} />
```

---

#### ✅ Card Utilities (src/lib/card-utils.ts)
**What it does**: Utility functions for card components
**When to use**: Card sizing, card layout calculations
**Never do**: Recreate card dimension logic

**Import**:
```typescript
import { getCardDimensions, calculateCardLayout } from '@/lib/card-utils'
```

---

### 🌐 API Integration

#### ✅ Main API Client (src/lib/api.ts)
**What it does**: Centralized API client for backend communication
**When to use**: All backend API calls (tasks, users, etc.)
**Never do**: Direct `fetch()` calls to backend

**Features**:
- Type-safe API methods
- Error handling
- Request/response interceptors
- Base URL configuration

**Import**:
```typescript
import { taskApi, userApi } from '@/lib/api'

// Get tasks
const tasks = await taskApi.getTasks()

// Create task
const newTask = await taskApi.createTask(taskData)
```

---

#### ✅ AI API Client (src/lib/ai-api.ts)
**What it does**: API client for AI-specific endpoints
**When to use**: AI task breakdown, smart suggestions, voice processing
**Never do**: Recreate AI endpoint logic

**Features**:
- AI-powered task breakdown
- Smart categorization
- Voice-to-text processing

**Import**:
```typescript
import { aiApi } from '@/lib/ai-api'

const breakdown = await aiApi.breakdownTask(taskText)
const category = await aiApi.categorizeTask(task)
```

---

### 📝 Type Definitions

#### ✅ Task Types (src/types/task.ts)
**What it does**: TypeScript types for task-related data
**When to use**: Working with task objects
**Never do**: Define task types inline

**Import**:
```typescript
import type { Task, TaskFilter, TaskStatus } from '@/types/task'
```

---

#### ✅ Task Schema (src/types/task-schema.ts)
**What it does**: Validation schemas for tasks
**When to use**: Form validation, API request validation
**Never do**: Recreate validation logic

**Import**:
```typescript
import { taskSchema, validateTask } from '@/types/task-schema'
```

---

#### ✅ Capture Types (src/types/capture.ts)
**What it does**: Types for task capture flow
**When to use**: Capture mode, voice input, task creation
**Never do**: Define capture types inline

**Import**:
```typescript
import type { CaptureState, CaptureStage } from '@/types/capture'
```

---

#### ✅ Card Types (src/types/task-card.ts)
**What it does**: Types for card components
**When to use**: Card components, card layouts
**Never do**: Define card types inline

**Import**:
```typescript
import type { CardVariant, CardSize } from '@/types/task-card'
```

---

### 🎬 Animation Systems

#### ✅ Particle Physics (RewardCelebration.tsx)
**What it does**: Particle animation system with gravity and physics
**When to use**: Celebration animations, confetti effects
**Never do**: Recreate particle physics from scratch

**Features**:
- Gravity simulation (`physics.gravity`)
- Particle velocity (`physics.particleSpeed`)
- 60fps animation (`animation.frameRate`)
- Auto-cleanup

**Location**: [src/components/mobile/RewardCelebration.tsx](src/components/mobile/RewardCelebration.tsx:1)

---

#### ✅ Drop Animation (TaskDropAnimation.tsx)
**What it does**: Task "drop" animation with bounce effect
**When to use**: Task creation feedback, item placement animations
**Never do**: Recreate drop physics

**Features**:
- Gravity-based fall
- Bounce effect
- Fade out
- Configurable duration

**Location**: [src/components/mobile/TaskDropAnimation.tsx](src/components/mobile/TaskDropAnimation.tsx:1)

---

#### ✅ Loading Animations (CaptureLoading.tsx)
**What it does**: Multi-stage loading animation for capture flow
**When to use**: Task capture, multi-step processes
**Never do**: Recreate loading stage animations

**Features**:
- 3 stages: listening, processing, saving
- Stage-specific messages
- Smooth transitions
- Design system timing (`animation.loadingStage`)

**Location**: [src/components/mobile/CaptureLoading.tsx](src/components/mobile/CaptureLoading.tsx:1)

---

### 📱 Mobile Integration Patterns

#### ✅ Bottom Tab Navigation (BiologicalTabs.tsx)
**What it does**: Mobile-friendly bottom tab bar for mode switching
**When to use**: Mobile navigation, mode switching
**Never do**: Recreate tab navigation

**Features**:
- 5 biological modes
- Active state highlighting
- Touch-friendly tap targets
- Icon + label

**Location**: [src/components/mobile/BiologicalTabs.tsx](src/components/mobile/BiologicalTabs.tsx:1)

---

#### ✅ Horizontal Carousel (CategoryRow.tsx)
**What it does**: Netflix-style horizontal scrolling carousel
**When to use**: Horizontal content browsing, task categories
**Never do**: Recreate horizontal scroll with snap-scrolling

**Features**:
- Smooth momentum scrolling (no snap-scrolling)
- Variable card sizes (hero, standard, compact)
- Edge fade gradients
- GPU-accelerated hover effects
- Responsive layout

**Location**: [src/components/mobile/CategoryRow.tsx](src/components/mobile/CategoryRow.tsx:1)

---

#### ✅ Ticker Component (Ticker.tsx)
**What it does**: Rotating message ticker with fade transitions
**When to use**: Rotating quotes, tips, motivational messages
**Never do**: Recreate message rotation logic

**Features**:
- Random interval variation
- Smooth fade transitions
- Proper cleanup
- Configurable messages and timing

**Location**: [src/components/mobile/Ticker.tsx](src/components/mobile/Ticker.tsx:1)

---

### 🧩 System Components

These components implement the design system and should be used for consistent UI:

#### ✅ SystemButton
**Location**: [src/components/system/SystemButton.tsx](src/components/system/SystemButton.tsx:1)
**When to use**: All buttons
**Never do**: Create custom button components

---

#### ✅ SystemInput
**Location**: [src/components/system/SystemInput.tsx](src/components/system/SystemInput.tsx:1)
**When to use**: All text inputs
**Never do**: Create custom input components

---

#### ✅ SystemCard
**Location**: [src/components/system/SystemCard.tsx](src/components/system/SystemCard.tsx:1)
**When to use**: Card containers
**Never do**: Create custom card styles

---

#### ✅ SystemBadge
**Location**: [src/components/system/SystemBadge.tsx](src/components/system/SystemBadge.tsx:1)
**When to use**: Tags, labels, status indicators
**Never do**: Create custom badge styles

---

#### ✅ SystemToast
**Location**: [src/components/system/SystemToast.tsx](src/components/system/SystemToast.tsx:1)
**When to use**: Notifications, success/error messages
**Never do**: Create custom toast notifications

---

#### ✅ SystemModal
**Location**: [src/components/system/SystemModal.tsx](src/components/system/SystemModal.tsx:1)
**When to use**: Dialogs, popups, modals
**Never do**: Create custom modal components

---

### 📊 Data Patterns

#### ✅ Task Filtering Logic
**Where**: [src/components/mobile/modes/ScoutMode.tsx](src/components/mobile/modes/ScoutMode.tsx:67-116)
**What it does**: Filters tasks by category (Main Focus, Urgent, Quick Wins, etc.)
**When to use**: Task categorization, smart task lists
**Never do**: Recreate task filtering algorithms

**Available Filters**:
- `getMainFocus()` - High priority tasks (top 3)
- `getUrgentToday()` - Due today
- `getQuickWins()` - Tasks ≤ 15 minutes
- `getThisWeek()` - Due in next 7 days
- `getSomedayMaybe()` - Low priority or no due date
- `getCanDelegate()` - Digital/automatable tasks
- `getMysteryTask()` - Random task for variety

---

#### ✅ Task Priority Color Coding
**Where**: [src/components/mobile/CategoryRow.tsx](src/components/mobile/CategoryRow.tsx:53-65)
**What it does**: Maps task priority to Solarized colors
**When to use**: Displaying task priority visually
**Never do**: Hardcode priority colors

**Mapping**:
- High/Urgent → Red (`colors.red`)
- Medium → Yellow (`colors.yellow`)
- Low → Green (`colors.green`)

---

#### ✅ Time Estimation Display
**Where**: [src/components/mobile/CategoryRow.tsx](src/components/mobile/CategoryRow.tsx:68-76)
**What it does**: Formats task estimated hours as human-readable string
**When to use**: Displaying task duration
**Never do**: Recreate time formatting

**Examples**:
- 0.25 hours → "15m"
- 1 hour → "1h"
- 2.5 hours → "2.5h"

---

## 🚨 Before You Code Workflow

Follow this checklist EVERY TIME before implementing:

1. **Check Design System**
   - [ ] Read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
   - [ ] Use tokens from `src/lib/design-system.ts`
   - [ ] Never hardcode colors, spacing, shadows, or animations

2. **Check Component Catalog**
   - [ ] Search [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)
   - [ ] Reuse existing components when possible
   - [ ] Check system components first (SystemButton, SystemCard, etc.)

3. **Check This File (DONT_RECREATE.md)**
   - [ ] Review existing hooks
   - [ ] Review existing utilities
   - [ ] Review existing API clients
   - [ ] Review existing patterns

4. **Check API Patterns**
   - [ ] Read [API_PATTERNS.md](./API_PATTERNS.md)
   - [ ] Use existing API clients
   - [ ] Follow established patterns

5. **Check Developer Guide**
   - [ ] Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)
   - [ ] Follow architecture layers
   - [ ] Follow naming conventions

---

## 🔄 How to Update This Checklist

When you create a new reusable system:

1. Add an entry in the appropriate category
2. Include:
   - ✅ Checkbox
   - System name and file location
   - "What it does" description
   - "When to use" guidance
   - "Never do" anti-pattern
   - Import example
   - Key features/API
3. Keep entries organized by category
4. Link to full documentation if available

---

## 📚 Additional Resources

- **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** - Main developer navigation
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Complete design token catalog
- **[COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)** - All existing components
- **[API_PATTERNS.md](./API_PATTERNS.md)** - API integration patterns

---

## ⚠️ Common Mistakes to Avoid

### ❌ Creating a new hook when one exists
**Example**: Creating `useTaskApi` when `src/lib/api.ts` already has `taskApi`

**Prevention**: Check this file and `src/hooks/` directory first

---

### ❌ Hardcoding design values
**Example**: `backgroundColor: '#002b36'` instead of `backgroundColor: semanticColors.bg.primary`

**Prevention**: Always import from design-system.ts, ESLint will catch violations

---

### ❌ Recreating component logic
**Example**: Creating a new horizontal carousel instead of using `CategoryRow.tsx`

**Prevention**: Check COMPONENT_CATALOG.md before creating components

---

### ❌ Direct API calls
**Example**: `fetch('/api/tasks')` instead of `taskApi.getTasks()`

**Prevention**: Use API clients from `src/lib/api.ts` or `src/lib/ai-api.ts`

---

### ❌ Inline type definitions
**Example**: Defining `Task` type in component instead of importing from `@/types/task`

**Prevention**: Check `src/types/` directory for existing types

---

**Last Updated**: 2025-10-23

**Remember**: If it feels like something that should exist, it probably does. Search first, code second!
