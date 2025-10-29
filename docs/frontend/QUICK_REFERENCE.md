# Frontend Quick Reference

Fast lookup guide for common patterns and code snippets.

---

## Design System Tokens

### Import Statement

```typescript
import {
  spacing,
  semanticColors,
  fontSize,
  fontWeight,
  borderRadius,
  shadow,
  duration,
  easing,
  iconSize,
  zIndex
} from '@/lib/design-system'
```

### Spacing (4px grid)

```typescript
spacing[0]  // 0px
spacing[1]  // 4px
spacing[2]  // 8px
spacing[3]  // 12px
spacing[4]  // 16px   ← Most common
spacing[6]  // 24px
spacing[8]  // 32px
spacing[12] // 48px
spacing[16] // 64px
```

### Semantic Colors

```typescript
// Backgrounds
semanticColors.bg.primary
semanticColors.bg.secondary
semanticColors.bg.tertiary
semanticColors.bg.hover

// Text
semanticColors.text.primary
semanticColors.text.secondary
semanticColors.text.muted
semanticColors.text.inverse

// Borders
semanticColors.border.default
semanticColors.border.emphasis

// Accents
semanticColors.accent.primary
semanticColors.accent.secondary

// Status
semanticColors.status.success  // Green
semanticColors.status.warning  // Yellow
semanticColors.status.error    // Red
semanticColors.status.info     // Cyan
```

### Font Sizes

```typescript
fontSize.xs     // 12px
fontSize.sm     // 14px
fontSize.base   // 16px  ← Body text
fontSize.lg     // 18px  ← Headings
fontSize.xl     // 20px
fontSize['2xl'] // 24px
fontSize['3xl'] // 30px
fontSize['4xl'] // 36px
```

### Border Radius

```typescript
borderRadius.sm    // 4px
borderRadius.base  // 8px
borderRadius.md    // 12px
borderRadius.lg    // 16px  ← Cards
borderRadius.xl    // 24px
borderRadius.pill  // 9999px ← Fully rounded
borderRadius.circle // 50%
```

### Shadows

```typescript
shadow.sm  // Small
shadow.md  // Medium ← Cards
shadow.lg  // Large
shadow.xl  // Extra large
```

### Durations & Easing

```typescript
duration.instant // 100ms
duration.fast    // 200ms
duration.normal  // 300ms ← Default
duration.slow    // 500ms

easing.easeIn
easing.easeOut
easing.easeInOut  ← Default
easing.spring
```

---

## Component Template

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

interface MyComponentProps {
  title: string
  onClick?: () => void
}

/**
 * MyComponent - Brief description
 *
 * @example
 * <MyComponent title="Hello" onClick={() => {}} />
 */
