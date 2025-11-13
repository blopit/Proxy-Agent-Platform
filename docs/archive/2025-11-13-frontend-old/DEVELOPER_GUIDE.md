# Next.js Web Dashboard Developer Guide

Welcome to the Proxy Agent Platform web dashboard! This guide covers the **Next.js web interface** for desktop power users.

> **⚠️ Important**: This is the **SECONDARY** frontend. For mobile development, see `/mobile/README.md`.
>
> **Frontend Architecture**:
> - **Primary**: `/mobile/` - Expo/React Native app (iOS, Android, Web)
> - **Secondary**: `/frontend/` - Next.js web dashboard (this guide)

This guide will help you navigate the web dashboard codebase, discover existing systems, and follow development standards.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend API running at `http://localhost:8000`
- Basic knowledge of Next.js 14, React, TypeScript, and Tailwind CSS

### Setup Commands
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm run dev

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test
```

## ⚠️ BEFORE YOU CODE - Essential Checklist

Before writing ANY code, check these resources to avoid duplication:

1. **[COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)** - Does the component already exist?
2. **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Use design tokens, not hardcoded values
3. **[DONT_RECREATE.md](./DONT_RECREATE.md)** - Check existing systems (hooks, utilities, patterns)
4. **[API_PATTERNS.md](./API_PATTERNS.md)** - How to integrate with backend APIs

**Golden Rule**: If it feels like something that should exist, it probably does. Search first, code second.

---

## 🏗️ Architecture Overview

The frontend follows a **4-layer architecture** for clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: Pages (App Router)                            │
│  src/app/                                                │
│  • Route definitions                                     │
│  • Layout components                                     │
│  • Server components                                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 2: Components                                     │
│  src/components/                                         │
│  • Presentational UI components                          │
│  • Business logic components                             │
│  • Organized by feature domain                           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 3: Hooks (React Hooks)                            │
│  src/hooks/                                              │
│  • Custom React hooks                                    │
│  • Reusable stateful logic                               │
│  • Side effect management                                │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Layer 4: Library & Utilities                            │
│  src/lib/ + src/types/                                   │
│  • API clients                                           │
│  • Utility functions                                     │
│  • Type definitions                                      │
│  • Design system tokens                                  │
└─────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

**Layer 1: Pages** (`src/app/`)
- Define routes using Next.js App Router
- Handle server-side rendering and data fetching
- Compose page layouts from components
- **DO**: Route configuration, layout composition
- **DON'T**: Business logic, API calls (use hooks), styling logic

**Layer 2: Components** (`src/components/`)
- Reusable UI building blocks
- Feature-specific components organized by domain
- **DO**: UI rendering, event handling, component composition
- **DON'T**: Direct API calls (use hooks), hardcoded values (use design system)

**Layer 3: Hooks** (`src/hooks/`)
- Encapsulate stateful logic and side effects
- Handle API integration, WebSocket connections, voice input
- **DO**: State management, API integration, side effects
- **DON'T**: UI rendering (return data, not JSX)

**Layer 4: Library** (`src/lib/` + `src/types/`)
- Pure utility functions with no React dependencies
- API client wrappers
- Type definitions and schemas
- Design system tokens
- **DO**: Reusable utilities, API clients, type definitions
- **DON'T**: React-specific code (use hooks instead)

---

## 📁 Directory Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router (Layer 1)
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Dashboard page
│   │   ├── mobile/                   # Mobile app routes
│   │   │   ├── page.tsx              # Mobile shell
│   │   │   └── capture/              # Capture mode route
│   │   └── tasks/                    # Task management routes
│   │
│   ├── components/                   # React Components (Layer 2)
│   │   ├── mobile/                   # Mobile-specific components
│   │   │   ├── modes/                # Biological mode components
│   │   │   │   ├── CaptureMode.tsx   # Capture mode
│   │   │   │   ├── ScoutMode.tsx     # Scout mode (Netflix-style)
│   │   │   │   ├── HunterMode.tsx    # Hunter mode
│   │   │   │   ├── MapperMode.tsx    # Mapper mode
│   │   │   │   └── MenderMode.tsx    # Mender mode
│   │   │   ├── cards/                # Card components
│   │   │   ├── BiologicalTabs.tsx    # Bottom tab navigation
│   │   │   ├── CategoryRow.tsx       # Horizontal carousel
│   │   │   ├── RewardCelebration.tsx # Gamification animations
│   │   │   └── [50+ other components]
│   │   ├── dashboard/                # Dashboard components
│   │   ├── tasks/                    # Task management components
│   │   ├── system/                   # Design system components
│   │   └── ui/                       # shadcn/ui components
│   │
│   ├── hooks/                        # Custom React Hooks (Layer 3)
│   │   ├── useCaptureFlow.ts         # Task capture flow logic
│   │   ├── useVoiceInput.ts          # Voice input handling
│   │   └── useWebSocket.ts           # WebSocket connection
│   │
│   ├── lib/                          # Library & Utilities (Layer 4)
│   │   ├── design-system.ts          # Design tokens (CRITICAL!)
│   │   ├── api.ts                    # Main API client
│   │   ├── ai-api.ts                 # AI-specific API client
│   │   ├── utils.ts                  # Utility functions (cn)
│   │   └── card-utils.ts             # Card-specific utilities
│   │
│   └── types/                        # TypeScript Type Definitions
│       ├── task.ts                   # Task types
│       ├── task-schema.ts            # Task schemas
│       ├── capture.ts                # Capture types
│       └── task-card.ts              # Card types
│
├── public/                           # Static Assets
├── DEVELOPER_GUIDE.md                # This file
├── DESIGN_SYSTEM.md                  # Design token documentation
├── COMPONENT_CATALOG.md              # Component index
├── DONT_RECREATE.md                  # Existing systems checklist
├── API_PATTERNS.md                   # API integration guide
├── README.md                         # Project overview
└── package.json                      # Dependencies
```

