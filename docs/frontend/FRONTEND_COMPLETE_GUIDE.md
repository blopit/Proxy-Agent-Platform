# Frontend Complete Developer Guide

**Proxy Agent Platform - Frontend Documentation**

This comprehensive guide covers everything a frontend developer needs to know to work effectively on this project.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Tech Stack Overview](#tech-stack-overview)
3. [Project Architecture](#project-architecture)
4. [Design System](#design-system)
5. [Component Development](#component-development)
6. [State Management](#state-management)
7. [Styling Approaches](#styling-approaches)
8. [Storybook Development](#storybook-development)
9. [API Integration](#api-integration)
10. [Custom Hooks](#custom-hooks)
11. [Testing Strategy](#testing-strategy)
12. [Performance Optimization](#performance-optimization)
13. [Build & Deployment](#build--deployment)
14. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend API running at `http://localhost:8000`
- Modern browser (Chrome, Firefox, Edge, Safari)

### Installation & Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Open http://localhost:3000

# Start Storybook (component development)
npm run storybook
# Open http://localhost:6006
```

### Essential Commands

```bash
npm run dev              # Start Next.js dev server (port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run type-check       # TypeScript type checking
npm run storybook        # Start Storybook dev server (port 6006)
npm run build-storybook  # Build Storybook for production
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage report
```

---

## Tech Stack Overview

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.6 | React framework with App Router |
| **React** | 18.2.0 | UI library |
| **TypeScript** | 5.2.2 | Type safety |
| **Tailwind CSS** | 3.3.0 | Utility-first CSS framework |
| **Storybook** | 9.1.15 | Component development & documentation |

### Key Libraries

- **framer-motion** (12.23.24) - Animations and gestures
- **lucide-react** (0.292.0) - Icon library
- **recharts** (3.3.0) - Data visualization
- **date-fns** (4.1.0) - Date utilities
- **react-hot-toast** (2.6.0) - Toast notifications
- **clsx** + **tailwind-merge** - Conditional class management
- **openmoji** (16.0.0) - Emoji graphics
- **@copilotkit/react-core** + **@copilotkit/react-ui** (1.10.6) - AI copilot integration

### Development Tools

- **ESLint** - Code linting
- **Storybook Addons**: a11y, essentials, docs
- **@testing-library/react** - Component testing
- **jest** - Test runner
- **openapi-typescript** - API type generation

---

## Project Architecture

### Directory Structure

```
frontend/
├── .storybook/              # Storybook configuration
│   ├── main.ts              # Main config (addons, framework)
│   ├── preview.ts           # Global decorators, themes
│   ├── themes.ts            # 20+ color themes
│   └── test-setup.ts        # Test configuration
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Dashboard (home)
│   │   ├── globals.css      # Global styles
│   │   ├── mobile/          # Mobile-specific routes
│   │   ├── demo/            # Demo pages
│   │   ├── tasks/           # Task management routes
│   │   └── api/             # API routes (if any)
│   │
│   ├── components/          # React components
│   │   ├── _TEMPLATE.tsx    # Component template (use this!)
│   │   ├── mobile/          # Mobile-first components (50+)
│   │   │   ├── modes/       # Biological workflow modes
│   │   │   │   ├── CaptureMode.tsx
│   │   │   │   ├── ScoutMode.tsx
│   │   │   │   ├── HunterMode.tsx
│   │   │   │   ├── MapperMode.tsx
│   │   │   │   └── MenderMode.tsx
│   │   │   ├── cards/       # Card components
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   └── TaskCardBig.tsx
│   │   │   └── [50+ mobile components]
│   │   ├── shared/          # Shared components
│   │   │   ├── AsyncJobTimeline.tsx
│   │   │   ├── OpenMoji.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── TaskCheckbox.tsx
│   │   ├── dashboard/       # Dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── ProductivityChart.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   └── AgentCard.tsx
│   │   ├── tasks/           # Task management components
│   │   │   ├── QuickCapture.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── SimpleTaskList.tsx
│   │   │   └── TaskDashboard.tsx
│   │   ├── system/          # Design system primitives
│   │   │   ├── SystemButton.tsx
│   │   │   ├── SystemCard.tsx
│   │   │   ├── SystemInput.tsx
│   │   │   ├── SystemModal.tsx
│   │   │   ├── SystemBadge.tsx
│   │   │   └── SystemToast.tsx
│   │   └── ui/              # shadcn/ui components
│   │       └── card.tsx
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useVoiceInput.ts     # Web Speech API integration
│   │   ├── useWebSocket.ts      # Real-time WebSocket
│   │   └── useCaptureFlow.ts    # Task capture workflow
│   │
│   ├── contexts/            # React Context providers
│   │   └── ThemeContext.tsx     # Light/dark theme management
│   │
│   ├── lib/                 # Utilities & API clients
│   │   ├── design-system.ts     # CRITICAL: Design tokens
│   │   ├── api.ts               # API client
│   │   ├── ai-api.ts            # AI endpoints
│   │   ├── card-utils.ts        # Card component utilities
│   │   ├── hierarchy-config.ts  # Task hierarchy config
│   │   └── utils.ts             # General utilities
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── task.ts
│   │   ├── agent.ts
│   │   ├── user.ts
│   │   └── [other types]
│   │
│   ├── services/            # Service layer (API communication)
│   │
│   └── utils/               # Helper utilities
│
├── public/                  # Static assets
│
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── next.config.js           # Next.js configuration
├── .eslintrc.json           # ESLint configuration
└── README.md                # Frontend README

```

### Architecture Layers

The frontend follows a **4-layer architecture**:

```
┌──────────────────────────────────────────────────┐
│  Layer 1: Pages (App Router)                     │
│  • Route definitions                             │
│  • Server components                             │
│  • Layout composition                            │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  Layer 2: Components                             │
│  • Presentation logic                            │
│  • UI composition                                │
│  • Event handling                                │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  Layer 3: Hooks (Business Logic)                 │
│  • State management                              │
│  • Side effects                                  │
│  • Reusable logic                                │
└──────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────┐
│  Layer 4: Services & Utilities                   │
│  • API communication                             │
│  • Data transformation                           │
│  • Helper functions                              │
└──────────────────────────────────────────────────┘
```

---

## Design System

### Overview

The design system is the **single source of truth** for all design decisions. It lives in `src/lib/design-system.ts` and provides design tokens for:

- Spacing (4px grid)
- Colors (Solarized palette + semantic mappings)
- Typography
- Border radius
- Shadows
- Animations
- Icons
- Z-index
- And more...

### Critical Rules

**⚠️ NEVER HARDCODE DESIGN VALUES**

```typescript
// ❌ BAD: Hardcoded values
<div style={{
  padding: '16px',
  backgroundColor: '#002b36',
  fontSize: '18px',
  borderRadius: '16px'
}} />

// ✅ GOOD: Using design tokens
import { spacing, semanticColors, fontSize, borderRadius } from '@/lib/design-system'

<div style={{
  padding: spacing[4],                    // 16px
  backgroundColor: semanticColors.bg.primary,
  fontSize: fontSize.lg,                  // 18px
  borderRadius: borderRadius.lg           // 16px
}} />
```

### Design Tokens Reference

#### Spacing (4px grid)

```typescript
import { spacing } from '@/lib/design-system'

spacing[0]  // 0px
spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px
spacing[6]  // 24px
spacing[8]  // 32px
spacing[12] // 48px
spacing[16] // 64px
spacing[20] // 80px
spacing[24] // 96px
spacing[32] // 128px
```

**Usage:**
- Padding: `padding: spacing[4]`
- Margin: `margin: spacing[2]`
- Gap: `gap: spacing[3]`
- Width/Height: `width: spacing[20]`

#### Semantic Colors

```typescript
import { semanticColors } from '@/lib/design-system'

// Backgrounds
semanticColors.bg.primary       // Main background
semanticColors.bg.secondary     // Secondary background
semanticColors.bg.tertiary      // Tertiary background
semanticColors.bg.hover         // Hover state

// Text
semanticColors.text.primary     // Main text
semanticColors.text.secondary   // Secondary text
semanticColors.text.muted       // Muted text
semanticColors.text.inverse     // Inverse text (on dark bg)

// Borders
semanticColors.border.default   // Default border
semanticColors.border.emphasis  // Emphasized border

// Accents
semanticColors.accent.primary   // Primary accent (blue)
semanticColors.accent.secondary // Secondary accent
semanticColors.accent.soft      // Soft accent

// Status
semanticColors.status.success   // Green
semanticColors.status.warning   // Yellow
semanticColors.status.error     // Red
semanticColors.status.info      // Cyan
```

#### Typography

```typescript
import { fontSize, fontWeight } from '@/lib/design-system'

fontSize.xs     // 12px - captions
fontSize.sm     // 14px - small text
fontSize.base   // 16px - body text
fontSize.lg     // 18px - headings
fontSize.xl     // 20px - large headings
fontSize['2xl'] // 24px
fontSize['3xl'] // 30px
fontSize['4xl'] // 36px

fontWeight.normal   // 400
fontWeight.medium   // 500
fontWeight.semibold // 600
fontWeight.bold     // 700
```

#### Border Radius

```typescript
import { borderRadius } from '@/lib/design-system'

borderRadius.sm    // 4px
borderRadius.base  // 8px
borderRadius.md    // 12px
borderRadius.lg    // 16px
borderRadius.xl    // 24px
borderRadius.pill  // 9999px (fully rounded)
borderRadius.circle // 50%
```

#### Shadows

```typescript
import { shadow } from '@/lib/design-system'

shadow.sm  // Small shadow
shadow.md  // Medium shadow
shadow.lg  // Large shadow
shadow.xl  // Extra large shadow
```

#### Animations

```typescript
import { duration, easing } from '@/lib/design-system'

// Durations
duration.instant // 100ms
duration.fast    // 200ms
duration.normal  // 300ms
duration.slow    // 500ms

// Easing
easing.easeIn
easing.easeOut
easing.easeInOut
easing.spring

// Usage
transition: `all ${duration.normal} ${easing.easeInOut}`
```

#### Icon Sizes

```typescript
import { iconSize } from '@/lib/design-system'

iconSize.xs  // 12px
iconSize.sm  // 16px
iconSize.md  // 20px
iconSize.lg  // 24px
iconSize.xl  // 32px
```

### Component Template

Always use `src/components/_TEMPLATE.tsx` as a starting point for new components. It includes:
- Proper imports
- TypeScript interfaces
- JSDoc documentation
- Design system usage examples
- Best practices comments

---

## Component Development

### Component Organization

Components are organized by purpose:

1. **`mobile/`** - Mobile-first components (50+)
   - Primary UI components for mobile experience
   - Includes 5 biological workflow modes (Capture, Scout, Hunt, Map, Mend)
   - Cards, buttons, modals, navigation

2. **`shared/`** - Shared/reusable components
   - Used across multiple contexts
   - Examples: AsyncJobTimeline, OpenMoji, ProgressBar, TaskCheckbox

3. **`dashboard/`** - Desktop dashboard components
   - Stats cards, charts, activity feeds
   - Desktop-optimized layouts

4. **`tasks/`** - Task management components
   - QuickCapture, TaskList, TaskDashboard

5. **`system/`** - Design system primitives
   - Base components following design system
   - SystemButton, SystemCard, SystemInput, etc.

6. **`ui/`** - shadcn/ui components
   - Low-level UI primitives

### Creating a New Component

#### Step 1: Check if it already exists

Before creating ANY component:
1. Check `frontend/COMPONENT_CATALOG.md` (if it exists)
2. Check `frontend/DONT_RECREATE.md` (if it exists)
3. Search the codebase: `rg "ComponentName" frontend/src/components`

#### Step 2: Copy the template

```bash
cp src/components/_TEMPLATE.tsx src/components/[category]/MyComponent.tsx
```

#### Step 3: Follow the template structure

```typescript
'use client'

import React, { useState } from 'react'
import {
  spacing,
  semanticColors,
  fontSize,
  borderRadius,
  shadow,
  duration
} from '@/lib/design-system'

/**
 * Props interface with JSDoc comments
 */
interface MyComponentProps {
  /** The title to display */
  title: string
  /** Optional callback */
  onClick?: () => void
}

/**
 * MyComponent - Brief description
 *
 * Longer description explaining what this component does,
 * when to use it, and any important notes.
 *
 * @example
 * ```tsx
 * <MyComponent title="Hello" onClick={() => alert('clicked')} />
 * ```
 */
export default function MyComponent({
  title,
  onClick
}: MyComponentProps) {
  // Implementation using design tokens
  return (
    <div style={{
      padding: spacing[4],
      backgroundColor: semanticColors.bg.secondary,
      borderRadius: borderRadius.lg,
      boxShadow: shadow.md
    }}>
      <h3 style={{
        fontSize: fontSize.lg,
        color: semanticColors.text.primary
      }}>
        {title}
      </h3>
    </div>
  )
}
```

#### Step 4: Add TypeScript types

All props must have TypeScript interfaces with JSDoc comments:

```typescript
interface ComponentProps {
  /** Required string prop */
  title: string

  /** Optional number with default */
  count?: number

  /** Callback function */
  onSubmit?: (data: FormData) => void

  /** Union type */
  variant?: 'primary' | 'secondary' | 'tertiary'

  /** Child elements */
  children?: React.ReactNode
}
```

#### Step 5: Use proper event handlers

```typescript
// ❌ BAD: Inline arrow functions
<button onClick={() => doSomething()}>Click</button>

// ✅ GOOD: Named handlers
const handleClick = () => {
  doSomething()
}

return <button onClick={handleClick}>Click</button>
```

#### Step 6: Test in browser

1. Import your component in a page
2. Test at `http://localhost:3000`
3. Verify design tokens are used correctly
4. Test responsive behavior
5. Check console for errors

### Component Best Practices

#### 1. Always use 'use client' for interactive components

```typescript
'use client' // Required for useState, useEffect, event handlers

import React, { useState } from 'react'
```

#### 2. Destructure props in function signature

```typescript
// ✅ GOOD
export default function MyComponent({ title, count }: MyComponentProps) {
  // ...
}

// ❌ BAD
export default function MyComponent(props: MyComponentProps) {
  const { title, count } = props // Extra step
}
```

#### 3. Use semantic HTML

```typescript
// ✅ GOOD: Semantic elements
<header>
  <nav>
    <button>Click me</button>
  </nav>
</header>

// ❌ BAD: Div soup
<div>
  <div>
    <div onClick={handler}>Click me</div>
  </div>
</div>
```

#### 4. Handle loading and error states

```typescript
export default function MyComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (error) {
    return <div style={{ color: semanticColors.status.error }}>{error}</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <div>Content</div>
}
```

#### 5. Clean up side effects

```typescript
useEffect(() => {
  const subscription = subscribeToData()

  // Always return cleanup function
  return () => {
    subscription.unsubscribe()
  }
}, [])
```

---

## State Management

### Current Approach

The project uses **React hooks** for state management:
- `useState` - Local component state
- `useEffect` - Side effects
- `useContext` - Global state (ThemeContext)
- Custom hooks - Reusable stateful logic

No external state management library (Redux, Zustand, etc.) is currently used.

### ThemeContext (Global State)

Location: `src/contexts/ThemeContext.tsx`

Manages light/dark theme with Solarized colors.

**Usage:**

```typescript
import { useTheme } from '@/contexts/ThemeContext'

export default function MyComponent() {
  const { mode, colors, toggleTheme, setTheme } = useTheme()

  return (
    <div style={{ backgroundColor: colors.background }}>
      <p style={{ color: colors.text }}>
        Current theme: {mode}
      </p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}
```

**Available values:**

```typescript
interface ThemeContextValue {
  mode: 'light' | 'dark'
  colors: ThemeColors
  toggleTheme: () => void
  setTheme: (mode: 'light' | 'dark') => void
}

interface ThemeColors {
  background: string
  backgroundSecondary: string
  text: string
  textSecondary: string
  textMuted: string
  border: string
  borderSecondary: string
  blue: string
  green: string
  red: string
  yellow: string
  orange: string
  cyan: string
  magenta: string
}
```

### Local State Patterns

#### Simple State

```typescript
const [count, setCount] = useState(0)
const [isOpen, setIsOpen] = useState(false)
const [text, setText] = useState('')
```

#### Complex State (Object)

```typescript
interface FormState {
  name: string
  email: string
  message: string
}

const [form, setForm] = useState<FormState>({
  name: '',
  email: '',
  message: ''
})

// Update single field
setForm(prev => ({ ...prev, name: 'John' }))

// Update multiple fields
setForm(prev => ({ ...prev, name: 'John', email: 'john@example.com' }))
```

#### Derived State

```typescript
// ❌ BAD: Unnecessary state
const [count, setCount] = useState(0)
const [doubleCount, setDoubleCount] = useState(0)

useEffect(() => {
  setDoubleCount(count * 2)
}, [count])

// ✅ GOOD: Derived value
const [count, setCount] = useState(0)
const doubleCount = count * 2 // Just calculate it
```

---

## Styling Approaches

The project uses **multiple styling approaches**:

### 1. Tailwind CSS (Utility classes)

Used for layout and common patterns.

```typescript
<div className="flex flex-col gap-2 p-4">
  <h1 className="text-lg font-semibold">Title</h1>
  <p className="text-sm text-gray-600">Description</p>
</div>
```

**Tailwind Configuration:** `tailwind.config.js`

Custom colors, animations, and utilities are defined there.

### 2. Inline Styles with Design Tokens (Preferred for custom styling)

Used for component-specific styling with design system tokens.

```typescript
import { spacing, semanticColors, fontSize, borderRadius } from '@/lib/design-system'

<div style={{
  padding: spacing[4],
  backgroundColor: semanticColors.bg.secondary,
  fontSize: fontSize.base,
  borderRadius: borderRadius.lg
}}>
  Content
</div>
```

**Why inline styles?**
- TypeScript autocomplete for design tokens
- No CSS class naming conflicts
- Easy to see all styles in one place
- Dynamic styling based on props/state

### 3. CSS Modules (Rare)

Only used for complex animations or legacy code.

Example: `ChevronProgress.css`

### Choosing the Right Approach

| Use Case | Approach | Example |
|----------|----------|---------|
| Layout (flex, grid) | Tailwind | `className="flex flex-col gap-4"` |
| Responsive design | Tailwind | `className="md:grid-cols-2 lg:grid-cols-3"` |
| Component styling | Inline + Design Tokens | `style={{ padding: spacing[4] }}` |
| Dynamic colors | Design Tokens | `style={{ color: semanticColors.text.primary }}` |
| Complex animations | CSS Modules | `import styles from './styles.css'` |

### Combining Approaches

```typescript
import { spacing, semanticColors } from '@/lib/design-system'

<div
  className="flex flex-col gap-2" // Tailwind for layout
  style={{
    // Design tokens for custom styling
    padding: spacing[4],
    backgroundColor: semanticColors.bg.secondary
  }}
>
  Content
</div>
```

---

## Storybook Development

### Overview

Storybook is used for component development, documentation, and testing in isolation.

**Current Setup:**
- Storybook 9.1.15
- Next.js integration
- 28+ stories created
- 20+ color themes available
- Accessibility testing (a11y addon)

### Running Storybook

```bash
npm run storybook        # Start dev server (http://localhost:6006)
npm run build-storybook  # Build for production
```

### Creating a Story

Every significant component should have a `.stories.tsx` file.

**Location:** Same directory as the component

Example: `src/components/mobile/ChevronButton.stories.tsx`

**Story Template:**

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import MyComponent from './MyComponent'

const meta: Meta<typeof MyComponent> = {
  title: 'Mobile/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary']
    },
    onClick: { action: 'clicked' }
  }
}

export default meta
type Story = StoryObj<typeof MyComponent>

// Default story
export const Default: Story = {
  args: {
    title: 'Hello World',
    variant: 'primary'
  }
}

// Variant stories
export const Secondary: Story = {
  args: {
    ...Default.args,
    variant: 'secondary'
  }
}

export const WithLongText: Story = {
  args: {
    title: 'This is a very long title that might wrap to multiple lines'
  }
}

// Interactive story
export const Interactive: Story = {
  render: (args) => {
    const [count, setCount] = React.useState(0)
    return (
      <MyComponent
        {...args}
        title={`Clicked ${count} times`}
        onClick={() => setCount(c => c + 1)}
      />
    )
  }
}
```

### Storybook Themes

The project has **20+ color themes** available in Storybook:

**Classic Themes:**
- Solarized Light/Dark
- Dracula
- Nord Light/Dark
- Gruvbox Light/Dark
- Tokyo Night
- Monokai
- One Dark
- Catppuccin Latte/Mocha
- Material Light/Dark

**Creative Themes:**
- Jungle 🌿
- Oceanic 🌊
- Sunset 🌅
- Aurora 🌌
- Synthwave '84 🕶️
- Nightfox 🦊
- Cyberpunk 🤖

Themes can be switched using the toolbar in Storybook.

### Storybook Configuration

**Main Config:** `.storybook/main.ts`
- Defines addons (essentials, a11y)
- Next.js framework integration
- Webpack customization
- TypeScript configuration

**Preview Config:** `.storybook/preview.ts`
- Global decorators (theme provider)
- Default parameters
- Viewport configurations (mobile, tablet, desktop, wide)
- Accessibility settings

### Accessibility Testing

Storybook includes the **a11y addon** for accessibility testing.

Tests for:
- Color contrast
- ARIA labels
- Keyboard navigation
- Screen reader compatibility

View the "Accessibility" panel in Storybook to see violations.

---

## API Integration

### API Client

Location: `src/lib/api.ts`

Centralized API client with typed methods for all backend endpoints.

**Usage:**

```typescript
import { apiClient } from '@/lib/api'

// Get tasks
const tasks = await apiClient.getTasks({
  user_id: 'demo-user',
  limit: 50
})

// Quick capture
const result = await apiClient.quickCapture({
  text: 'Deploy to production',
  user_id: 'demo-user',
  auto_mode: true
})

// Get energy level
const energy = await apiClient.getEnergyLevel('demo-user')

// Update task status
await apiClient.updateTaskStatus('task-123', 'completed')
```

### AI API Client

Location: `src/lib/ai-api.ts`

Handles AI-specific endpoints.

```typescript
import { aiClient } from '@/lib/ai-api'

// Analyze task
const analysis = await aiClient.analyzeTask('task-123')

// Get suggestions
const suggestions = await aiClient.getSuggestions('demo-user')
```

### Environment Variables

API URL is configured via environment variable:

**.env.local:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Usage in code:**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
```

### Error Handling

```typescript
try {
  const tasks = await apiClient.getTasks({ user_id: 'demo-user' })
  // Handle success
} catch (error) {
  console.error('Failed to fetch tasks:', error)
  // Handle error (show toast, etc.)
}
```

### Optimistic Updates

```typescript
// Update UI immediately
setTasks(prev => prev.map(t =>
  t.id === taskId ? { ...t, status: 'completed' } : t
))

// Update on server
try {
  await apiClient.updateTaskStatus(taskId, 'completed')
} catch (error) {
  // Rollback on error
  setTasks(prev => prev.map(t =>
    t.id === taskId ? { ...t, status: 'pending' } : t
  ))
}
```

---

## Custom Hooks

The project includes 3 custom hooks for common patterns.

### useVoiceInput

Location: `src/hooks/useVoiceInput.ts`

Web Speech API integration for voice-to-text input.

**Usage:**

```typescript
import { useVoiceInput } from '@/hooks/useVoiceInput'

export default function MyComponent() {
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error
  } = useVoiceInput({
    onTranscript: (text) => console.log('Final:', text),
    onInterim: (text) => console.log('Interim:', text),
    onError: (error) => console.error('Error:', error),
    continuous: true,
    interimResults: true,
    lang: 'en-US'
  })

  if (!isSupported) {
    return <div>Voice input not supported</div>
  }

  return (
    <div>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop' : 'Start'} Listening
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <p>Transcript: {transcript}</p>
      <p>Interim: {interimTranscript}</p>
    </div>
  )
}
```

### useWebSocket

Location: `src/hooks/useWebSocket.ts`

Real-time WebSocket connection for live updates.

**Usage:**

```typescript
import { useWebSocket } from '@/hooks/useWebSocket'

export default function MyComponent() {
  const { isConnected, lastMessage, sendMessage } = useWebSocket({
    userId: 'demo-user',
    onMessage: (data) => {
      console.log('Received:', data)
      // Handle message
    },
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onError: (error) => console.error('WebSocket error:', error)
  })

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <button onClick={() => sendMessage({ type: 'ping' })}>
        Send Ping
      </button>
    </div>
  )
}
```

### useCaptureFlow

Location: `src/hooks/useCaptureFlow.ts`

Task capture workflow with voice input integration.

**Usage:**

```typescript
import { useCaptureFlow } from '@/hooks/useCaptureFlow'

export default function CaptureMode() {
  const {
    state,
    startCapture,
    stopCapture,
    submitTask,
    reset
  } = useCaptureFlow({
    userId: 'demo-user',
    onSuccess: (task) => console.log('Task created:', task),
    onError: (error) => console.error('Error:', error)
  })

  return (
    <div>
      {state.isListening ? (
        <button onClick={stopCapture}>Stop</button>
      ) : (
        <button onClick={startCapture}>Start Capture</button>
      )}
      <p>Transcript: {state.transcript}</p>
      {state.isProcessing && <div>Processing...</div>}
      {state.error && <div style={{ color: 'red' }}>{state.error}</div>}
    </div>
  )
}
```

---

## Testing Strategy

### Current Testing Setup

- **Framework:** Jest
- **Testing Library:** @testing-library/react
- **Coverage:** Available via `npm run test:coverage`

### Test Structure

Tests live next to the components they test:

```
components/
  tasks/
    QuickCapture.tsx
    __tests__/
      QuickCapture.test.tsx
  shared/
    AsyncJobTimeline.tsx
    __tests__/
      AsyncJobTimeline.test.tsx
      AsyncJobTimeline.performance.test.tsx
```

### Running Tests

```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report
```

### Writing Tests

**Component Test Template:**

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" />)
    expect(screen.getByText('Test')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<MyComponent title="Test" onClick={handleClick} />)

    fireEvent.click(screen.getByText('Test'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<MyComponent title="Test" isLoading={true} />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
```

### Performance Testing

Example: `AsyncJobTimeline.performance.test.tsx`

Tests for:
- Render performance
- Re-render optimization
- Memory leaks

---

## Performance Optimization

### Performance Targets

- **2-second task capture** - From voice input to saved
- **< 500ms API response** - Average response time
- **< 100ms UI updates** - Optimistic updates
- **< 2s dashboard load** - Complete dashboard with data
- **60fps animations** - Smooth particle physics

### Optimization Techniques

#### 1. React.memo for expensive components

```typescript
import React, { memo } from 'react'

const ExpensiveComponent = memo(({ data }: Props) => {
  // Only re-renders when data changes
  return <div>{/* ... */}</div>
})
```

#### 2. useMemo for expensive calculations

```typescript
const sortedTasks = useMemo(() => {
  return tasks.sort((a, b) => a.priority - b.priority)
}, [tasks]) // Only recalculate when tasks change
```

#### 3. useCallback for stable function references

```typescript
const handleClick = useCallback(() => {
  doSomething(id)
}, [id]) // Only recreate when id changes
```

#### 4. Lazy loading

```typescript
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false // Client-side only
})
```

#### 5. Virtualization for long lists

For lists with 100+ items, consider using `react-window` or `react-virtual`.

---

## Build & Deployment

### Production Build

```bash
npm run build  # Creates optimized production build
npm run start  # Starts production server
```

**Output:** `.next/` directory

### Build Checks

Before deploying:

```bash
npm run lint        # Check for linting errors
npm run type-check  # Check for TypeScript errors
npm run build       # Ensure build succeeds
```

### Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, set environment variables in your hosting platform.

### Next.js App Router

The project uses **Next.js 15 App Router** with:
- Server components by default
- Client components with `'use client'`
- File-based routing
- Layouts and nested routes

**Key Routes:**
- `/` - Dashboard (home)
- `/mobile` - Mobile interface
- `/tasks` - Task management
- `/demo` - Demo pages

---

## Troubleshooting

### Common Issues

#### Issue: Component not rendering

**Check:**
1. Is `'use client'` directive present for interactive components?
2. Are all imports correct?
3. Is the component exported properly?
4. Check browser console for errors

#### Issue: Design tokens not working

**Check:**
1. Import statement: `import { spacing } from '@/lib/design-system'`
2. Correct usage: `spacing[4]` not `spacing.4`
3. TypeScript errors in IDE

#### Issue: Storybook not starting

**Try:**
```bash
rm -rf node_modules
npm install
npm run storybook
```

**Check:**
- `.storybook/main.ts` configuration
- No syntax errors in `.stories.tsx` files

#### Issue: API calls failing

**Check:**
1. Backend is running at `http://localhost:8000`
2. `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Network tab in browser DevTools
4. CORS configuration on backend

#### Issue: TypeScript errors

```bash
npm run type-check  # See all TypeScript errors
```

**Common fixes:**
- Add missing type definitions
- Fix prop types in components
- Add `// @ts-ignore` as last resort (not recommended)

#### Issue: Build failing

```bash
npm run build
```

**Common causes:**
- TypeScript errors
- ESLint errors
- Missing dependencies
- Environment variables not set

**Fix:**
```bash
npm run lint:fix   # Fix linting
npm run type-check # Check types
npm install        # Reinstall dependencies
```

---

## Additional Resources

### Documentation

- [Frontend README](../../frontend/README.md) - Quick start guide
- [Platform README](../../README.md) - Project overview
- [Backend CLAUDE.md](../../CLAUDE.md) - Backend coding standards

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

---

## Quick Reference

### File Paths

```
Design System:     src/lib/design-system.ts
API Client:        src/lib/api.ts
Component Template: src/components/_TEMPLATE.tsx
Theme Context:     src/contexts/ThemeContext.tsx
Voice Hook:        src/hooks/useVoiceInput.ts
WebSocket Hook:    src/hooks/useWebSocket.ts
```

### Import Aliases

```typescript
import { something } from '@/lib/utils'        // @/ = src/
import Component from '@/components/Component'
import { apiClient } from '@/lib/api'
```

### Most Used Design Tokens

```typescript
import {
  spacing,           // Spacing scale (0-32)
  semanticColors,    // Semantic color mappings
  fontSize,          // Font sizes (xs-4xl)
  borderRadius,      // Border radius (sm-pill)
  shadow,            // Box shadows (sm-xl)
  duration,          // Animation durations
  iconSize           // Icon sizes (xs-xl)
} from '@/lib/design-system'
```

---

**Last Updated:** October 28, 2025
**Maintained By:** Frontend Development Team

For questions or issues, check the troubleshooting section or ask in team chat.