export default function MyComponent({
  title,
  onClick
}: MyComponentProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      style={{
        padding: spacing[4],
        backgroundColor: semanticColors.bg.secondary,
        borderRadius: borderRadius.lg,
        boxShadow: shadow.md,
        transition: `all ${duration.normal}`,
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
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

---

## Common Patterns

### Button

```typescript
<button
  onClick={handleClick}
  disabled={isLoading}
  style={{
    padding: `${spacing[2]} ${spacing[4]}`,
    backgroundColor: semanticColors.accent.primary,
    color: semanticColors.text.inverse,
    border: 'none',
    borderRadius: borderRadius.pill,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.6 : 1,
    transition: `all ${duration.fast}`
  }}
>
  {isLoading ? 'Loading...' : 'Click me'}
</button>
```

### Card

```typescript
<div style={{
  padding: spacing[4],
  backgroundColor: semanticColors.bg.secondary,
  borderRadius: borderRadius.lg,
  border: `1px solid ${semanticColors.border.default}`,
  boxShadow: shadow.md
}}>
  <h3 style={{
    fontSize: fontSize.lg,
    marginBottom: spacing[2]
  }}>
    Card Title
  </h3>
  <p style={{
    fontSize: fontSize.sm,
    color: semanticColors.text.secondary
  }}>
    Card content
  </p>
</div>
```

### Input

```typescript
<input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Enter text..."
  style={{
    width: '100%',
    padding: spacing[2],
    fontSize: fontSize.base,
    color: semanticColors.text.primary,
    backgroundColor: semanticColors.bg.primary,
    border: `1px solid ${semanticColors.border.default}`,
    borderRadius: borderRadius.base,
    outline: 'none'
  }}
/>
```

### Modal

```typescript
{isOpen && (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex.modal
    }}
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: semanticColors.bg.primary,
        borderRadius: borderRadius.lg,
        padding: spacing[6],
        maxWidth: '500px',
        width: '90%',
        boxShadow: shadow.xl
      }}
    >
      {children}
    </div>
  </div>
)}
```

### Loading Spinner

```typescript
<div
  style={{
    width: spacing[8],
    height: spacing[8],
    border: `4px solid ${semanticColors.border.default}`,
    borderTop: `4px solid ${semanticColors.accent.primary}`,
    borderRadius: borderRadius.circle,
    animation: 'spin 1s linear infinite'
  }}
/>

// Add to global CSS:
// @keyframes spin {
//   to { transform: rotate(360deg); }
// }
```

---

## API Integration

### Import

```typescript
import { apiClient } from '@/lib/api'
```

### Common Calls

```typescript
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

// Update task
await apiClient.updateTaskStatus('task-123', 'completed')

// Get energy level
const energy = await apiClient.getEnergyLevel('demo-user')
```

### Error Handling

```typescript
try {
  const data = await apiClient.getTasks({ user_id: 'demo-user' })
  setTasks(data)
} catch (error) {
  console.error('Failed to fetch tasks:', error)
  setError('Failed to load tasks')
}
```

---

## Custom Hooks

### useVoiceInput

```typescript
import { useVoiceInput } from '@/hooks/useVoiceInput'

const {
  isListening,
  transcript,
  startListening,
  stopListening,
  resetTranscript
} = useVoiceInput({
  onTranscript: (text) => console.log('Final:', text),
  continuous: true,
  lang: 'en-US'
})
```

### useWebSocket

```typescript
import { useWebSocket } from '@/hooks/useWebSocket'

const { isConnected, sendMessage } = useWebSocket({
  userId: 'demo-user',
  onMessage: (data) => console.log('Received:', data)
})
```

### useTheme

```typescript
import { useTheme } from '@/contexts/ThemeContext'

const { mode, colors, toggleTheme } = useTheme()

<div style={{ backgroundColor: colors.background }}>
  Current theme: {mode}
</div>
```

---

## State Patterns

### Simple State

```typescript
const [count, setCount] = useState(0)
const [isOpen, setIsOpen] = useState(false)
const [text, setText] = useState('')
```

### Object State

```typescript
const [form, setForm] = useState({
  name: '',
  email: ''
})

// Update single field
setForm(prev => ({ ...prev, name: 'John' }))
```

### Array State

```typescript
const [items, setItems] = useState<Item[]>([])

// Add item
setItems(prev => [...prev, newItem])

// Remove item
setItems(prev => prev.filter(item => item.id !== itemId))

// Update item
setItems(prev => prev.map(item =>
  item.id === itemId ? { ...item, ...updates } : item
))
```

---

## Framer Motion

### Fade In

```typescript
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Slide Up

```typescript
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: -20, opacity: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Stagger Children

```typescript
<motion.div
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
  initial="hidden"
  animate="visible"
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.title}
    </motion.div>
  ))}
</motion.div>
```

---

## Accessibility

### ARIA Labels

```typescript
<button aria-label="Close modal">
  <XIcon aria-hidden="true" />
</button>

<input
  type="text"
  aria-label="Search tasks"
  aria-required="true"
/>

<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

### Keyboard Navigation

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      onClick?.()
      break
    case 'Escape':
      onClose?.()
      break
  }
}

<div
  tabIndex={0}
  role="button"
  onKeyDown={handleKeyDown}
>
  Interactive element
</div>
```

---

## Storybook Story Template

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import MyComponent from './MyComponent'

const meta: Meta<typeof MyComponent> = {
  title: 'Mobile/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary']
    }
  }
}

export default meta
type Story = StoryObj<typeof MyComponent>

export const Default: Story = {
  args: {
    title: 'Hello World',
    variant: 'primary'
  }
}
```

---

## Commands Cheat Sheet

```bash
# Development
npm run dev              # Next.js dev server (port 3000)
npm run storybook        # Storybook dev server (port 6006)

# Build
npm run build            # Production build
npm run build-storybook  # Build Storybook

# Quality
npm run type-check       # TypeScript checking
npm run lint             # ESLint
npm run lint:fix         # Auto-fix linting
npm run test             # Run tests
npm run test:coverage    # Tests with coverage
```

---

## File Paths

```
Template:          src/components/_TEMPLATE.tsx
Design System:     src/lib/design-system.ts
API Client:        src/lib/api.ts
Theme Context:     src/contexts/ThemeContext.tsx
Voice Hook:        src/hooks/useVoiceInput.ts
WebSocket Hook:    src/hooks/useWebSocket.ts
Capture Flow Hook: src/hooks/useCaptureFlow.ts
```

---

## Import Aliases

```typescript
import Component from '@/components/Component'  // @/ = src/
import { api } from '@/lib/api'
import type { Task } from '@/types/task'
```

---

**Quick Reference • Last Updated: October 28, 2025**