---

## 🎨 Design System (CRITICAL!)

### The Golden Rule: NEVER HARDCODE DESIGN VALUES

**Always use tokens from `src/lib/design-system.ts`**

```typescript
import { spacing, semanticColors, fontSize, borderRadius, iconSize } from '@/lib/design-system'

// ✅ GOOD: Using design tokens
<div style={{
  padding: spacing[4],                    // 16px
  backgroundColor: semanticColors.bg.primary,
  color: semanticColors.text.primary,
  borderRadius: borderRadius.lg,          // 16px
  fontSize: fontSize.base                 // 16px
}} />

// ❌ BAD: Hardcoded values (ESLint will catch these!)
<div style={{
  padding: '16px',
  backgroundColor: '#002b36',
  color: '#93a1a1',
  borderRadius: '16px',
  fontSize: '16px'
}} />
```

### Why This Matters

1. **Theme Switching**: Semantic colors enable dark/light mode
2. **Consistency**: 4px grid system ensures visual harmony
3. **Maintainability**: Change once, apply everywhere
4. **Type Safety**: TypeScript autocomplete for all tokens

### Essential Design Tokens

```typescript
// Spacing (4px grid)
spacing[1]  // 4px
spacing[2]  // 8px
spacing[4]  // 16px (most common)
spacing[6]  // 24px

// Semantic Colors (theme-aware)
semanticColors.bg.primary      // Background
semanticColors.text.primary    // Main text
semanticColors.accent.primary  // Cyan accent
semanticColors.border.default  // Borders

// Typography
fontSize.xs    // 12px - captions
fontSize.sm    // 14px - body
fontSize.base  // 16px - default
fontSize.lg    // 18px - headings

// Border Radius
borderRadius.base  // 8px
borderRadius.lg    // 16px
borderRadius.pill  // 9999px

// Icon Sizes (for lucide-react)
iconSize.sm    // 16px
iconSize.base  // 20px
iconSize.lg    // 24px
```

**📚 Full Documentation**: See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete token catalog.

---

## 🔍 Where to Find What

### "I need to add a new page"
→ `src/app/` - Create a new folder with `page.tsx`

### "I need to create a UI component"
1. **Check [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)** - Does it exist?
2. If not, add to `src/components/` organized by feature domain
3. Import design tokens from `@/lib/design-system`

### "I need to call an API"
1. **Check [API_PATTERNS.md](./API_PATTERNS.md)** - See existing patterns
2. Use `src/lib/api.ts` or `src/lib/ai-api.ts` for API calls
3. Consider creating a custom hook in `src/hooks/` for complex logic

### "I need state management or side effects"
1. **Check [DONT_RECREATE.md](./DONT_RECREATE.md)** - Does a hook exist?
2. Create custom hook in `src/hooks/`
3. Keep hooks focused on one responsibility

### "I need to define types"
→ `src/types/` - Add TypeScript interfaces and types

### "I need a utility function"
1. **Check `src/lib/utils.ts`** - Does it exist?
2. Add pure functions to `src/lib/` (no React dependencies)

### "I need to add voice input"
→ Use `src/hooks/useVoiceInput.ts` - Already implemented!

### "I need WebSocket connection"
→ Use `src/hooks/useWebSocket.ts` - Already implemented!

### "I need task capture flow"
→ Use `src/hooks/useCaptureFlow.ts` - Already implemented!

---

## 🛠️ How to Add a New Feature (Step-by-Step)

### 1. Research Phase (ALWAYS START HERE)
- [ ] Check [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md) for existing components
- [ ] Check [DONT_RECREATE.md](./DONT_RECREATE.md) for existing systems
- [ ] Review [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for design tokens
- [ ] Check [API_PATTERNS.md](./API_PATTERNS.md) for API integration patterns

### 2. Design Phase
- [ ] Sketch component hierarchy
- [ ] Identify required design tokens (spacing, colors, etc.)
- [ ] Plan data flow (props down, events up)
- [ ] Identify needed types and interfaces

### 3. Implementation Phase
- [ ] Create types in `src/types/` if needed
- [ ] Create utility functions in `src/lib/` if needed
- [ ] Create custom hooks in `src/hooks/` for stateful logic
- [ ] Create components in `src/components/` organized by domain
- [ ] Use design system tokens exclusively
- [ ] Add TypeScript types to all props and functions

### 4. Integration Phase
- [ ] Import and use component in pages (`src/app/`)
- [ ] Test manually in browser
- [ ] Run type checking (`npm run type-check`)
- [ ] Run linting (`npm run lint`)

### 5. Documentation Phase
- [ ] Add component to [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)
- [ ] Add JSDoc comments to public APIs
- [ ] Update [DONT_RECREATE.md](./DONT_RECREATE.md) if you created a new system

---

## 📋 Component Creation Checklist

Before creating a new component:

- [ ] **Search first**: Check [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)
- [ ] **Use template**: Copy from `src/components/_TEMPLATE.tsx`
- [ ] **Import design system**: `import { spacing, semanticColors, ... } from '@/lib/design-system'`
- [ ] **Define TypeScript interface**: Strong typing for all props
- [ ] **Add JSDoc comments**: Explain purpose and usage
- [ ] **Use semantic colors**: Never hardcode colors
- [ ] **Follow 4px grid**: Use spacing tokens for all dimensions
- [ ] **Test in browser**: Manual testing before committing
- [ ] **Add to catalog**: Update [COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)

---

## ⚡ Common Patterns

### Pattern 1: Card with Hover Effect
```typescript
import { spacing, semanticColors, borderRadius, shadow, duration } from '@/lib/design-system'

<div
  style={{
    padding: spacing[4],
    backgroundColor: semanticColors.bg.secondary,
    borderRadius: borderRadius.lg,
    boxShadow: shadow.sm,
    transition: `all ${duration.normal}`,
    transform: 'translateZ(0)', // GPU acceleration
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'scale(1.02) translateZ(0)'
    e.currentTarget.style.boxShadow = shadow.md
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'scale(1) translateZ(0)'
    e.currentTarget.style.boxShadow = shadow.sm
  }}
>
  Card content
</div>
```

### Pattern 2: Button Component
```typescript
<button
  style={{
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: semanticColors.accent.primary,
    color: semanticColors.text.inverse,
    borderRadius: borderRadius.pill,
    fontSize: fontSize.sm,
    border: 'none',
    transition: `all ${duration.normal}`,
  }}
>
  Click me
</button>
```

### Pattern 3: API Call with Hook
```typescript
// src/hooks/useTaskList.ts
import { useState, useEffect } from 'react'
import { taskApi } from '@/lib/api'
import type { Task } from '@/types/task'

export function useTaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true)
      try {
        const data = await taskApi.getTasks()
        setTasks(data)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTasks()
  }, [])

  return { tasks, isLoading, error }
}
```

---

## 🚫 Anti-Patterns (DON'T DO THIS)

### ❌ Hardcoded Design Values
```typescript
// BAD
<div style={{ padding: '16px', color: '#93a1a1' }} />

// GOOD
<div style={{ padding: spacing[4], color: semanticColors.text.primary }} />
```

### ❌ API Calls in Components
```typescript
// BAD - Direct API call in component
function MyComponent() {
  useEffect(() => {
    fetch('/api/tasks').then(...)
  }, [])
}

// GOOD - Use a hook
function MyComponent() {
  const { tasks } = useTaskList()
}
```

### ❌ Missing TypeScript Types
```typescript
// BAD - No types
function Button({ onClick, children }) { ... }

// GOOD - Full typing
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
}
function Button({ onClick, children }: ButtonProps) { ... }
```

### ❌ Mixing Hardcoded and Design Tokens
```typescript
// BAD - Inconsistent
<div style={{ padding: spacing[4], margin: '8px' }} />

// GOOD - All tokens
<div style={{ padding: spacing[4], margin: spacing[2] }} />
```

---

## 🧪 Testing Strategy

### Manual Testing
1. Test in browser at `http://localhost:3000`
2. Test mobile viewport (DevTools device emulation)
3. Test interactions (clicks, hovers, touch)
4. Test API integration (check Network tab)

### Type Checking
```bash
npm run type-check
```
Fix all TypeScript errors before committing.

### Linting
```bash
npm run lint
```
ESLint will catch hardcoded design values and other violations.

### Unit Tests (Future)
```bash
npm test
```
Write tests for hooks and utility functions.

---

## 📚 Essential Documentation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)** | You are here! | Starting point for all developers |
| **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** | Design token catalog | Before styling any component |
| **[COMPONENT_CATALOG.md](./COMPONENT_CATALOG.md)** | Component inventory | Before creating a new component |
| **[DONT_RECREATE.md](./DONT_RECREATE.md)** | Existing systems checklist | Before implementing any feature |
| **[API_PATTERNS.md](./API_PATTERNS.md)** | API integration guide | Before making API calls |
| **[README.md](./README.md)** | Project overview | First-time setup |
| **[../CLAUDE.md](../CLAUDE.md)** | Backend coding standards | Full-stack development |
| **[../README.md](../README.md)** | Platform overview | Understanding the big picture |

---

## 🔧 Development Tools

### VS Code Extensions (Recommended)
- **ESLint** - Automatic linting
- **TypeScript Vue Plugin** - Better TypeScript support
- **Tailwind CSS IntelliSense** - Tailwind autocomplete
- **Pretty TypeScript Errors** - Readable TS errors

### Browser DevTools
- **React DevTools** - Component debugging
- **Network Tab** - API request inspection
- **Console** - Error debugging

### Command Palette
Use these npm scripts frequently:
```bash
npm run dev          # Start dev server
npm run type-check   # Check TypeScript
npm run lint         # Check linting
npm run build        # Production build
```

---

## 🆘 Getting Help

### When You're Stuck

1. **Search the docs** - Check all 5 documentation files
2. **Check the code** - Look at similar components for patterns
3. **Check git history** - See how others solved similar problems
4. **Ask in team chat** - Explain what you've tried
5. **Create an issue** - Document the problem for tracking

### Common Issues

**Q: ESLint complains about hardcoded colors**
A: Use `semanticColors` from design system instead

**Q: Component doesn't exist in COMPONENT_CATALOG.md**
A: You may need to create it! Follow the component creation checklist

**Q: TypeScript errors about missing types**
A: Import types from `src/types/` or define them in your file

**Q: API calls not working**
A: Check that backend is running at `http://localhost:8000`

---

## 🎯 Quick Reference

### Most Common Imports
```typescript
// Design System
import {
  spacing,
  semanticColors,
  fontSize,
  borderRadius,
  iconSize,
  shadow,
  duration
} from '@/lib/design-system'

// Utilities
import { cn } from '@/lib/utils'

// Icons
import { Search, Bot, Zap } from 'lucide-react'

// Types
import type { Task } from '@/types/task'
```

### Most Common Design Tokens
```typescript
padding: spacing[4]                    // 16px
backgroundColor: semanticColors.bg.primary
color: semanticColors.text.primary
fontSize: fontSize.base                // 16px
borderRadius: borderRadius.lg          // 16px
boxShadow: shadow.md
transition: `all ${duration.normal}`   // 300ms
```

### File Naming Conventions
- **Components**: `PascalCase.tsx` (e.g., `TaskCard.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useVoiceInput.ts`)
- **Utilities**: `kebab-case.ts` (e.g., `card-utils.ts`)
- **Types**: `kebab-case.ts` (e.g., `task-schema.ts`)

---

**Remember**: When in doubt, check the documentation. If something feels like it should exist, it probably does!

**Happy coding! 🚀**
